var router = require('express').Router();
var util = require('../utils/util');
var _ = require('underscore');
var debug = require('debug')('router');

router.post('/create', function(req, res) {
    // 创建房间
    util.createRoomNumber(req.redis, function(err, number) {
        if (err) {
            res.endj(err);
        } else {
            req.redis.hmsetAsync('room:' + number, 'type', req.query.type.toString(),
                'num', req.query.num.toString(), 'config', JSON.stringify(req.query.config)).then(function() {
                req.redis.expire('room:' + number, 3600); //1h过期
                res.endj({
                    code: 0,
                    data: { id: number }
                })
            }).catch(function() {
                res.endj({
                    code: -1,
                    message: 'Server Error'
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
            return;
        }
        if (data) {
            res.endj({
                code: 0,
                data: {
                    type: data.type,
                    num: data.num,
                    config: JSON.parse(data.config)
                }
            });
        } else {
            res.endj({
                code: 1,
                message: '没有这个房间'
            })
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
                code: 1,
                message: '房间不存在或已过期'
            })
            return;
        }
        roomInfo.config = JSON.parse(roomInfo.config);
        if (req.query.god) {
            //上帝加入
            req.redis.getAsync('room:' + number + ':god').then(function(rlt) {
                if (rlt && rlt != req.query.sessionid) {
                    res.endj({
                        code: 1,
                        message: '该房间已有上帝了'
                    })
                } else {
                    req.redis.setAsync('room:' + number + ':god', req.query.sessionid).then(function() {
                        req.redis.hdel('room:' + number + ':players', req.query.sessionid); //从玩家中清除
                        res.endj({
                            code: 0,
                            data: {
                                god: 1,
                                roomInfo: roomInfo
                            }
                        })
                    })
                }
            })
        } else {
            //玩家加入
            req.redis.getAsync('room:' + number + ':god').then(function(god) {
                if (god && god == req.query.sessionid) {
                    res.endj({
                        code: 0,
                        // message: '你已经是这个房间的上帝了,输入房间号加上god可进入上帝视角',
                        data: {
                            god: 1,
                            roomInfo: roomInfo
                        }
                    })
                    return;
                }
                req.redis.hgetallAsync('room:' + number + ':players').then(function(players) {
                    if (players && players[req.query.sessionid]) {
                        var playerInfo = JSON.parse(players[req.query.sessionid]);
                        res.endj({
                            code: 0,
                            data: {
                                num: playerInfo.num,
                                role: playerInfo.role,
                                desc: util.roleDescription(playerInfo.role),
                                roomInfo: roomInfo
                            }
                        })
                    } else {
                        var num = 0;
                        var existedRoles = _.map(players, function(item) {
                            var info = JSON.parse(item);
                            var role = info.role;
                            num = Math.max(num, info.num);
                            return role;
                        })
                        var config = roomInfo.config;
                        var newRole = util.randomRole(config, existedRoles);
                        debug(req.query.sessionid + ' join room ' + number + ', role: ' + newRole);
                        if (!newRole) {
                            res.endj({
                                code: 1,
                                message: '该房间人数已满，请确认房间号是否正确'
                            })
                            return;
                        }
                        num = num + 1;

                        req.redis.hsetAsync('room:' + number + ':players', req.query.sessionid, JSON.stringify({ num: num, role: newRole }))
                            .then(function() {
                                req.redis.publish('mypub:join:room:' + number, req.query.sessionid);
                                res.endj({
                                    code: 0,
                                    data: {
                                        role: newRole,
                                        num: num,
                                        desc: util.roleDescription(newRole),
                                        roomInfo: roomInfo
                                    }
                                })
                            })
                    }
                })
            })
        }
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
            req.redis.keysAsync('room:' + number + ':*').then(function(keys) {
                keys = keys || [];
                keys = _.filter(keys, function(item) {
                    return item.indexOf('god') == -1;
                })
                if (!_.isEmpty(keys)) {
                    req.redis.del(...keys);
                }
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
