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