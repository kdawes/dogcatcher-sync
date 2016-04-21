'use strict'
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
function xmlTransformer (url) {
  console.log('xmlTransform ' + url)
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
    var pp = parser.toJson(buf.join(''))
    if (pp) { transform.push(pp) } else {
      console.log('no pp for url on ' + url + ' \n ' + buf.join(''))
    }
    console.log('done ' + url)
    done()
  }
  transform.on('error', function (err) {
    console.log('transform error' + err)
  })
  return transform
}

// we get an opml / xml formatted document.
// the magic here is the JSONStream.parse('opml.outline.*'), which gives us the
// URLS to the RSS feeds of the podcasts.  we then pull down those RSS feeds
// and transform them to JSON, finally piping them to the FS ( eventually zmq )
// before being processed
function doItJsonStream (file) {
  var rs = fs.createReadStream(file)
  rs.on('error', function (e) {
    if (e) {
      console.log('doItJsonStream : error: ' + e)
      throw new Error(e)
      return
    }
  })

  rs.pipe(xmlTransformer())
    .pipe(JSONStream.parse('opml.outline.*'))
    .pipe(es.mapSync(function (d) {
      request(d.xmlUrl, function (e, r, b) {
        if (e) {
          console.log('doItJsonStream : request error : ', e)
          throw new Error(e)
          return
        }
        if (r.statusCode !== 200) {
          console.log('body.length' + b.length)
          console.log('statusCode ' + r.statusCode)
          console.log(' :: ' + JSON.stringify(d))
        }
      }).pipe(xmlTransformer(d.xmlUrl)) // url passed in for debug
        .pipe(es.mapSync(function (data) {
          // we want to tag the upload / metadata file into this for future use
          var js = JSON.parse(data)
          js.metadata_id = file || hat()
          request.post({
            uri: 'http://localhost:7777/feeds',
            json: true,
            body: js
          }).on('error', function (e) {
            console.log('es feeds post error : ', e)
          })
        }))
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

process.on('uncaughtException', function (er) {
  console.error(er.stack)
  process.exit(1)
})
