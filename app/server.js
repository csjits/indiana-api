// SETUP
// #############################################################################
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
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
        //validate
        post.loc = [req.body.long, req.body.lat];
        post.date = new Date().toISOString();
        post.ups = 0;
        post.downs = 0;
        post.rank = Helpers.hot(post.ups, post.downs, post.date);

        post.save(function(err) {
            if (err) res.send(err);
            res.json({ message: 'OK' });
        });
    })

    .get(function(req, res) {

        var sort = { "rank": -1 }
        if (req.query.sort && req.query.sort === 'new') {
            sort = { "date": -1 }
        }

        // validate
        var coords = [parseFloat(req.query.long), parseFloat(req.query.lat)];

        Post.aggregate(
            [
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
                { "$sort": sort }
            ],
            function(err, posts) {
                if (err) res.send(err);
                var postsRes = [];
                for (var i = 0; i < posts.length; i++) {
                    postsRes.push({
                        id: posts[i]._id,
                        message: posts[i].message,
                        score: posts[i].ups - posts[i].downs,
                        rank: posts[i].rank,
                        age: Helpers.getAge(posts[i].date),
                        distance: Helpers.getDistance(posts[i].dis, config.distancePrecision)
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

router.route('/posts/:post_id/up')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);
            post.ups = post.ups + 1;
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
            post.downs = post.downs + 1;
            post.rank = Helpers.hot(post.ups, post.downs, post.date, config.voteMultiplier);
            post.save(function(err) {
                if (err) res.send(err);
                res.json({ message: 'OK' });
            });
        });
    });

// REGISTER ROUTES
// #############################################################################
app.use('/', router);

// START SERVER
// #############################################################################
app.listen(config.port);
console.log('Listening on port', config.port);
