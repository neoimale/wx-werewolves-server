var router = require('express').Router();
var util = require('../utils/util');
var _ = require('underscore');

router.post('/create', function(req, res) {
    // 创建房间
    util.createRoomNumber(req.redis, function(err, number) {
        if (err) {
            res.endj(err);
        } else {
            req.redis.hmsetAsync('room:' + number, 'type', req.query.type.toString(),
                'num', req.query.num.toString(), 'config', JSON.stringify(req.query.config)).then(function() {
                req.redis.expire('room:' + number, 360); //1h过期
                res.endj({
                    code: 0,
                    data: { id: number }
                })
            })

        }
    })
})

router.get('/get/:number', function(req, res) {
    // 获取房间信息
    req.redis.hgetall('room:' + req.params.number, function(err, data) {
        if (err) {
            res.endj(err);
        } else {
            res.endj({
                code: 0,
                data: {
                    type: data.type,
                    num: data.num,
                    config: JSON.parse(data.config)
                }
            });
        }
    })
})

router.post('/join/:number', function(req, res) {
    // 加入房间
    if (!req.query.sessionid) {
        res.endj({
            code: -1,
            message: 'no sessionid in params'
        })
        return;
    }
    var number = req.params.number;
    req.redis.hgetallAsync('room:' + number).then(function(roomInfo) {
        if (_.isEmpty(roomInfo)) {
            res.endj({
                code: -1,
                message: '房间不存在或已过期'
            })
            return;
        }
        req.redis.hgetallAsync('room:' + number + ':players').then(function(players) {
            if (players && players[req.query.sessionid]) {
                res.endj({
                    code: 1,
                    message: '该玩家已加入游戏'
                })
            } else {
                var existedRoles = _.map(players, function(item) {
                    var role = item.split(';')[1];
                    return role;
                })
                var config = JSON.parse(roomInfo.config);
                var newRole = util.randomRole(config, existedRoles);
                if (!newRole) {
                    res.endj({
                        code: 1,
                        message: '该房间人数已满，请确认房间号是否正确'
                    })
                    return;
                }

                var num = _.size(players) + 1;
                req.redis.hsetAsync('room:' + number + ':players', req.query.sessionid, num + ';' + newRole)
                    .then(function() {
                        req.redis.publish('mypub:join:room:' + number, req.query.sessionid);
                        res.endj({
                            code: 0,
                            data: {
                                role: newRole,
                                num: num,
                                desc: '',
                                roomInfo: roomInfo
                            }
                        })
                    })
            }
        })
    }).catch(function(e) {
        res.endj(e);
    })
})

router.post('/restart/:number', function(req, res) {
    // 重新开始
    if (!req.query.sessionid) {
        res.endj({
            code: -1,
            message: 'no sessionid in params'
        })
        return;
    }
    var number = req.params.number;
    req.redis.getAsync('room:' + number + ':god').then(function(id) {
        if (req.query.sessionid === id) {
            req.redis.delAsync('room:' + number + ':players').then(function() {
                res.endj({
                    code: 0,
                    message: '操作成功'
                })
            })
        } else {
            res.endj({
                code: -1,
                message: '只有上帝可以重新开始'
            })
        }
    }).catch(function(e) {
        res.endj(e);
    })
})

module.exports = router;
