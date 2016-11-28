var router = require('express').Router();

router.post('/info', function(req, res) {
    if (!req.query.sessionid) {
        res.endj({
            code: -1,
            message: 'no sessionid in params'
        })
        return;
    }
    req.redis.hsetAsync('session:' + req.query.sessionid, 'user_info', req.query.rawData).then(function(){
    	res.endj({
    		code: 0,
    		message: 'success'
    	})
    }).catch(function(e) {
    	res.endj(e);
    })
})

router.get('/info', function(req, res) {
    if (!req.query.sessionid) {
        res.endj({
            code: -1,
            message: 'no sessionid in params'
        })
        return;
    }
    req.redis.hgetAsync('session:' + req.query.sessionid, 'user_info').then(function(info) {
    	res.endj({
    		code: 0,
    		data: info
    	})
    }).catch(function(e) {
    	res.endj(e);
    })
})

module.exports = router;
