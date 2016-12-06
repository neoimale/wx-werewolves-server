var WebSocketServer = require('ws').Server;
var url = require('url');
var util = require('util');

var wsServer;
var connectedTunnels = {};

module.exports = {
    createServer: function(server, handler) {
        wsServer = new WebSocketServer({ server: server });
        wsServer.on('connection', function(ws) {
            var location = url.parse(ws.upgradeReq.url, true);
            var sessionId = location.path;
            util.verifySession(sessionId).then(function() {
                connectedTunnels[sessionId] = ws;
                handler.onConnect(sessionId);
            })
            ws.on('message', function(message) {
                console.log('ws:message>>>', message);
                try {
                    let parsedMsg = JSON.parse(message);
                    handler.onMessage(sessionId, parsedMsg['type'], parsedMsg['content']);
                } catch (e) {
                    console.log(e);
                }
            })

            ws.on('close', function(code, message) {
                handler.onClose(sessionId);
            })

            ws.on('error', function(err) {

            })
        })
        return wsServer;
    },
    broadcast: function(type, content) {
    	if(wsServer) {
    		wsServer.clients.forEach(function(client) {
    			client.send(JSON.stringify({
    				type: type,
    				content: content
    			}))
    		})
    	}
    }
}