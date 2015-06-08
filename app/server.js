// SETUP
// #############################################################################
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var rateLimit = require('express-rate-limit');
var Helpers = require('./helpers');
var Post = require('./models/post');
var PostController = require('./controllers/post');

console.log('Starting up Indiana API');

var app = express();
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var pc = new PostController();

mongoose.connect(config.mongodbPath);
console.log('MongoDB state', mongoose.connection.readyState);

// ROUTES
// #############################################################################
var router = express.Router();

// Middleware
router.use(function(req, res, next) {
    console.log('Request:', req.method + ' ' +req.originalUrl);

    if (!req.query.user && !req.body.user) {
        res.json({ message: 'Error: Invalid user' });
        return;
    }
    next();
});

router.route('/')
    .get(function(req, res) {
        res.json({ message: 'Stay a while and listen' });
    });

router.route('/posts')

    .post(function(req, res) {
        if (!Helpers.isValidLocation(req.body.long, req.body.lat)) {
            res.json({ message: 'Error: Invalid location' });
            return;
        }

        if (!req.body.message.trim()) {
            res.json({ message: 'Error: Invalid message' });
            return;
        }

        var post = pc.create(req, false);

        post.save(function(err) {
            if (err) res.send(err);
            res.json({ message: 'OK' });
        });
    })

    .get(function(req, res) {

        var user = req.query.user;
        var type = req.query.sort || 'hot';
        var sort = (type === 'new' || type === 'my') ? { "date": -1 } : { "rank": -1 };
        var queryArray;

        if (type === 'hot' || type == 'new') {
            if (!Helpers.isValidLocation(req.query.long, req.query.lat)) {
                res.json({ message: 'Error: Invalid location' });
                return;
            }
            var coords = [parseFloat(req.query.long), parseFloat(req.query.lat)];
            queryArray = [
                {
                    "$match": {
                        "$or": [
                            { "isReply": null },
                            { "isReply": false }
                        ]
                    },
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": coords
                        },
                        "distanceField": "dis",
                        "maxDistance": config.maxDistance,
                        "distanceMultiplier": config.distanceMultiplier,
                        "spherical": true
                    }
                },
                { "$limit": config.maxResults },
                { "$sort": sort }
            ];
        } else if (type === 'my') {
            queryArray = [
                {
                    "$match": {
                        "$and": [
                            { "user": user },
                            {
                                "$or": [
                                    { "isReply": null },
                                    { "isReply": false }
                                ]
                            }
                        ]

                    }
                },
                { "$limit": config.maxResults },
                { "$sort": sort }
            ];
        } else {
            res.json({ message: 'Error: Sort must be hot, new or my' });
            return;
        }

        Post.aggregate(
            queryArray,
            function(err, posts) {
                if (err) res.send(err);
                var postsRes = pc.readAggregate(posts, user);
                res.json(postsRes);
            }
        );
    });

router.route('/posts/:post_id')

    .get(function(req, res) {
        Post.findById(req.params.post_id).populate('replies').exec(function(err, post) {
            if (err) res.send(err);

            if (!post) {
                res.json({ message: 'Error: Invalid post' });
                return;
            }

            res.json(post);
        })
    });

router.route('/posts/:post_id/up')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);

            if (!post) {
                res.json({ message: 'Error: Invalid post' });
                return;
            }

            var user = req.body.user;
            if (post.upvoters && post.upvoters.indexOf(user) > -1) {
                res.json({ message: 'Error: Already voted' });
                return;
            }

            post.ups = post.ups + 1;
            post.upvoters.push(user);
            post.rank = Helpers.hot(post.ups, post.downs, post.date, config.voteMultiplier);

            post.save(function(err) {
                if (err) res.send(err);
                res.json({ message: 'OK' });
            });
        });
    });

router.route('/posts/:post_id/down')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);

            if (!post) {
                res.json({ message: 'Error: Invalid post' });
                return;
            }

            var user = req.body.user;
            if (post.downvoters && post.downvoters.indexOf(user) > -1) {
                res.json({ message: 'Error: Already voted' });
                return;
            }

            post.downs = post.downs + 1;
            post.downvoters.push(user);
            post.rank = Helpers.hot(post.ups, post.downs, post.date, config.voteMultiplier);

            post.save(function(err) {
                if (err) res.send(err);
                res.json({ message: 'OK' });
            });
        });
    });

router.route('/posts/:post_id/reply')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);

            if (!post) {
                res.json({ message: 'Error: Invalid post' });
                return;
            }

            if (!Helpers.isValidLocation(req.body.long, req.body.lat)) {
                res.json({ message: 'Error: Invalid location' });
                return;
            }

            if (!req.body.message.trim()) {
                res.json({ message: 'Error: Invalid message' });
                return;
            }

            var reply = pc.create(req, true);

            reply.save(function(err) {
                if (err) res.send(err);
                post.replies.push(reply._id);

                post.save(function(err) {
                    if (err) res.send(err);
                    res.json({ message: 'OK' });
                });
            });

        });
    });

router.route('/karma')

    .get(function(req, res) {
        Post.where('user').equals(req.query.user).select('ups downs').exec(function(err, posts) {
            if (err) res.send(err);
            var karma = 0;
            for (var i = 0; i < posts.length; i++) {
                karma = karma + posts[i].ups - posts[i].downs;
            }
            res.json({ karma: karma });
        });
    });

// REGISTER ROUTES
// #############################################################################
app.use('/', router);

// Set rate limiter on token requests (deprecated)
app.get('/token', rateLimit(config.limiter), function(req, res) {
    res.json({ token: 'foo' });
});

// START SERVER
// #############################################################################
app.listen(config.port);
console.log('Listening on port', config.port);
