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

  // Redis doesn't allow the same connection to both listen to channels and do
  // operations. Make an extra redis connection for subscribing with the same
  // options if not provided
  this.observer = options.observer || redis.createClient(this.client.options);

  var pubsub = this;
  this.observer.on('message', function(channel, message) {
    var data = JSON.parse(message);
    pubsub._emit(channel, data);
  });
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
    pubsub.client.quit(function(err) {
      if (err) return callback(err);
      pubsub.observer.quit(callback);
    });
  });
};

RedisPubSub.prototype._subscribe = function(channel, callback) {
  this.observer.subscribe(channel, callback);
};

RedisPubSub.prototype._unsubscribe = function(channel, callback) {
  this.observer.unsubscribe(channel, callback);
};

RedisPubSub.prototype._publish = function(channels, data, callback) {
  var message = JSON.stringify(data);
  var args = [PUBLISH_SCRIPT, 0, message].concat(channels);
  this.client.eval(args, callback);
};

var PUBLISH_SCRIPT =
  'for i = 2, #ARGV do ' +
    'redis.call("publish", ARGV[i], ARGV[1]) ' +
  'end';
