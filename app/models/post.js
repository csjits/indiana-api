var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    message: String,
    ups: Number,
    downs: Number,
    date: {type: Date, default: Date.now},
    rank: {type: Number, default: 0},
    loc: {type: [Number], index: '2dsphere'},
    user: String,
    upvoters: [String],
    downvoters: [String]
});

PostSchema.path('message').validate(function(v) {
    return v != null;
});

module.exports = mongoose.model('Post', PostSchema);
