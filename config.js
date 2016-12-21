'use strict'

// 此文件用于保存配置信息

var path = require('path')
var util = require('./libs/util')
// wechat_file.txt文件用于保存access_token的相关信息
var wechat_file = path.join(__dirname, './config/wechat_file.txt')
var config = {
    wechat: {
        appID: 'wxaf81ec5598df4b8b',
        appSecret: '2d3d454fc5f830d96b7df7aaf332da7f',
        token: 'iamlearningimoocnodejs',
        getAccessToken: function () {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        }
    }
}

module.exports = config