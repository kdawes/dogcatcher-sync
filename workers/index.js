var parser = require('xml2json')
var Transform = require('stream').Transform
var Path = require('path')
var fs = require('fs')
var log = console.log.bind(console)
var JSONStream = require('JSONStream')
var request = require('request')
var es = require('event-stream')
var chokidar = require('chokidar')

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

// we get an opml / xml formatted document.
// the magic here is the JSONStream.parse('opml.outline.*'), which gives us the
// URLS to the RSS feeds of the podcasts.  we then pull down those RSS feeds
// and transform them to JSON, finally piping them to the FS ( eventually zmq )
// before being processed
function doItJsonStream (file) {
  fs.createReadStream(file).pipe(xmlTransformer())
    .pipe(JSONStream.parse('opml.outline.*'))
    .pipe(es.mapSync(function (data) {
      // make a reasonable file name
      var result = data.xmlUrl.replace(/.*:\/\//g, '').replace(/\//g, '')
      var fn = ['./working_data/', result, '.json'].join('')
      var os = fs.createWriteStream(fn)
      os.on('error', function (e) { console.log('ERROR ' + e) })
      // pull down the rss feed.  the request module follows redirects
      // automagically
      request(data.xmlUrl)
        .pipe(xmlTransformer())
        .pipe(os)
    }))
}

// Application logic - file watcher / chokidar

chokidar.watch('../api/uploads', {
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
