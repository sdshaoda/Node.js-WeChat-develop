'use strict'


var config = require('./config')
var Wechat = require('./wechat/wechat')

var wechatApi = new Wechat(config.wechat)

// 回复消息
exports.reply = function* (next) {
    var message = this.weixin

    if (message.MsgType === 'event') {
        // 事件推送
        if (message.Event === 'subscribe') {
            // 关注事件
            if (message.EventKey) {
                console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
            }
            this.body = '欢迎订阅沉醉美少年！'
        } else if (message.Event === 'unsubscribe') {
            // 取消关注事件
            console.log('无情取关')
            this.body = ''
        } else if (message.Event === 'LOCATION') {
            // 上报地理位置事件
            this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
        } else if (message.Event === 'CLICK') {
            // 点击菜单事件
            this.body = '您点击了菜单：' + message.EventKey
        } else if (message.Event === 'SCAN') {
            // 扫描带参数二维码事件
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket)
            this.body = '看到你扫了一下哦'
        } else if (message.Event === 'VIEW') {
            // 点击菜单链接事件
            this.body = '您点击了菜单中的链接：' + message.EventKey
        }
    } else if (message.MsgType === 'text') {
        // 普通消息
        var content = message.Content
        var reply = '我是回复机器人\n' + message.Content

        // 定制回复消息
        if (content === '1') {
            reply = '你最好看'
        } else if (content === '2') {
            reply = '哈哈哈哈'
        } else if (content === '3') {
            reply = '你不会真信了吧'
        } else if (content === '4') {
            reply = [{
                title: '我们的目标是星辰大海',
                description: '这里是没想好的描述',
                picUrl: 'http://cmscdn.xitek.com/uploads/allimg/140912/61-140912103U1.jpg',
                url: 'https://mp.weixin.qq.com/'
            }, {
                title: '来这里奋斗吧！',
                description: '这里是没想好的描述2',
                picUrl: 'http://n.sinaimg.cn/eladies/20161206/DYnr-fxyiayt5825332.jpg',
                url: 'https://github.com/'
            }]
        } else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/0.jpg')

            // 由于个人用户无法获得微信认证，无此权限
            if (data.errcode && data.errcode === 48001) {
                reply = 'errcode = 48001\n对不起，此微信号尚未获得上传临时素材接口权限'
            } else {
                reply = {
                    type: 'image',
                    mediaId: data.media_id
                }
            }
        } else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', __dirname + '/1.mp4')

            // 由于个人用户无法获得微信认证，无此权限
            if (data.errcode && data.errcode === 48001) {
                reply = 'errcode = 48001\n对不起，此微信号尚未获得上传临时素材接口权限'
            } else {
                reply = {
                    type: 'video',
                    title: '回复视频',
                    description: 'description',
                    mediaId: data.media_id
                }
            }
        } else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/0.jpg')

            // 由于个人用户无法获得微信认证，无此权限
            if (data.errcode && data.errcode === 48001) {
                reply = 'errcode = 48001\n对不起，此微信号尚未获得上传临时素材接口权限'
            } else {
                reply = {
                    type: 'music',
                    title: '回复音乐',
                    description: 'description',
                    musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
                    thumbMediaId: data.media_id
                }
            }
        }

        this.body = reply
    }

    yield next
}