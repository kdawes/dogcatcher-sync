'use strict'
var React = require('react')
var ent = require('ent')
var selectn = require('selectn')
var request = require('request')
var _ = require('lodash')

var createFragment = require('react-addons-create-fragment')
var Router = require('react-router').Router
var Route = require('react-router').Route
var Link = require('react-router').Link

// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../../css/app.css')

var AppDispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')
var UrlDataStore = require('../stores/UrlDataStore')
var ConfigStore = require('../stores/ConfigStore')

var ListItem = React.createClass({
  render: function () {
    return (
    <div className="table-view-cell media">
       <img  className="media-object small pull-left" src={this.props.image} />
       <h3><Link to={'/feeds/' + this.props.id}>{this.props.title}</Link></h3>
       <br/>
      {this.props.count} Episodes
    </div>
    )
  }
})
var FeedItem = React.createClass({
  render: function () {
    function createMarkup (txt) { return { __html: txt }}
    var decoded = null
    try {
      decoded = createMarkup(ent.decode(this.props.description))
    } catch(e) {
      console.log('invalid ' + e)
    }
    var e = createFragment({
      a: <div key='decoded' dangerouslySetInnerHTML={decoded}></div>
    })
    return (
    <div>
      <div key='feedItem'>
        <div key='container' className="table-view-cell media">
          <h3>{this.props.title}</h3>
          <div key='publishedDate'>{this.props.pubDate}</div>
          <div key='shownotes'>Show Notes : <a href={this.props.link}>{this.props.link}</a></div>
          <div key='audio'>Audio :<a href={this.props.audioLink}>{this.props.audioLink}</a></div>
          {e}
        </div>
      </div>
    </div>
    )
  }
})

var Feed = React.createClass({
  getInitialState: function () {
    return ({
      imgCache: {}
    })
  },
  _onChange: function () {
    console.log('_onChange FEED')
  },
  componentWillUnmount: function () {
    UrlDataStore.removeChangeListener(this._onChange)
  },
  componentDidMount: function () {
    UrlDataStore.addChangeListener(this._onChange)
  },
  cacheThumbnail: function (url, id) {
    var self = this
    if (!self.state.imgCache[id]) {
      request.post({
        uri: 'http://localhost:5454/maps',
        json: true,
        body: { 'url': url }
      }, function (e, r, b) {
        if ( e ) {  console.log('error ! ' + e);  return callback(e, null) }
        let imgCache = _.cloneDeep(self.state.imgCache)
        imgCache[id] = b.url
        self.setState({imgCache: imgCache})
      })
    }
  },
  render: function () {
    const id = this.props.params.id
    var parsed = null
    var raw = UrlDataStore.get('http://localhost:7777/feeds/' + id)
    if (!raw) {
      UrlDataStore.init('http://localhost:7777/feeds/' + id)
      return (
      <div>'loading' {id}</div>
      )
    } else {
      parsed = JSON.parse(raw)

      // if the img isn't already thumbnailed and cached, do that
      let imgUrl = null
      if (!this.state.imgCache[id]) {
        imgUrl = selectn('rss.channel.itunes:image.href', parsed)
        this.cacheThumbnail(imgUrl, id)
      } else {
        imgUrl = this.state.imgCache[id]
      }
      var sub = selectn('rss.channel.itunes:subtitle', parsed)

      var k = 0
      return (
      <div>
          <div className='container-fluid'>
            <div className='col-md-2 table-view-cell media'>
              <h3>{parsed.rss.channel.title}</h3>
              <img className="media-object small pull-left" src={imgUrl} />
              <div>{sub}</div>
              <div><a href={parsed.rss.channel.link}>{parsed.rss.channel.link}</a></div>
            </div>
            <div className='col-md-10'>
              {
      parsed.rss.channel.item.map(function (i) {
        var audioLink = selectn('enclosure.url', i)
        var stringLink = null
        if ( typeof (i.link) === 'string') {
          stringLink = i.link
        } else {
          stringLink = null
        }

        //      console.log('audioLink ' + audioLink + '\n title ' + i.title + '\n pubDate ' + i.pubDate + '\n link ' + stringLink + '\n description ' + i.description)

        return <FeedItem  key={++k} audioLink={audioLink} title={i.title} pubDate={i.pubDate} link={stringLink} description={i.description}></FeedItem>
      })
      }
            </div>
          </div>
        </div>
      )
    }
  }
})

var ListThing = React.createClass({
  render: function () {
    var raw = UrlDataStore.get('http://localhost:7777/feeds')
    if (raw) {
      var parsed = JSON.parse(raw)
      var list = parsed.map(function (i) {
        // console.log('using ' + JSON.stringify(i, null, 2))
        return <ListItem key={i._id} id={i._id} image={i.image} url={i.url} title={i.title} count={i.count}></ListItem>
      })
      return (
      <div>{list}</div>
      )
    } else {
      return (
      <div>Loading...</div>
      )
    }
  }
})

var App = React.createClass({
  _onChange: function () {
    console.log('_onChange')
    var config = ConfigStore.get()
    this.setState({config: config || {}})
  },
  getInitialState: function () {
    console.log('getInitialState fired')
    var config = ConfigStore.get()
    return { config: config || {}}
  },
  componentDidMount: function () {
    UrlDataStore.init('http://localhost:7777/feeds')
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
    <div>
        <div className={'container-fluid'}>
          <Router>
            <div className='col-md-2'>
            </div>
            <div className='col-md-10'>
             <Route path="/" component={ListThing}/>
              <Route path="/feeds/:id" component={Feed}/>
            </div>
          </Router>
        </div>
      </div>
    )
  }
})

exports = module.exports = App
