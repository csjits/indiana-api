var config = require('../config');
var Post = require('../models/post');
var Helpers = require('../helpers');

var PostController = function() {}

PostController.prototype.create = function(req, isReply) {
    var post = new Post();
    post.message = req.body.message.trim();
    post.loc = [parseFloat(req.body.long), parseFloat(req.body.lat)];
    post.user = req.body.user;
    post.date = new Date().toISOString();
    post.ups = 0;
    post.downs = 0;
    post.upvoters = [];
    post.downvoters = [];
    post.rank = Helpers.hot(post.ups, post.downs, post.date);
    post.replies = [];
    post.isReply = isReply;
    return post;
}

PostController.prototype.read = function(post, user, readReplies) {
    console.log(post.dis);
    var distance = Helpers.getDistance(post.dis, config.distancePrecision);
    var voted = 0;
    if (post.upvoters && post.upvoters.indexOf(user) > -1) {
        voted = 1;
    } else if (post.downvoters && post.downvoters.indexOf(user) > -1) {
        voted = -1
    }
    var age = Helpers.getAge(post.date);

    var postRes = {
        id: post._id,
        message: post.message,
        score: post.ups - post.downs,
        rank: post.rank,
        age: age,
        distance: distance,
        voted: voted
    }

    if (readReplies) {
        postRes.replies = [];
        for (var i = 0; i < post.replies.length; i++) {
            postRes.replies.push(this.readReply(post.replies[i], user));
        }
    } else {
        postRes.replies = (post.replies ? post.replies.length : 0);
    }

    return postRes;
}

PostController.prototype.readReply = function(reply, user) {
    var voted = 0;
    if (reply.upvoters && reply.upvoters.indexOf(user) > -1) {
        voted = 1;
    } else if (reply.downvoters && reply.downvoters.indexOf(user) > -1) {
        voted = -1
    }
    var age = Helpers.getAge(reply.date);
    var replyRes = {
        id: reply._id,
        message: reply.message,
        score: reply.ups - reply.downs,
        age: age,
        voted: voted
    }
    return replyRes;
}

PostController.prototype.readAggregate = function(posts, user) {
    var postsRes = [];
    for (var i = 0; i < posts.length; i++) {
        postsRes.push(this.read(posts[i], user, false));
    }
    return postsRes;
}

PostController.prototype.update = function() {

}

PostController.prototype.vote = function() {

}

module.exports = PostController;
