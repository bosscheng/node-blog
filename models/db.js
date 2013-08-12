/**
 * 描述连接数据库的一些信息：数据库的setting等
 * User: Administrator
 * Date: 13-7-27
 * Time: 下午7:25
 */


var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

// 抛出该对象
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}), {safe: true});
