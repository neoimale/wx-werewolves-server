var redis = require('redis');
var TunnelHelper = require('../utils/tunnel-helper');

module.exports = function() {
	var client = redis.createClient();
	client.psubcribe('__key*@0__:*');
	client.on('pmessage', function(pattern, channel, message) {
		console.log(pattern, channel, message);
	})
}