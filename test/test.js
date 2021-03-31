var redisPubSub = require('../index');

require('sharedb/test/pubsub')(function(callback) {
  callback(null, redisPubSub());
});
