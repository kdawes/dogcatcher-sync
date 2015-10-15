// TODO authentication
// Tools
var http = require('http'),
  director = require('director'),
  cycle = require('cycle'),
  union = require('union'),
  formidable = require('formidable'),
  router = new director.http.Router(),
  util = require('util'),
  fs = require('fs'),
  log = console.log.bind(console)
hat = require('hat')

// Data structures
// #TODO lru and age out to persistent storage
var metadataCache = []

// Router handlers
function handleUpload () {
  var req = this.req
  var res = this.res
  var form = new formidable.IncomingForm()
  form.uploadDir = './uploads'
  form.on('field', function (field, value) {
    log(field, value)
  }).on('file', function (field, file) {
    log('field :  ', field, 'filename : ', file)
  }).on('progress', function (rec, expected) {
    var limit = 16 * 1024 * 1024; // 640k should be enough for anybody ;)
    log('Progres: expected ', expected, ' limit ', limit)
    if (expected >= limit) {
      res.writeHead(500, { 'Content-type': 'text/plain' })
      res.err('file limit exceeded')
      log('ERROR', 'file limit exceeded : ', expected, ' Limit : ', limit)
      return
    }
    console.log('progress: ' + rec + ' of ' + expected)
  }).parse(req, function (err, fields, files) {
    console.log('Parsed file upload : Error ? : ' + err)

    if (err) {
      res.writeHead(500, { 'Contenty-type': 'text/plain' })
      res.end('Thats an error: Upload failed: ' + err)
    } else {
      res.writeHead(200, { 'Content-type': 'text/plain' })
      stashMetadata({id: hat(), files, userId: 'XXXXX-YYYYY-zzzz-aaaa', timestamp: new Date().getTime() })
      res.end('ok')
    }
  })
}

// naive - just return everything
function getMetadata () {
  var req = this.req, res = this.res
  res.writeHead(200, {'Content-type': 'application/json'})
  res.json(metadataCache)
  console.log('getMetadata ' + JSON.stringify(metadataCache, null, 2))
}

// helper Functions

function stashMetadata (opts) {
  if ( ! opts || !opts.files || ! opts.files.fileKey) {
    throw new Error('ERROR - phonegap app changed the contract / data model. Expected : opts.files.fileKey.xxxxfilenamexxxx')
  }

  metadataCache.push(opts)
}

router.post('/dcsync', { stream: true }, handleUpload)
router.get('/metadata', { stream: true }, getMetadata)

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
