/**
 * 用户的一些信息：数据库表：users
 *
 * User: Administrator
 * Date: 13-7-28
 * Time: 上午9:43
 */

var mongodb = require('./db');

// 构造函数 User
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

// 抛出User对象
module.exports = User;


// 通过原型创建 save方法
User.prototype.save = function (callback) {//存储用户信息
    //要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入 users 集合
            collection.insert(user, {safe: true}, function (err, user) {
                mongodb.close();
                callback(err, user);//成功！返回插入的用户信息
            });
        });
    });
};

User.get = function (name, callback) {//读取用户信息
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查找用户名 name 值为 name文档
            collection.findOne({
                name: name
            }, function (err, doc) {
                mongodb.close();
                if (doc) {
                    var user = new User(doc);
                    callback(err, user);//成功！返回查询的用户信息
                } else {
                    callback(err, null);//失败！返回null
                }
            });
        });
    });
};