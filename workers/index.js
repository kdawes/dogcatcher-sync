var parser = require('xml2json'),
  Transform = require('stream').Transform,
  Path = require('path'),
  fs = require('fs'),
  log = console.log.bind(console),
  JSONStream = require('JSONStream'),
  request = require('request')
var es = require('event-stream')

var chokidar = require('chokidar'),
  watcher = chokidar.watch('../api/uploads', {
    ignored: /[\/\\]\./,
    persistent: true,
    usePolling: true,
    interval: 100
  }).on('add', function (path) {
    var resolved = Path.resolve(path)
    doItJsonStream(resolved)
  }).on('error', function (error) {
    log('ERROR : ', error)
  })

// This buffers up the whole thing :-/
function xmlTransformer () {
  var transform = new Transform()
  var buf = []
  transform._transform = function (chunk, encoding, done) {
    try {
      buf.push(chunk)
    } catch (error) {
      console.log('Oh Shit, thats an error' + error)
    }
    done()
  }

  transform._flush = function (done) {
    transform.push(parser.toJson(buf.join('')))
    done()
  }

  transform.on('error', function (err) {
    log(err)
  })

  return transform
}

function doItJsonStream (file) {
  console.log('doitJsonStream' + file)
  fs.createReadStream(file).pipe(xmlTransformer())
    .pipe(JSONStream.parse('opml.outline.*'))
    .pipe(es.mapSync(function (data) {
      // make a reasonable file name
      var result = data.xmlUrl.replace(/.*:\/\//g, '').replace(/\//g, '')
      var fn = ['./working_data/', result, '.json'].join('')
      var os = fs.createWriteStream(fn)
      os.on('error', function (e) { console.log('ERROR ' + e) })
      request(data.xmlUrl)
        .pipe(xmlTransformer())
        .pipe(os)
    }))
}
