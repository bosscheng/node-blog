/**
 * 启动文件
 *
 * Module dependencies.
 */


// 获取到核心模块 require('xxx')
// 获取文件模块   require('/xxx')

// express: web开发框架-核心模块
var express = require('express');
//引入路由
var routes = require('./routes');
// http-核心模块
var http = require('http');
// path-核心模块
var path = require('path');
// connent-mongo-连接mongo数据库
var MongoStore = require('connect-mongo')(express);
// setting-数据库连接设置
var settings = require('./settings');
//
var flash = require('connect-flash');


var app = express();

// all environments
// app.set(name,value);
app.set('port', process.env.PORT || 3000);
// __dirname is global object
// 使用模版引擎
app.set('views', __dirname + '/views');
// setting view engine is ejs
app.set('view engine', 'ejs');
// 使用flash模块
app.use(flash());
// user favicon icon
app.use(express.favicon());
//show logger
app.use(express.logger('dev'));
// 用来解析请求体的，application/json application/x-www-form-urlencoded multipart/form-date
app.use(express.bodyParser());
// help POST request
app.use(express.methodOverride());
// 使用cookieParser ：cookie解析的中间件
app.use(express.cookieParser());
/*
 提供回话支持
 secret防止篡改cookie
 key:为cookie的名称
 cookie: 设置maxAge 来设定cookie的生存期
 store：把回话信息存放到数据库中。
 */
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));
// user router
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// 使用routes 来封装里面的方法
routes(app);

// 启动app : node app
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
