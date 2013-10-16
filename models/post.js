/**
 * 提交的博客的一些信息 数据库中的表:posts
 *
 * User: Administrator
 * Date: 13-7-28
 * Time: 下午5:37
 */

var mongodb = require('./db'),
    markdown = require('markdown').markdown;
// 构造函数  Post
function Post(name, title, tags, post) {
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

// 抛出post对象
module.exports = Post;


// 通过 prototype（原型）属性定义 方法 save
Post.prototype.save = function (callback) {//存储一篇文章及其相关信息
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        tags: this.tags,
        comments: [],
        pv: 0
    };
    //打开数据库
    mongodb.open(function (err, db) {
        //
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            /**
             * @param {Array|Object} docs
             * @param {Object} [options] optional options for insert command
             * @param {Function} [callback] optional callback for the function, must be provided when using a writeconcern
             * @return {null}
             * @api public
             */
            collection.insert(post, {
                safe: true
            }, function (err, post) {
                mongodb.close();
                callback(null);
            });
        });
    });
};
//
//8.10 修改 get方法为getAll
// 8 12 修改get 为 getTen  一次获取十篇文章
//
Post.get = function (name, page, callback) {//读取文章及其相关信息
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            /**
             * Count number of matching documents in the db to a query.
             *
             * Options
             *  - **skip** {Number}, The number of documents to skip for the count.
             *  - **limit** {Number}, The limit of documents to count.
             *  - **readPreference** {String}, the preferred read preference (Server.PRIMARY, Server.PRIMARY_PREFERRED, Server.SECONDARY, Server.SECONDARY_PREFERRED, Server.NEAREST).
             *
             * @param {Object} [query] query to filter by before performing count.
             * @param {Object} [options] additional options during count.
             * @param {Function} callback this will be called after executing this method. The first parameter will contain the Error object if an error occured, or null otherwise. While the second parameter will contain the results from the count method or null if an error occured.
             * @return {null}
             * @api public
             */
            collection.count(function (err, total) {
                //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的10个结果
                /**
                 * Creates a cursor for a query that can be used to iterate over results from MongoDB
                 *  @param {Object} query query object to locate the object to modify
                 * @param {Object} [options] additional options during update.
                 * @param {Function} callback this will be called after executing this method. The first parameter will contain the Error object if an error occured, or null otherwise. While the second parameter will contain the results from the find method or null if an error occured.
                 * @return {Cursor} returns a cursor to the query
                 * @api public
                 *
                 */
                collection.find(query, {skip: (page - 1) * 10, limit: 10}).sort({
                    time: -1
                }).toArray(function (err, docs) {
                        mongodb.close();
                        if (err) {
                            callback(err, null);//失败！返回 null
                        }
                        //解析markdown为html
                        docs.forEach(function (doc) {
                            doc.post = markdown.toHTML(doc.post);
                        });
                        callback(null, docs, total);//成功！以数组形式返回查询的结果
                    });
            });
        });
    });
};

// 获取一篇文章
Post.getOne = function (name, day, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行精确查询
            /**
             *  Finds a single document based on the query
             *
             *  @param {Object} query query object to locate the object to modify
             * @param {Object} [options] additional options during update.
             * @param {Function} callback this will be called after executing this method. The first parameter will contain the Error object if an error occured, or null otherwise. While the second parameter will contain the results from the findOne method or null if an error occured.
             * @return {Cursor} returns a cursor to the query
             * @api public
             */
            collection.findOne({"name": name, "time.day": day, "title": title}, function (err, doc) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                //解析 markdown 为 html
                if (doc) {
                    doc.post = markdown.toHTML(doc.post);

                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });

                }
                callback(null, doc);//返回特定查询的文章
            });
            //每访问1次，pv 值增加1
            /**
             * Updates documents.
             *
             *
             * @param {Object} selector the query to select the document/documents to be updated
             * @param {Object} document the fields/vals to be updated, or in the case of an upsert operation, inserted.
             * @param {Object} [options] additional options during update.
             * @param {Function} [callback] must be provided if you performing an update with a writeconcern
             * @return {null}
             * @api public
             */
            collection.update({"name": name, "time.day": day, "title": title}, {$inc: {"pv": 1}}, function (err, result) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
            });
        });
    });
};
// 获得目录
Post.getArchive = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find({}, {'name': 1, 'time': 1, 'title': 1}).sort({
                time: -1
            }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        callback(err);
                    }

                    callback(null, docs);
                });

        });

    });
};

Post.getTags = function (callback) {//返回所有标签
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //distinct 用来找出给定键的所有不同值
            collection.distinct("tags.tag", function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null, docs);
            });
        });
    });
};

Post.getTag = function (tag, callback) {//返回含有特定标签的所有文章
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //通过 tags.tag 查询并返回只含有 name、time、title 键的文档组成的数组
            collection.find({"tags.tag": tag}, {"name": 1, "time": 1, "title": 1}).sort({
                time: -1
            }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        callback(err, null);
                    }
                    callback(null, docs);
                });
        });
    });
};

// 搜索
Post.search = function (keyword, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 创建一个正则表达式，用于搜索的
            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({'title': pattern}, {'name': 1, 'time': 1, 'title': 1}).sort({time: -1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null, docs);
            });
        })
    });
}

