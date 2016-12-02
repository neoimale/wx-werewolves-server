var _ = require('underscore');
var util = require('./util');
// var winston = require('winston');
// var moment = require('moment');

// 使winston的日志着色生效
// winston.cli();

// function showlog(req) {
// 	if (_.isEmpty(req._novaLogs)) return ;
// 	var reqId = req._novaRequestId;
// 	req._novaLogs.splice(0, 0, {
// 		level: 'info',
// 		message: '[' + moment(req._novaStart).format('H:mm:ss') + ']  request start: ' + req.originalUrl
// 	});
// 	req._novaLogs.push({
// 		level: 'info',
// 		message: '[' + moment().format('H:mm:ss') + ']  request done, cost ' + (Date.now() - req._novaStart) + 'ms'
// 	});
// 	_.each(req._novaLogs, function (log) {
// 		var msgFormat = '#%d   %s';
// 		if (log.level == 'error') {
// 			winston.error(msgFormat, reqId, log.message);
// 		} else {
// 			winston.info(msgFormat, reqId, log.message);
// 		}
// 	});
// 	console.log('\r\n');
// }

module.exports = function () {
	return function (req, res, next) {
		req.query = req.query || {};
		req._novaLogs = [];
		_.extend(req.query, req.body);

		var end = res.end;

		res.endj = function (data) {
			if (data instanceof Error) {
				var e = data;
				data = {
					code: -1,
					message: e.stack || e.message || e.toString(),
					error: e 
				}
			}
			end.call(res, JSON.stringify(data));
			// showlog(req);
		};

		// res.end = function (data) {
		// 	end.call(res, data);
		// 	showlog(req);
		// };

		next();
	};
};