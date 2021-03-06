var _ = require('underscore');
var debug = require('debug')('util');

// TODO 这里可能存在生产者消费者问题
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
	config = _.clone(config);
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

function cipher(text) {
	var cipher = require('crypto').createCipher('aes128', 'skNNcK2R48iAa3gB4H');
	cipher.update(text, 'utf8');
	return cipher.final('hex');
}

function decipher(text) {
	var decipher = require('crypto').createDecipher('aes128', 'skNNcK2R48iAa3gB4H');
	decipher.update(text, 'hex')
	return decipher.final('utf8');
}

function verifySession(sessionid, db) {
	var redis = db || require('redis').createClient();
	var rlt = redis.existsAsync('session:' + sessionid);
	if(redis != db) {
		redis.quit();
	}
	return rlt;
}

function roleDescription(role) {
	var words;
	switch(role) {
		case 'wolf':
		{
			words = ['上局谁杀的我，哼哼哼哼哼!', '我的牙齿好大啊', '怎么又是狼人!脸好黑', '我来搞事情了']
			break;
		}
		case 'witch':
		{
			words = ['嗯...该毒死谁好呢', '要不要救他？救个屁，上局就他杀的我!']
			break;
		}
		case 'oracle':
		{
			words = ['我看过你了，演，接着演', '天上浮云似白衣,斯须改变如苍狗', '我要竞选警长！选我！选我！', '我的眼睛洞察一切']
			break;
		}
		case 'civilian':
		{
			words = ['我真的只是个普通村民...']
			break;
		}
		case 'idiot':
		{
			words = ['我是白痴...']
			break;
		}
		case 'hunter':
		{
			words = ['谁也别惹我，敢杀我一枪带你走']
			break;
		}
	}
	return _.isEmpty(words) ? '' : words[randomInt(words.length)];
}

module.exports = {
	createRoomNumber: createRoomNumber,
	recycleRoomNumber: recycleRoomNumber,
	randomRole: randomRole,
	sha1: sha1,
	cipher: cipher,
	decipher: decipher,
	verifySession: verifySession,
	roleDescription: roleDescription
}
