var AppDispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')

var Actions = {
  foo: function (data) {
    console.log('Fooooooo ' + JSON.stringify(data))
    AppDispatcher.handleAction({
      actionType: ActionTypes.FOO,
      data: data
    })
  }
}

module.exports = Actions
