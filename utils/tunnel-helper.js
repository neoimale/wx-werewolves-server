var WebSocketServer = require('ws').Server;
var url = require('url');
var _ = require('underscore');
var util = require('./util');
var debug = require('debug')('ws');

var wsServer;
var connectedTunnels = {};

module.exports = {
    createServer: function(server, handler) {
        wsServer = new WebSocketServer({ server: server });
        wsServer.on('connection', function(ws) {
            var location = url.parse(ws.upgradeReq.url, true);
            var sessionId = location.path.replace('/', '');
            console.log('ws connect>>>', sessionId);
            util.verifySession(sessionId).then(function(rlt) {
                if (rlt) {
                    connectedTunnels[sessionId] = ws;
                    handler.onConnect(sessionId);
                }
            })
            ws.on('message', function(message) {
                debug('message>>>', message);
                try {
                    let parsedMsg = JSON.parse(message);
                    handler.onMessage(sessionId, parsedMsg['type'], parsedMsg['content']);
                } catch (e) {
                    console.log(e.message);
                }
            })

            ws.on('close', function(code, message) {
                console.log('ws close>>>', sessionId);
                handler.onClose(sessionId);
                delete connectedTunnels[sessionId];
            })

            ws.on('error', function(err) {

            })
        })
        return wsServer;
    },
    broadcast: function(type, content, filter) {
        if (wsServer) {
            debug('broadcast>>>', 'type: ' + type, 'content: ' + JSON.stringify(content));
            _.each(connectedTunnels, function(client, id) {
                var checked = !filter || (typeof filter === 'function' && filter(id));
                if (checked) {
                    client.send(JSON.stringify({
                        type: type,
                        content: content
                    }))
                }
            })
        }
    },
    sendMessage: function(id, type, content) {
        if (wsServer && connectedTunnels[id]) {
            debug('send>>>', 'id: ' + id, 'type: ' + type, 'content: ' + JSON.stringify(content));
            connectedTunnels[id].send(JSON.stringify({
                type: type,
                content: content
            }));
        }
    }
}
