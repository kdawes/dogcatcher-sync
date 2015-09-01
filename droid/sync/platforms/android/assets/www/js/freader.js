// WAT ? haha...
function updateDom( id, value, cssclass ) {
  if ( ! id || ! value ) { return ; }
  var domId = document.getElementById(id);
  if ( domId ) {
    domId.innerHTML = value;
  }

  if ( domId && cssclass && typeof(cssclass) === 'string' ) {
    //XXXfixme - only do if not already extant
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = cssclass;
    document.getElementsByTagName('head')[0].appendChild(style);
    domId.className = 'cssClass';
  }
}

function sendIt( data ) {
  var win = function (r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    updateDom('test', r.responseCode, '.cssClass { color: #0F0; }')
  }

  var fail = function (error) {
    updateDom('test', 500, '.cssClass { color: #F00; }')
    alert("An error has occurred: Code = " + error.exception);
    console.log("ERROR : " + JSON.stringify(error));
  }

  var options = new FileUploadOptions();
  options.fileKey = "file";
  options.fileName = "DoggCatcherExport.opml";
  options.mimeType = "text/x-opml";

  var ft = new FileTransfer();
  //XXXfixme
  ft.upload("file://"+fr.path, encodeURI("http://172.16.1.68:7777/dcsync"), win, fail, options);
}

function wrapper( reader ) {
    function onError(error) { 
      console.log("ERROR : wrapper " + JSON.stringify(error));
    }
    function onSuccess(fileEntry) {
      fileEntry.file(finallyRead, onError);
    }
    function finallyRead(file) {
      reader.reader.readAsText(file);
    }
    window.resolveLocalFileSystemURL("file://"+reader.path, onSuccess, onError);
}


var fr = {
    path : "",
    reader : null,
    setPath : function(path){
        //XXX FIXME TODO sanitize
        fr.path = path;
    },
    read : function(cb) {
        if ( fr.path && fr.path.length > 0 ) {
            fr.reader = new FileReader();
            fr.reader.onloadend = function(evt) {
                console.log("Completed read of file : " + fr.path + evt.target.result);
                sendIt(evt.target.result);
            }
            wrapper(fr);
        }
    }
};
//XXXfixme
fr.setPath("/storage/sdcard0/DoggCatcher/DoggCatcherExport.opml");
