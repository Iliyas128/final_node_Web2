const collection = require('./config');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "..", "views"));


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    }
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send("User already exists.Please choose another name");
    }
    else {
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRound);

        data.password = hashedPassword;
        const userData = await collection.insertMany(data);
        console.log(userData);
        res.render('login')
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.name });
        if (!check) {
            res.send("Can not find name");
        }
        const passwordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!passwordMatch) {
            res.send("Password does not match");
        }
        else {
            res.render('home');
        }
    }
    catch {
        res.send("wrong details")
    };
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});