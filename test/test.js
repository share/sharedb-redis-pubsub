var redisPubSub = require('../index');
var redis = require('redis');
var runTestSuite = require('sharedb/test/pubsub');

describe('default options', function() {
  runTestSuite(function(callback) {
    callback(null, redisPubSub());
  });
});

describe('unconnected client', function() {
  runTestSuite(function(callback) {
    callback(null, redisPubSub({
      client: redis.createClient()
    }));
  });
});

describe('connected client', function() {
  var client;

  beforeEach(function(done) {
    client = redis.createClient();
    client.connect().then(function() {
      done();
    }, done);
  });

  runTestSuite(function(callback) {
    callback(null, redisPubSub({
      client: client
    }));
  });
});

describe('connecting client', function() {
  runTestSuite(function(callback) {
    var client = redis.createClient();
    client.connect();
    callback(null, redisPubSub({
      client: client
    }));
  });
});
