const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017/test');

connect.then(() => {
    console.log('Connected correctly to server');
}).catch(() => console.log("Database connection error"));

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

const Blog = mongoose.model('blogs', BlogSchema);
module.exports = Blog;