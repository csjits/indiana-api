// SETUP
// #############################################################################
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Post = require('./models/post');

console.log('Starting up Indiana API')

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
  console.log('Request:', req.originalUrl);
  next();
});

router.route('/')
    .get(function(req, res) {
        res.json({ message: 'Stay a while and listen.' });
    });

router.route('/posts')

    .post(function(req, res) {
        var post = new Post();
        post.message = req.body.message;
        post.loc = { lat: req.body.lat, long: req.body.long};
        post.score = req.body.score || 0;
        post.date = new Date().toISOString();

        post.save(function(err) {
            if (err) res.send(err);
            res.json({ message: 'OK' });
        });
    })

    .get(function(req, res) {
        Post.find({}).sort({date: -1}).exec(function(err, posts) {
            if (err) res.send(err);
            res.json(posts);
        });
    });

router.route('/posts/:post_id')

    .get(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);
            res.json(post);
        });
    });

router.route('/posts/:post_id/up')

    .post(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) res.send(err);
            post.score = post.score + 1;
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
            post.score = post.score - 1;
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
