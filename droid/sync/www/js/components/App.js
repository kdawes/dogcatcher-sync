'use strict'

var React = require('react')
var _ = require('lodash')

// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../../css/app.css')

var App = React.createClass({
  _onChange: function () {
    console.log('_onChange')
  },
  getInitialState: function () {
    console.log('getInitialState fired')
    return {}
  },
  componentDidMount: function () {
    // UrlDataStore.init(this.state.config.engine.dataUrl)
    ConfigStore.addChangeListener(this._onChange)
    UrlDataStore.addChangeListener(this._onChange)
  },
  componentWillUpdate: function (nextProps, nextState) {
    console.log('componentWillUpdate fired')
  },
  componentDidUpdate: function (prevProps, prevState) {
    console.log('componentDidUpdate fired')
  },
  componentWillUnmount: function () {
    console.log('componentWillUnmount fired')
    ConfigStore.removeChangeListener(this._onChange)
    UrlDataStore.removeChangeListener(this._onChange)
  },
  render: function () {
    return (
    <div>Hi!</div>
    )
  }
})

exports = module.exports = App
