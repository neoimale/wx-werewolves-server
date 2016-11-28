var express = require('express');
var app = express();
var _ = require('underscore');
var bluebird = require('bluebird');
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var server = require('http').createServer(app);

app.use(require('redis-middleware')());
app.use(require('./utils/log-middleware')())

app.use('/room', require('./router/room'));
app.use('/login', require('./router/login'));
app.use('/user', require('./router/user'));

server.listen(3001, function() {
	console.log('app listening at http://localhost:' + server.address().port);
})