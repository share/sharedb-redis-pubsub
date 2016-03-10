var RedisPubSub = require('../index');

require('sharedb/test/pubsub')(function(callback) {
  callback(null, RedisPubSub());
});
