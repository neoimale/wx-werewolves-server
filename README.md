## 环境配置

### node.js & npm (centos 7.2)

```
yum install gcc
yum install gcc-c++

wget https://nodejs.org/dist/v6.9.1/node-v6.9.1.tar.gz
tar -zxvf node-v6.9.1.tar.gz
cd node-v6.9.1
./configure
make & make install
```

### pm2

```
npm install -g pm2
```

### redis

```
wget http://download.redis.io/releases/redis-3.2.5.tar.gz
tar -zxvf redis-3.2.5.tar.gz
cd redis-3.2.5
make & make install
```