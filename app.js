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
app.use(function *(next) {
    console.log(this.query)
})

// 监听80端口
app.listen(80)

// 打印日志
console.log('Listening: http://127.0.0.1/:80')
console.log('Listening: http://localhost/:80')