'use strict'

// 中间件应只处理和微信交互的部分，不应干涉其他业务逻辑

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

// 返回一个Generator函数
module.exports = function (opts, handler) {
    // 初始化构造函数
    var wechat = new Wechat(opts)

    return function* (next) {
        var _this = this
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        // 字典排序，拼接成字符串
        var str = [token, timestamp, nonce].sort().join('')
        // sha1加密
        var sha = sha1(str)

        if (this.method === 'GET') {
            // 验证此信息来源于微信
            if (sha === signature) {
                // 原样返回echostr内容
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }

            // 对POST获取到的XML格式的数据进行加工 data === Buffer类型
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })

            // 返回的一个json数据，但是value里是数组
            var content = yield util.parseXMLAsync(data)

            // 格式化
            var message = util.formatMessage(content.xml)
            console.log(message)

            this.weixin = message

            yield handler.call(this, next)

            wechat.reply.call(this)

            // if (message.MsgType === 'event') {
            //     if (message.Event === 'subscribe') {
            //         var now = new Date().getTime()

            //         _this.status = 200
            //         _this.type = 'application/xml'
            //         // 回复文本消息的规定格式，见微信开发者平台(https://mp.weixin.qq.com/wiki)
            //         _this.body = `<xml>
            //             <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
            //             <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
            //             <CreateTime>${now}</CreateTime>
            //             <MsgType><![CDATA[text]]></MsgType>
            //             <Content><![CDATA[嗨，沉醉美少年欢迎你！]]></Content>
            //             <MsgId>1234567890123456</MsgId>
            //             </xml>`
            //     }
            // } else if (message.MsgType === 'text') {
            //     var now = new Date().getTime()

            //     _this.status = 200
            //     _this.type = 'application/xml'
            //     _this.body = `<xml>
            //             <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
            //             <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
            //             <CreateTime>${now}</CreateTime>
            //             <MsgType><![CDATA[text]]></MsgType>
            //             <Content><![CDATA[${message.Content}]]></Content>
            //             <MsgId>1234567890123456</MsgId>
            //             </xml>`
            // }
        }
    }
}
