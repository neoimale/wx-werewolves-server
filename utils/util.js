var CONST = require('./const');
var _ = require('underscore');

function createRoomNumber(redis, callback) {
    redis.get('room_recycle', function(err, value) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            var recyclePool = value ? value.split(',') : [];
            if (recyclePool.length > 0) {
                var number = recyclePool[0];
                recyclePool.splice(0, 1);
                redis.set('room_recycle', recyclePool.join(','))
                callback(null, number);
            } else {
                redis.get('room_counter', function(err, counter) {
                	redis.incr('room_counter');
                	callback(null, counter + 1);
                })
            }
        }
    })
}

function recycleRoomNumber(redis, number) {
	redis.get('room_recycle', function(err, value) {
		if(!err) {
			var recyclePool = value ? value + ',' + number : '' + number;
			redis.set('room_recycle', recyclePool)
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
	return left[randomInt(left.length)];
}

function randomInt(max, min) {
	min = min || 0;
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
	createRoomNumber: createRoomNumber,
	recycleRoomNumber: recycleRoomNumber,
	randomRole: randomRole
}
