'use strict'

var Koa = require('koa')
var sha1 = require('sha1')
var config = {
    wechat: {
        appID: 'wxaf81ec5598df4b8b',
        appSecret: '2d3d454fc5f830d96b7df7aaf332da7f',
        token: 'iamlearningimoocnodejs',
    }
}

// 实例化koa的Web服务器
var app = new Koa()

// 中间件 生成器函数
app.use(function* (next) {
    console.log(this.query)

    var token = config.wechat.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if (sha === signature) {
        this.body = echostr + ''
    } else {
        this.body = 'wrong'
    }
})

// 监听80端口
app.listen(80)

// 打印日志
console.log('Listening: http://127.0.0.1/:80')
console.log('Listening: http://localhost/:80')