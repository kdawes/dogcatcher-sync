var parser = require('xml2json');

process.stdin.resume();
process.stdin.setEncoding('utf8');

var data = "";

process.stdin.on('data', function(chunk) {
  data += chunk;
});

process.stdin.on('end', function() {
  var obj = parser.toJson(data);
  console.log(obj);
  //inspectIt(obj, 1);
});

function tabs( n ) {
  var ntmp = n || 1;
  return Array(ntmp).join("\t");
}

function inspectIt( obj, depth ) {
  var o = JSON.parse(obj);
  for( var i in o ) {
    var type = typeof(o[i]);
    console.log(tabs(depth) + i + " : " + type);
    if ( type === 'object' ) { 
     inspectIt(JSON.stringify(o[i]), (depth + 1));
   }
 }
}
