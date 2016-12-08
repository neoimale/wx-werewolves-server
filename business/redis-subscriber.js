var redis = require('redis');
var _ = require('underscore');
var TunnelHelper = require('../utils/tunnel-helper');
var util = require('../utils/util');

module.exports = function() {
    var systemSub = redis.createClient();
    systemSub.psubscribe('__keyspace@0__:*');
    systemSub.on('pmessage', function(pattern, channel, message) {
        if (channel.indexOf('__keyspace@0__:room:') != -1) {
            console.log(pattern, channel, message);
            var match = /__keyspace@0__:room:(\d+)$/.exec(channel);
            if (!_.isEmpty(match) && message == 'expired') {
                var roomNum = match[1];
                var client = systemSub.duplicate();
                util.recycleRoomNumber(client, roomNum, function() {
                    client.quit();
                });
                client.del('room:' + roomNum + ':players');
            }
        }
    })

    var customSub = systemSub.duplicate();
    customSub.psubscribe('mypub:*');
    customSub.on('pmessage', function(pattern, channel, message) {
        console.log(pattern, channel, message);
        var match = /mypub:(\w+):(\w+):?(.+)/.exec(channel);
        if (!_.isEmpty(match)) {
            if (match[1] == 'join' && match[2] == 'room') {
                var roomNum = match[3];
                var sessionId = message;
                var client = customSub.duplicate();
                // client.hgetallAsync('room:' + roomNum + ':players').then(function(players) {
                //     if (players) {
                //         TunnelHelper.broadcast(0, {
                //             'event': 'join',
                //             'message': {
                //                 sessionid: sessionId,
                //                 info: players[sessionId]
                //             }
                //         }, function(tunnelId) {
                //             return players[tunnelId];
                //         })
                //     }
                // })
				client.getAsync('room:' + roomNum + ':god').then(function(god) {
					if(god) {
						TunnelHelper.sendMessage(god, 0, {
                            'event': 'join',
                            'message': {
                                sessionid: sessionId,
                                info: ''
                            }
                        })
					}
				})
                client.quit();
            }
        }
    })
}
