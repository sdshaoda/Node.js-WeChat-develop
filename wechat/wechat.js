'use strict'

var Promise = require('bluebird')
// 用bluebird对request进行promise化
var request = Promise.promisify(require('request'))

// 接口调用前缀
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    // 配置获取access_token的URL地址
    accessToken: prefix + 'token?grant_type=client_credential'
}

/**
 * 构造函数，生成实例
 * 判断全局票据access_token是否过期，过期则重新写入 wechat_file.txt 文件中
 * 管理和微信交互的接口
 */
function Wechat(opts) {
    var _this = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    // 获取票据信息的方法
    this.getAccessToken = opts.getAccessToken
    // 写入票据信息的方法
    this.saveAccessToken = opts.saveAccessToken

    // 注意promise对象需要return
    return this.getAccessToken()
        .then(function (data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                // 如果出错，更新access_token
                return _this.updateAccessToken()
            }

            // 即使存在，也要进行合法性检查
            if (_this.isValidAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                // 过期了，更新
                return _this.updateAccessToken()
            }
        })
        .then(function (data) {
            _this.access_token = data.access_token
            _this.expires_in = data.expires_in

            // 将正确的数据写入文件中
            _this.saveAccessToken(data)
        })
}

/**
 * 检查数据合法性
 * 数据存在且未过期，则返回true
 */
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

/**
 * 更新全局票据access_token
 * 接口调用说明：
 * http请求方式: GET
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 */
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

module.exports = Wechat