var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    message: String,
    ups: Number,
    downs: Number,
    date: {type: Date, default: Date.now},
    rank: {type: Number, default: 0},
    loc: {type: [Number], index: '2dsphere'},
    user: { type: String, index: true },
    upvoters: [String],
    downvoters: [String],
    replies: {type: [Schema.Types.ObjectId], ref: 'Post'},
    isReply: {type: Boolean, default: false}
});

PostSchema.path('message').validate(function(v) {
    return v != null;
});

module.exports = mongoose.model('Post', PostSchema);
