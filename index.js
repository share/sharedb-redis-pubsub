var redis = require('redis');
var PubSub = require('sharedb').PubSub;

// Redis pubsub driver for ShareDB.
//
// The redis driver requires two redis clients (a single redis client can't do
// both pubsub and normal messaging). These clients will be created
// automatically if you don't provide them.
function RedisPubSub(options) {
  if (!(this instanceof RedisPubSub)) return new RedisPubSub(options);
  PubSub.call(this, options);
  options || (options = {});

  this.client = options.client || redis.createClient(options);
  this._clientConnection = null;

  // Redis doesn't allow the same connection to both listen to channels and do
  // operations. Make an extra redis connection for subscribing with the same
  // options if not provided
  this.observer = options.observer || redis.createClient(this.client.options);
  this._observerConnection = null;

  this._connect();
}
module.exports = RedisPubSub;

RedisPubSub.prototype = Object.create(PubSub.prototype);

RedisPubSub.prototype.close = function(callback) {
  if (!callback) {
    callback = function(err) {
      if (err) throw err;
    };
  }
  var pubsub = this;
  PubSub.prototype.close.call(this, function(err) {
    if (err) return callback(err);
    pubsub._close().then(function() {
      callback();
    }, callback);
  });
};

RedisPubSub.prototype._close = function() {
  return this._closing = this._closing || this._connect().then(Promise.all([
    this.client.quit(),
    this.observer.quit()
  ]));
};

RedisPubSub.prototype._subscribe = function(channel, callback) {
  var pubsub = this;
  pubsub.observer
    .subscribe(channel, function(message) {
      var data = JSON.parse(message);
      pubsub._emit(channel, data);
    })
    .then(function() {
      callback();
    }, callback);
};

RedisPubSub.prototype._unsubscribe = function(channel, callback) {
  this.observer.unsubscribe(channel)
    .then(function() {
      callback();
    }, callback);
};

RedisPubSub.prototype._publish = function(channels, data, callback) {
  var message = JSON.stringify(data);
  var args = [message].concat(channels);
  this.client.eval(PUBLISH_SCRIPT, {arguments: args}).then(function() {
    callback();
  }, callback);
};

RedisPubSub.prototype._connect = function() {
  this._clientConnection = this._clientConnection || connect(this.client);
  this._observerConnection = this._observerConnection || connect(this.observer);
  return Promise.all([
    this._clientConnection,
    this._observerConnection
  ]);
};

function connect(client) {
  return client.isOpen ? Promise.resolve() : client.connect();
}

var PUBLISH_SCRIPT =
  'for i = 2, #ARGV do ' +
    'redis.call("publish", ARGV[i], ARGV[1]) ' +
  'end';
