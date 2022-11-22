const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const showdown = require('showdown');

const config = require('./config/config.json');

const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    let testimonials = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    testimonials = testimonials.testimonials;
    // For each testimonial, convert the markdown to HTML
    for (let testimonial of testimonials) {
        testimonial.testimonial = converter.makeHtml(testimonial.testimonial);
    }
    res.render('index.ejs', { testimonials: testimonials });
});

app.get('/create', (req, res) => {
    res.render('create.ejs');
});

app.post('/create', (req, res) => {
    // Get name, testimonial, and verification code from the form
    let name = req.body.name;
    let testimonial = req.body.testimonial;
    let verificationCode = req.body.verification;
    // Check if the verification code is correct
    if (verificationCode === config.verificationCode) {
        // Read the data file
        let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        // Add the testimonial to the data file
        data.testimonials.push({
            name: name,
            testimonial: testimonial
        });
        // Write the data file
        fs.writeFileSync('data.json', JSON.stringify(data));
        // Redirect to the home page
        res.redirect('/');
    } else {
        // Verification code is incorrect, rerender the page with an error message
        res.render('create.ejs', { error: 'Verification code is incorrect.' });
    }
});

// About page
app.get('/about', (req, res) => {
    res.render('about.ejs');
});

// Run the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});