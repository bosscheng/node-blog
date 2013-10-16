/**
 * 记得要修改此行代码
 * User: bosscheng
 * Date: 13-8-12
 * Time: 下午9:11
 */

var mongodb = require('./db');
// 留言对象
function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    // Initialize the database connection.
    //callback this will be called after executing this method.
    // The first parameter will contain the Error object if an error occured, or null otherwise.
    // While the second parameter will contain the connected mongoclient or null if an error occured.
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // Create a new Collection instance (INTERNAL TYPE)
        // params: db,collectionName,pkFactory,options
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //通过用户名、发表日期及标题查找文档，并把一条留言添加到该文档的 comments 数组里
            //Find and update a document.
            /**
             *   {Object} query: query object to locate the object to modify
             *   {Array} sort - if multiple docs match, choose the first one in the specified sort order as the object to manipulate
             *   {Object} doc - the fields/vals to be updated
             *   {Object} [options] additional options during update.
             *   {Function} callback this will be called after executing this method. The first parameter will contain the Error object
             *   @return {null}
             */
            collection.findAndModify({"name": name,"time.day":day,"title":title}
                , [ ['time',-1] ]
                , {$push:{"comments":comment}}
                , {new: true}
                , function (err,comment) {
                    mongodb.close();
                    callback(null);
                });
        });
    });
};