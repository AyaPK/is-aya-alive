const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the current directory
app.use(express.static('.'));

// Mock responses for testing - change these values to test different states
const MOCK = {
    enabled: false,  // Set to false to use real API
    heartRate: 10,  // Set any BPM you want to test
    activity: 'exercise'  // 'activity' for active, 'exercise' for workout, 'rest' for resting
};

const OURA_TOKEN = '3H2QECPJLWKO4U24FYDURJFUWCSYX6YA';
const OURA_HEADERS = {
    'Authorization': `Bearer ${OURA_TOKEN}`,
    'Content-Type': 'application/json'
};

app.get('/api/heartrate', async (req, res) => {
    // Return mock response if enabled
    if (MOCK.enabled) {
        // Create mock data array with 10 readings of the same heart rate
        const mockData = Array(10).fill({
            timestamp: new Date().toISOString(),
            bpm: MOCK.heartRate
        });
        return res.json({ data: mockData });
    }

    try {
        const response = await fetch('https://api.ouraring.com/v2/usercollection/heartrate', {
            headers: OURA_HEADERS
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Don\'t worry! I\'m alive! The Oura Ring API is just having a temporary issue.' });
    }
});

app.get('/api/activity', async (req, res) => {
    // Return mock response if enabled
    if (MOCK.enabled) {
        // Create a mock tag with current timestamp
        const mockData = [{
            timestamp: new Date(Date.now() - 1000).toISOString(), // 1 second ago, well within 5 minutes
            tag_type_1: MOCK.activity  // This should be exactly 'activity', 'exercise', or anything else for rest
        }];
        return res.json({ data: mockData });
    }

    try {
        const response = await fetch('https://api.ouraring.com/v2/usercollection/tag', {
            headers: OURA_HEADERS
        });
        
        const data = await response.json();
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Don\'t worry! I\'m alive! The Oura Ring API is just having trouble with activity data right now.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
