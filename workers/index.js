var parser = require('xml2json'),
Transform = require('stream').Transform,
Path = require('path'),
fs = require('fs'),
log = console.log.bind(console);

var chokidar = require('chokidar'),
watcher = chokidar.watch('../api/uploads', {
  ignored: /[\/\\]\./,
  persistent: true,
  usePolling:true,
  interval: 100
}).on('add', function(path) {
  var resolved = Path.resolve(path);
  log('File', resolved, 'has been added');
  doIt(resolved);
}).on('error', function(error) {
  log('ERROR : ', error);
});


function xmlTransformer() {
  var transform = new Transform();
  transform._transform = function(chunk, encoding, done) {
    chunk = parser.toJson(chunk.toString());
    this.push(chunk);
    done();
  };
  transform.on('error', function(err) {
    log(err);
  });

  return transform;
}

function doIt(file) {
  var inputStream = fs.createReadStream(file);
  if ( inputStream ) {
    inputStream.pipe(xmlTransformer()).pipe(process.stdout);
  } else {
    log("ERROR : doIt : ", file);
  }
}
