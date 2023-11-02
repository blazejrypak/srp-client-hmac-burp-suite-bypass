const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let cachedData = null; // Initialize the cached data as null

app.post('/authHeader', (req, res) => {
    let data = req.body; // Assuming JSON data is sent in the request body
    cachedData = data;
    console.log(data)
    res.json(cachedData);
});

app.get('/challenge', (req, res) => {
    if (cachedData) {
        console.log(cachedData);
        const sha256Hash = require('crypto').createHash('sha256');
        sha256Hash.update(Buffer.from(cachedData.challenge));

        cachedData.index++;
        cachedData.challenge = sha256Hash.digest();
        res.json({...cachedData, challenge: [...cachedData.challenge]}); 
    } else {
        res.json({ message: 'No cached data' });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
