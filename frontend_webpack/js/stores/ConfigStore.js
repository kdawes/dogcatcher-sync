var AppDispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')
var EventEmitter = require('events').EventEmitter
var _ = require('lodash')

var ConfigStore = _.extend({}, EventEmitter.prototype, {
  get: function () { return {} },
  emitChange: function () {
    console.log('emitChange config')
    this.emit('change')
  },
  addChangeListener: function (callback) {
    this.on('change', callback)
  },
  removeChangeListener: function (callback) {
    this.removeListener('change', callback)
  }
})

function onPropsChange (d) {
  console.log('onPropsChange ' + JSON.stringify(d, null, 2))
  if (d.action.actionType === ActionTypes.PROPS_UPDATED) {
    ConfigStore.emitChange()
  }
}

AppDispatcher.register(onPropsChange)

exports = module.exports = ConfigStore
