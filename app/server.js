// SETUP
// #############################################################################
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var rateLimit = require('express-rate-limit');
var Helpers = require('./helpers');
var Post = require('./models/post');

console.log('Starting up Indiana API');

var app = express();
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

mongoose.connect(config.mongodbPath);
console.log('MongoDB state', mongoose.connection.readyState);

// ROUTES
// #############################################################################
var router = express.Router();

// Middleware
router.use(function(req, res, next) {
    console.log('Request:', req.method + ' ' +req.originalUrl);
    next();
});

router.route('/')
    .get(function(req, res) {
        res.json({ message: 'Stay a while and listen.' });
    });

router.route('/posts')

    .post(function(req, res) {
        var post = new Post();
        // validate
        post.message = req.body.message;
        // validate
        post.loc = [req.body.long, req.body.lat];
        post.user = req.body.user;
        post.date = new Date().toISOString();
        post.ups = 0;
        post.downs = 0;
        post.upvoters = [],
        post.downvoters = [],
        post.rank = Helpers.hot(post.ups, post.downs, post.date);

        post.save(function(err) {
            if (err) res.send(err);
            res.json({ message: 'OK' });
        });
    })

    .get(function(req, res) {

        var sort = { "rank": -1 }
        if (req.query.sort && (req.query.sort === 'new' || req.query.sort === 'my')) {
            sort = { "date": -1 }
        }

        // validate
        var coords = [parseFloat(req.query.long), parseFloat(req.query.lat)];
        var user = req.query.user;

        var queryArray;
        if (req.query.sort && req.query.sort === 'my') {
            queryArray = [
                {
                    "$match": {
                        "user": user
                    }
                },
                { "$sort": sort },
                { "$limit": config.maxResults }
            ];
        } else {
            queryArray = [
                {
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
                { "$sort": sort },
                { "$limit": config.maxResults }
            ];
        }

        Post.aggregate(
            queryArray,
            function(err, posts) {
                if (err) res.send(err);
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
                        voted: voted
                    });
                }
                res.json(postsRes);
            }
        );
    });

router.route('/posts/:post_id')

    .get(function(req, res) {
        // validate
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);
            res.json(post);
        });
    });

router.route('/posts/:post_id/:action')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);
            var user = req.body.user;
            if (post.upvoters && post.upvoters.indexOf(user) > -1 || post.downvoters && post.downvoters.indexOf(user) > -1) {
                res.json({ message: 'Error: Already voted' });
                return;
            }
            if (req.params.action === 'up') {
                post.ups = post.ups + 1;
                post.upvoters.push(user);
            }
            if (req.params.action === 'down') {
                post.downs = post.downs + 1;
                post.downvoters.push(user);
            }
            post.rank = Helpers.hot(post.ups, post.downs, post.date, config.voteMultiplier);
            post.save(function(err) {
                if (err) res.send(err);
                res.json({ message: 'OK' });
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

// Set rate limiter on token requests
app.get('/token', rateLimit(config.limiter), function(req, res) {
    var token = Helpers.token(req.query.user, config.salt);
    res.json({ token: token });
});

// START SERVER
// #############################################################################
app.listen(config.port);
console.log('Listening on port', config.port);
