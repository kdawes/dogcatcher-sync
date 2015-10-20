'use strict'
var director = require('director')
var union = require('union')
var formidable = require('formidable')
var router = new director.http.Router()
var util = require('util')
var log = console.log.bind(console)
var hat = require('hat')
var Pouchdb = require('pouchdb')
Pouchdb.plugin(require('pouchdb-find'))
var selectn = require('selectn')
var assert = require('assert')
var _ = require('lodash')

// Data structures
// #TODO lru and age out to persistent storage
var metadataCache = []
var db = new Pouchdb('./db')
var meta = new Pouchdb('./metadata')

// XXX to config
var UPLOAD_DIR = './uploads'

// Router handlers
function handleUpload () {
  var req = this.req
  var res = this.res
  var form = new formidable.IncomingForm()
  form.uploadDir = UPLOAD_DIR
  form.on('field', function (field, value) {
    log(field, value)
  }).on('file', function (field, file) {
    log('field :  ', field, 'filename : ', file)
  }).on('progress', function (rec, expected) {
    var limit = 16 * 1024 * 1024 // they say 640k should be enough for anybody ;)
    log('Progres: expected ', expected, ' limit ', limit)
    if (expected >= limit) {
      res.writeHead(500, { 'Content-type': 'text/plain' })
      res.err('file limit exceeded')
      log('ERROR', 'file limit exceeded : ', expected, ' Limit : ', limit)
      return
    }
    log('progress: ', rec, ' of ', expected)
  }).parse(req, function (err, fields, files) {
    log('Parsed file upload : Have error ? ? : ', err)
    if (err) {
      res.writeHead(500, { 'Contenty-type': 'text/plain' })
      res.end('Thats an error: Upload failed: ' + err)
    } else {
      log(JSON.stringify(files, null, 2))
      assert(files, 'no files object parsed?')
      assert(files.fileKey.path, 'no patch object available')

      stashMetadata({
        _id: files.fileKey.path,
        data: {
          'size': files.fileKey.size,
          'path': files.fileKey.path,
          'name': files.fileKey.name,
          'type': files.fileKey.type,
          'mtime': files.fileKey.mtime
        },
        userId: hat(), // XXX FIXME
        timestamp: new Date().getTime()
      })
      res.writeHead(200, { 'Content-type': 'text/plain' })
      res.end('ok')
    }
  })
}

// naive - just return everything
function getMetadata () {
  var res = this.res
  res.writeHead(200, {'Content-type': 'application/json'})
  log('parameters' + util.inspect(this.req.query))
  meta.allDocs({include_docs: true}).then(function (r) {
    res.json(r)
  })
}

// helper Functions

function stashMetadata (opts) {
  if (!opts) throw new Error('stashMetadata called with no data :()')
  meta.post(opts).then(function (r) {
    console.log('new metadata obj created' + JSON.stringify(r))
  }).catch(function (e) {
    log(eString)
  })
}

// Handle the post from the phone / mobile with the exported OPML file
router.post('/dcsync', {stream: true}, handleUpload)

// The watcher parses the OPML file, identifies the feeds, pulls down
// each feed, xforms it to JSON and POSTS it here
router.post('/feeds', {stream: true}, function () {
  var concat = require('concat-stream')
  this.req.pipe(concat(function (body) {
    var eString = null
    try {
      // body is a buffer.
      var obj = JSON.parse(body.toString('utf-8'))
      db.post(obj).then(function (r) {
        console.log('new id created' + JSON.stringify(r))
      }).catch(function (e) {
        eString = e.toString()
        log(eString)
      })
    } catch (e) {
      eString = e.toString()
      log('nope ', eString)
    }
    this.res.end(eString)
  }.bind(this)))
})

// rolled up listing of the feeds with title. image, showcount
router.get('/feeds', function () {
  console.log('get /feeds')
  db.allDocs({include_docs: true}).then(function (r) {
    var rr = []
    r.rows.forEach(function (f) {
      var img = selectn('doc.rss.channel.itunes:image.href', f)
      var shows = selectn('doc.rss.channel.item', f).length
      var s = {
        'title': f.doc.rss.channel.title,
        '_id': f.doc._id,
        'image': img || 'nope',
        'count': shows
      }
      rr.push(s)
    })
    this.res.json(rr)
  }.bind(this))
})

// returns a particular feed
router.get('/feeds/:id', function (id) {
  var res = this.res
  var req = this.req
  log('parameters' + util.inspect(this.req.query))
  db.get(id).then(function (doc) {
    res.writeHead(200, {
      'Contenty-type': 'application/json'
    })
    var map = selectn('query.map', req)
    if (map) {
      log('req.query.map', map)
      res.json(selectn(map, doc))
    } else {
      res.json(doc)
    }
    res.end()
  }).catch(function (err) {
    res.writeHead(500, { 'Content-type': 'text/plain' })
    res.end(err)
  })
})

router.get('/metadata', {stream: false}, getMetadata)
router.get('/', {stream: false}, queryFn)

function queryFn () {
  console.log('queryfn .... ')
  db.allDocs({include_docs: true}).then(function (r) {
    this.res.json(r)
  }.bind(this))
}

var server = union.createServer({
  buffer: false,
  before: [
    function (req, res) {
      router.dispatch(req, res, function (err) {
        if (err) {
          res.writeHead(404)
          res.end()
        }
      })
    }]
})
server.listen(7777)
console.log('Server listening : 7777')
