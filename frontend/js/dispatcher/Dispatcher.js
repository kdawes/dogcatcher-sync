var Dispatcher = require('flux').Dispatcher

var dispatcher = new Dispatcher()

// Convenience method to handle dispatch requests
dispatcher.handleAction = function (action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  })
}

exports = module.exports = dispatcher
