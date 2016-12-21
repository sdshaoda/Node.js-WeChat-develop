# Node.js-WeChat-develop
Use Node.js develop WeChat public number

## 环境配置

如果有自己的域名和服务器是再好不过的了，但是如果没有的话，可以像这样：

起一个本地的node服务，注意一下端口号

`node app.js`

然后映射到外网

`ngrok http 本地服务的端口`

或者

`./natapp.exe`

或者

`npm instsll -g localtunnel`

`lt --port 本地服务的端口`

每次重启本地服务后都要重启localtunnel，并重新配置微信服务器配置

有时这些服务不稳定，和微信服务器对接出错时建议多试几次

安装的依赖

`npm install koa bluebird request raw-body xml2js`