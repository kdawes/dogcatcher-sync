'use strict'
var EventEmitter = require('events').EventEmitter
var _ = require('lodash')

var urls = {}

var DataStore = _.extend({}, EventEmitter.prototype, {
  init: function (url, cb) {
    console.log('init Datastore ' + url)
    var callback = cb || function () {}
    if (urls[url]) { return callback(null, null) }
    getUrl(url, function fetchUrl (e, r) {
      if ( e ) return callback('Error ' + e, null)
      urls[url] = r
      this.emitChange()
      console.log('done')
      return callback(null, null)
    }.bind(this))
  },
  get: function (url) {
    return urls[url]
  },
  emitChange: function () {
    console.log('emitChange : urldatastore')
    this.emit('change')
  },
  addChangeListener: function (callback) {
    this.on('change', callback)
  },
  removeChangeListener: function (callback) {
    this.removeListener('change', callback)
  }
})

function getUrl (url, cb) {
  if (!url) throw new Error('getBytes(url,cb) - url is required')
  console.log('getBytes', ' url ', url)
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.onload = function (e) {
    console.log('XHR load')
    console.log('WE GOT ', this.response.length)
    cb(null, this.response)
  }
  console.log('XHR SEND')
  xhr.send()
}

exports = module.exports = DataStore
