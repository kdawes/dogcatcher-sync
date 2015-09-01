var http = require('http'),
  director = require('director'),
  cycle = require('cycle'),
  union= require('union'),
  formidable = require('formidable'),
  router = new director.http.Router(),
  util = require('util');

function handleUpload() {
  var req = this.req,
  res = this.res,
  form = new formidable.IncomingForm();

  form.uploadDir = "./uploads"

  console.log('Receiving file upload');
  form.on('field', function(field, value) {
    console.log(field, value);
  })
  .on('file', function(field, file) {
    console.log(field, file);
  })
  .on('progress', function(rec, expected) {
    console.log("progress: " + rec + " of " +expected);
  })
  .parse(req, function(err, fields, files) {
    console.log('Parsed file upload' + err);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (err) {
      res.end('error: Upload failed: ' + err);
    } else {
      //res.end('success: Uploaded file(s): ' + util.inspect({fields: fields, files: files}));
      res.end(JSON.stringify(files));
    }
  });
}

router.post('/dcsync', { stream: true }, handleUpload);

var server = union.createServer({
  buffer: false,
    before: [
    function (req, res) {
      router.dispatch(req, res, function (err) {
        if (err) {
          res.writeHead(404);
          res.end();
        }
      });
    }]
  });
  server.listen(7777);
  console.log("Server listening : 7777");
