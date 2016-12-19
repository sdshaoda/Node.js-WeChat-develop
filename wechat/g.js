'use strict'

// 中间件应只处理和微信交互的部分，不应干涉其他业务逻辑

var sha1 = require('sha1')
var Promise = require('bluebird')
// 用bluebird对request进行promise化
var request = Promise.promisify(require('request'))

var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
}

// 构造函数，生成实例，判断票据access_token是否过期，过期则重新写入文件中
/**
 * 管理和微信交互的接口，管理票据的更新、存储
 */
function Wechat(opts) {
    var _this = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    // 获取票据信息的方法
    this.getAccessToken = opts.getAccessToken
    // 写入票据信息的方法
    this.saveAccessToken = opts.saveAccessToken

    this.getAccessToken()
        .then(function (data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                // 如果出错，更新access_token
                return _this.updateAccessToken()
            }

            // 即使存在，也要进行合法性检查
            if (_this.isValidAccessToken(data)) {
                Promise.resolve(data)
            } else {
                // 过期了，更新
                return _this.updateAccessToken()
            }
        })
        .then(function (data) {
            _this.access_token = data.access_token
            _this.expires_in = data.expires_in

            _this.saveAccessToken(data)
        })
}

// 检查数据合法性
Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }

    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
        return true
    } else {
        return false
    }
}

// 更新票据access_token
Wechat.prototype.updateAccessToken = function () {
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret


    return new Promise(function (resolve, reject) {
        // request是一个对http.get/http.post封装后的库
        request({ url: url, json: true }).then(function (response) {
            var data = response.body
            var now = (new Date().getTime())
            // 提前20s刷新
            var expires_in = now + (data.expires_in - 20) * 1000

            data.expires_in = expires_in
            resolve(data)
        })
    })
}

// 返回一个Generator函数
module.exports = function (opts) {
    // 初始化构造函数
    var wechat = new Wechat(opts)

    return function* (next) {
        var token = opts.token
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
    }
}
