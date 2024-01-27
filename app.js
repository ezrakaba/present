const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/birthday-present', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User schema
const userSchema = new mongoose.Schema({
  age: Number,
  interests: [String]
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Serve the first page
app.get('/', (req, res) => {
  res.send(`
    <h1>Choose your age range:</h1>
    <a href="/form/18-30">18-30</a><br>
    <a href="/form/31-42">31-42</a><br>
    <a href="/form/42-60">42-60</a><br>
  `);
});

// Serve the form page
app.get('/form/:ageRange', (req, res) => {
  const ageRange = req.params.ageRange;
  res.send(`
    <h1>What are your interests?</h1>
    <form action="/submit" method="post">
      <input type="hidden" name="ageRange" value="${ageRange}">
      <label for="interest1">Interest 1:</label><br>
      <input type="text" name="interest1" id="interest1"><br>
      <label for="interest2">Interest 2:</label><br>
      <input type="text" name="interest2" id="interest2"><br>
      <label for="interest3">Interest 3:</label><br>
      <input type="text" name="interest3" id="interest3"><br>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Handle form submission
app.post('/submit', (req, res) => {
  const ageRange = req.body.ageRange;
  const interests = [req.body.interest1, req.body.interest2, req.body.interest3];
  const user = new User({ age: parseInt(ageRange), interests });
  user.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving user');
    } else {
      res.send(`
        <h1>Thank you!</h1>
        <p>Based on your age range and interests, we suggest the following birthday present:</p>
        <p>${getPresentSuggestion(ageRange, interests)}</p>
        <p><a href="/">Go back</a></p>
      `);
    }
  });
});

// Get a random present suggestion based on age range and interests
function getPresentSuggestion(ageRange, interests) {
  const presentSuggestions = {
    '18-30': ['gift card', 'headphones', 'book'],
    '31-42': ['watch', 'jewelry', 'backpack'],
    '42-60': ['gardening tools', 'cookware', 'fitness equipment']
  };
  const interestsSet = new Set(interests);
  const matchingSuggestions = presentSuggestions[ageRange].filter((suggestion) => interestsSet.has(suggestion));
  return matchingSuggestions[Math.floor(Math.random() * matchingSuggestions.length)];
}

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});