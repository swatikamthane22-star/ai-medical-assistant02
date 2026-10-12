
require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
const apiKey = process.env.GEMINI_API_KEY;

console.log("Port:", PORT);
console.log("MongoDB URI configured:", Boolean(mongoURI));
console.log("JWT secret configured:", Boolean(jwtSecret));
console.log("Gemini API key configured:", Boolean(apiKey));

app.get('/', (req, res) => {
    res.send('Environment variables configured successfully!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
