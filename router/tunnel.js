var TunnelService = require('qcloud-weapp-server-sdk').TunnelService;
var TunnelHandler = require('../business/tunnel-handler');

module.exports = function(req, res) {
	var service = new TunnelService(req, res);
	var handler = new TunnelHandler();
	service.handle(handler, {checkLogin: false});
}