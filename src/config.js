const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017');

connect.then(() => {
    console.log('Connected correctly to server');
}).catch(() => console.log("Database connection error"));

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model('users', LoginSchema);

module.exports = collection;