var app = {
  initialize: function () {
    this.bindEvents()
  },
  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false)
  },
  onDeviceReady: function () {
    app.receivedEvent('deviceready')
    fr.read()
  },
  receivedEvent: function (id) {
    var parentElement = document.getElementById(id)
    var listeningElement = parentElement.querySelector('.listening')
    var receivedElement = parentElement.querySelector('.received')

    listeningElement.setAttribute('style', 'display:none;')
    receivedElement.setAttribute('style', 'display:block;')
  }
}

app.initialize()
