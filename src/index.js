const collection = require('./config');
const Blog = require('./blog');
const express = require('express');
const path = require('path');
const axios = require('axios');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
//CRUD operations
app.post('/blogs', async (req, res) => {
    const { title, author } = req.body;
    try {
        const blog = new Blog({ title: title, author: author });
        await blog.save()
        res.status(200).send("Success added");
    } catch (err) {
        res.status(500).send("Error while saving blog");
    }
})

app.get('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findById(id)
        res.status(200).send(blog);
    } catch (err) {
        res.status(400).send(err.message);
    }
})

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).send(blogs);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.delete('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findByIdAndDelete(id);
        res.status(200).send(blog);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.put('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { title, author } = req.body;
        const blog = await Blog.findByIdAndUpdate(id, { title, author });
        res.status(200).send(blog);
    } catch (err) {
        res.status(500).send(err.message);
    }
})
//calculate BMI
app.get('/calculator', (req, res) => {
    res.render('calculator');
});
//email
app.get('/email', (req, res) => {
    res.render('email');
});
//Weather API
const timeZoneApiUrl = 'http://api.timezonedb.com/v2.1/get-time-zone';

const WEATHER_API_KEY = 'a983878d6fef354f029edc91f88d0567';
const NEWS_API_KEY = '7eaf4e9b6f4b4489be4770e646870ae3';

app.get('/weather', async (req, res) => {
    res.render('weather');

});
app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    if (!city) {
        return res.status(400).json({ message: 'City is required' });
    }
    try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: WEATHER_API_KEY,
                units: 'metric'
            },
        });

        const weatherData = weatherResponse.data;
        const { country } = weatherData.sys; //dont know

        res.json({
            city: weatherData.name,
            country: country,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            feelsLike: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});