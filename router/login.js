var router = require('express').Router();
var https = require('https');
// var uuid = require('uuid');

var CONST = require('../utils/const');
var util = require('../utils/util');

router.post('*', function(req, res) {
    if (!req.query.code) {
        res.endj({
            code: -1,
            message: 'error. No code in params'
        })
        return;
    }
    https.get('https://api.weixin.qq.com/sns/jscode2session?appid=' + CONST.APP_ID + '&secret=' + CONST.APP_SECRET +
        '&js_code=' + req.query.code + '&grant_type=authorization_code',
        function(sres) {
            var buffers = [];
            sres.on('data', function(chunk) {
                buffers.push(chunk);
            }).on('end', function() {
                try {
                    var result = JSON.parse(Buffer.concat(buffers).toString());
                    if(!result.errcode) {
                    	var sessionid = util.sha1(result['openid'] + '+' + result['session_key']);
                    	req.redis.hmset('session:' + sessionid, result, function(err) {
                    		if(!err) {
                    			req.redis.expire('session:' + sessionid, 3600 * 24); //24h过期
                    			res.endj({
                    				code: 0,
                    				data: {
                    					sessionid: sessionid
                    				}
                    			})
                    		} else {
                    			res.endj(err);
                    		}
                    	})
                    } else {
                    	res.endj({
                    		code: -1,
                    		message: '使用微信账号登录失败，请稍后重试'
                    	})
                    }
                } catch (e) {
                	res.endj(e);
                }
            })
        }).on('error', function(e) {
        	res.endj(e);
        })
})

router.get('verify', function(req, res) {
    if (!req.query.sessionid) {
        res.endj({
            code: -1,
            message: 'no sessionid in params'
        })
        return;
    }

    util.verifySession(req.query.sessionid, req.redis).then(function(rlt) {
        if(rlt) {
            res.endj({
                code: 0,
                message: 'OK'
            })
        } else {
            res.endj({
                code: 1,
                message: 'session已过期'
            })
        }
    }).catch(function(e) {
        res.endj(e);
    })
})

module.exports = router;
