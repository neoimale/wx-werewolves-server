var _ = require('underscore');
var debug = require('debug')('util');

function createRoomNumber(redis, callback) {
    redis.get('room_recycle', function(err, value) {
        if (err) {
            callback(err);
        } else {
            var recyclePool = value ? value.split(',') : [];
            if (recyclePool.length > 0) {
                var number = recyclePool[0];
                recyclePool.splice(0, 1);
                redis.set('room_recycle', recyclePool.join(','))
                callback(null, number);
            } else {
                redis.get('room_counter', function(err1, counter) {
                	if(err1) {
                		callback(err1);
                		return;
                	}
                	if(counter >= 1000) {
                		redis.incr('room_counter', function(err2, result) {
                			err2 ? callback(err2) : callback(null, result)
                		});
                	} else {
                		redis.set('room_counter', 1000, function(err3) {
                			err3 ? callback(err3) : callback(null, 1000);
                		})
                	}
                	
                })
            }
        }
    })
}

function recycleRoomNumber(redis, number, callback) {
	redis.get('room_recycle', function(err, value) {
		if(!err) {
			var recyclePool = value ? value + ',' + number : '' + number;
			redis.set('room_recycle', recyclePool)
		}
		if(callback) {
			callback();
		}
	})
}

function randomRole(config, exist) {
	var left = [];
	_.each(exist, function(item) {
		if(config[item]) {
			config[item] = config[item] - 1;
		}
	})
	_.each(config, function(num, key) {
		var count = num;
		while(count > 0) {
			left.push(key);
			count --;
		}
	})
	return left.length > 0 ? left[randomInt(left.length)] : null;
}

function randomInt(max, min) {
	min = min || 0;
	return Math.floor(Math.random() * (max - min)) + min;
}

function sha1(text) {
	//random key; don't modify
	return require('crypto').createHmac('sha1', 'skNNcK2R48iAa3gB4H').update(text).digest('hex');
}

function verifySession(sessionid, db) {
	var redis = db || require('redis').createClient();
	var rlt = redis.existsAsync('session:' + sessionid);
	if(redis != db) {
		redis.quit();
	}
	return rlt;
}

module.exports = {
	createRoomNumber: createRoomNumber,
	recycleRoomNumber: recycleRoomNumber,
	randomRole: randomRole,
	sha1: sha1,
	verifySession: verifySession
}
