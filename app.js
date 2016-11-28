var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bluebird = require('bluebird');
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var qcloud = require('qcloud-weapp-server-sdk');
qcloud.config({
	ServerHost: 'localhost',
	AuthServerUrl: '',
	TunnelServerUrl: 'https://ws.qcloud.com',
	TunnelSignatureKey: 'm84mUQQtwbqK2PpRgwyeFPpxq7p2Hj'
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('redis-middleware')());
app.use(require('./utils/log-middleware')());

app.use('/room', require('./router/room'));
app.use('/login', require('./router/login'));
app.use('/user', require('./router/user'));
app.use('/tunnel', require('./router/tunnel'));

var server = require('http').createServer(app);
server.listen(3001, function() {
	console.log('app listening at http://localhost:' + server.address().port);
})