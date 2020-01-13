# sharedb-redis-pubsub

  [![NPM Version](https://img.shields.io/npm/v/sharedb-redis-pubsub.svg)](https://npmjs.org/package/sharedb-redis-pubsub)
  [![Build Status](https://travis-ci.org/share/sharedb-redis-pubsub.svg?branch=master)](https://travis-ci.org/share/sharedb-redis-pubsub)
  [![Coverage Status](https://coveralls.io/repos/github/share/sharedb-redis-pubsub/badge.svg?branch=master)](https://coveralls.io/github/share/sharedb-redis-pubsub?branch=master)

Redis pub/sub adapter adapter for ShareDB.

This ShareDB add-on gives you horizontal scalability; the ability to have a cluster of multiple server nodes rather than just a single server. Using this adapter, clients can connect to any machine in your cluster, and the ops they submit will be forwarded clients connected through other nodes, and there will be no race conditions with regard to persistence.

## Usage

This snippet shows how to load this library and pass it into a new ShareDB instance.

```js
// Redis client is an existing redis client connection
var redisPubsub = require('sharedb-redis-pubsub')({client: redisClient});

var backend = new ShareDB({
  db: db,  // db would be your mongo db or other storage location
  pubsub: redisPubsub
});
```
