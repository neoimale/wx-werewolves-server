# RESTful API

### 房间

*  创建房间
  
   POST /room/create
 
   ```
   参数
   {
       "type": 1, //房间类型
       "num":  8, //游戏人数
       "config": { //房间配置
          "wolf": 3, //狼人数
          "oracle": 1, //预言家
          "witch": 1, //女巫
          "civilian": 3, //平民
          "hunter": 0,//猎人
          "cupid": 0, //丘比特
          "guard": 0, //守卫
          "idiot": 0  //白痴
       }
   }
   
   返回值
   {
       "id": 8888 //房间号
   }
   ```
*  获取房间信息

   GET /room/get/[id]
      
   ```
   返回值
   {
       "type": 1, //房间类型
       "num":  8, //游戏人数
       "config": { //房间配置
          "wolf": 3, //狼人数
          "oracle": 1, //预言家
          "witch": 1, //女巫
          "civilian": 3, //平民
          "hunter": 0,//猎人
          "cupid": 0, //丘比特
          "guard": 0, //守卫
          "idiot": 0  //白痴
       }
   }
   ```
   
*  加入房间

   POST /room/join/[id]
   
   ```
   参数
   {
       "sessionid": "sessonid"
   }
   
   返回值
   {
       "role": "wolf", //角色
       "desc": "xxxx", //描述
       "num": 2,       //序号
       "roomInfo": {
           "type": 1, //房间类型
           "num":  8, //游戏人数
           "config": { //房间配置
              "wolf": 3, //狼人数
              "oracle": 1, //预言家
              "witch": 1, //女巫
              "civilian": 3, //平民
              "hunter": 0,//猎人
              "cupid": 0, //丘比特
              "guard": 0, //守卫
              "idiot": 0  //白痴
           }
       }
   }
   ```
   
*  重新开始

   POST /room/restart/[id]
   
   ```
   参数
   {
       "sessionid": "sessionid"
   }
   
   返回值
   {
       "id": 8888
   }
   ```
 
  
### 登录

*  登录

   POST /login
   
   ```
   参数
   {
      "code": "code",
   }
   
   返回值
   {
      "sessionid": "AEcrJoI9ua2eLm"
   }
   ```
   
### 信道消息

信道消息为JSON格式，分为系统消息和用户消息两种类型，具体格式如下：

```
{
	type: 0,   //类型，0代表系统消息，1代表用户消息
	content: { // 具体内容
		event: 'join', // 事件名称
		message: {     // 消息体
			...
		}
	}
}
```