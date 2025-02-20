const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

const OURA_TOKEN = '3H2QECPJLWKO4U24FYDURJFUWCSYX6YA';
const OURA_HEADERS = {
    'Authorization': `Bearer ${OURA_TOKEN}`,
    'Content-Type': 'application/json'
};

app.get('/api/heartrate', async (req, res) => {
    try {
        const response = await fetch('https://api.ouraring.com/v2/usercollection/heartrate', {
            headers: OURA_HEADERS
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Oura API' });
    }
});

app.get('/api/activity', async (req, res) => {
    try {
        const response = await fetch('https://api.ouraring.com/v2/usercollection/tag', {
            headers: OURA_HEADERS
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch activity data from Oura API' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
