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

PostController.prototype.read = function() {

}

PostController.prototype.readAggregate = function(posts, user) {
    var postsRes = [];
    for (var i = 0; i < posts.length; i++) {
        var distance = Helpers.getDistance(posts[i].dis, config.distancePrecision);
        var voted = 0;
        if (posts[i].upvoters && posts[i].upvoters.indexOf(user) > -1) {
            voted = 1;
        } else if (posts[i].downvoters && posts[i].downvoters.indexOf(user) > -1) {
            voted = -1
        }
        postsRes.push({
            id: posts[i]._id,
            message: posts[i].message,
            score: posts[i].ups - posts[i].downs,
            rank: posts[i].rank,
            age: Helpers.getAge(posts[i].date),
            distance: distance,
            voted: voted,
            replies: (posts[i].replies ? posts[i].replies.length : 0)
        });
    }
    return postsRes;
}

PostController.prototype.update = function() {

}

PostController.prototype.vote = function() {

}

module.exports = PostController;
