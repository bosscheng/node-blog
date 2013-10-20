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
// flash-
var flash = require('connect-flash');

// 使用 express
var app = express();

// all environments
// app.set(name,value);
app.set('port', process.env.PORT || 3000);
// __dirname is global object
// 使用模版引擎 ，解析文件存放在views文件夹中
app.set('views', __dirname + '/views');
// setting view engine is ejs
app.set('view engine', 'ejs');
// 使用flash模块
// 使用flash模块来实现页面的通知和错误信息的提示。
// flash 是在session中存储信息的特定区域，信息写入flash，
// 下一次显示完毕之后就会被清楚。
app.use(flash());
// user favicon icon
app.use(express.favicon());
//show logger
// 在终端显示日志
app.use(express.logger('dev'));
// 用来解析请求体的，application/json application/x-www-form-urlencoded multipart/form-date
app.use(express.bodyParser());
// help POST request
//connect内部中间件，可以协助POST请求，伪装PUT,DELETE请求，
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
// 应用解析路由的规则
app.use(app.router);
// connect 中间件，设置根目录下面的public文件夹为 images,css,js等静态文件
// 在页面上引用的时候默认是/public 目录开始的。
app.use(express.static(path.join(__dirname, 'public')));

// development only
// 如果是开发环境下面的错误，输出错误信息。
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// 使用routes 来封装里面的方法
routes(app);

// 启动app : node app
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
