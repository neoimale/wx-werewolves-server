'use strict';

// const TunnelService = require('qcloud-weapp-server-sdk').TunnelService;

// let connectedTunnelIds = [];

// const _broadcast = (type, content) => {
//     TunnelService.broadcast(connectedTunnelIds, type, content).then(result => {
//         let invalidTunnelIds = result.data && result.data.invalidTunnelIds || [];
//         if (invalidTunnelIds.length > 0) {
//          invalidTunnelIds.forEach(tunnelId => {
//              let index = connectedTunnelIds.indexOf(tunnelId);
//              if(index >= 0) {
//                  connectedTunnelIds.splice(index, 1);
//              }
//          })
//         }
//     })
// }

const TunnelHelper = require('../utils/tunnel-helper');
const redis = require('redis');
const _ = require('underscore');

var debug = require('debug')('tunnel');

class TunnelHandler {
    /*----------------------------------------------------------------
     * 在客户端请求 WebSocket 信道连接之后会调用该方法
     * 此时可以把信道 ID 和用户信息关联起来
     *----------------------------------------------------------------
     * @param String tunnelId  信道 ID
     * @param Array  userInfo  微信用户信息
     *----------------------------------------------------------------
     */
    // onRequest(tunnelId, userInfo) {
    //     // TODO: add logic here
    // }

    /*----------------------------------------------------------------
     * 在客户端成功连接 WebSocket 信道服务之后会调用该方法
     * 此时可以通知所有其它在线的用户当前总人数以及刚加入的用户是谁
     *----------------------------------------------------------------
     * @param String tunnelId  信道 ID
     *----------------------------------------------------------------
     */
    onConnect(tunnelId, params) {
        let business = params ? params.business : null;
        debug('onConnect >>> ', params);
        switch (business) {
            case 'god':
                {
                    let roomNum = params.room;
                    if (roomNum) {
                        let client = redis.createClient();
                        client.hgetallAsync('room:' + roomNum + ':players').then(function(players) {
                            if (players) {
                                let sessions = _.keys(players);
                                let actions = _.map(sessions, (sessionId) => {
                                    return ['hget', 'session:' + sessionId, 'user_info'];
                                })
                                client.multi(actions).exec(function(err, replies) {
                                    client.quit();
                                    if(err || _.isEmpty(replies)) {
                                        return;
                                    }

                                    let userInfo = _.object(sessions, replies);
                                    let playersInfo = _.map(players, (value, key) => {
                                        value = value.split(';');
                                        return {
                                            num: parseInt(value[0]),
                                            role: value[1],
                                            info: userInfo[key]
                                        }
                                    });
                                    playersInfo = _.sortBy(playersInfo, item => item.num);
                                    debug('business: ', business, 'return: ', playersInfo);
                                    TunnelHelper.sendMessage(tunnelId, 0, {
                                        'event': 'connected',
                                        'message': {
                                            'players': playersInfo
                                        }
                                    })
                                })
                            } else {
                                TunnelHelper.sendMessage(tunnelId, 0, {
                                    'event': 'connected',
                                    'message': {
                                        'players': []
                                    }
                                })
                            }
                        }).catch(function() {
                            client.quit();
                        })
                    }
                    break;
                }
            case 'player':
                {
                    break;
                }
        }
    }

    /*----------------------------------------------------------------
     * 客户端推送消息到 WebSocket 信道服务器上后会调用该方法
     * 此时可以处理信道的消息
     *----------------------------------------------------------------
     * @param String tunnelId  信道 ID
     * @param String type      消息类型
     * @param Any    content   消息内容
     *----------------------------------------------------------------
     */
    onMessage(tunnelId, type, content) {
        // TODO: add logic here
    }

    /*----------------------------------------------------------------
     * 客户端关闭 WebSocket 信道或者被信道服务器判断为已断开后会调用该方法
     * 此时可以进行清理及通知操作
     *----------------------------------------------------------------
     * @param String tunnelId  信道 ID
     *----------------------------------------------------------------
     */
    onClose(tunnelId) {
        // TODO: add logic here
    }
}

module.exports = TunnelHandler;
