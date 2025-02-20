// Future Oura Ring API interactions will go here
console.log('Oura Ring Status App Initialized');

// Determine if we're in production (Netlify) or development
const IS_NETLIFY = window.location.hostname.includes('netlify.app');
const API_BASE = IS_NETLIFY ? '/.netlify/functions' : 'http://localhost:3000/api';

async function fetchHeartRate() {
    try {
        const response = await fetch(`${API_BASE}${IS_NETLIFY ? '/heartrate' : '/heartrate'}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Get last 10 heart rates and calculate average
        const lastTenHeartRates = data.data.slice(-10);
        const averageHeartRate = lastTenHeartRates.reduce((sum, reading) => sum + reading.bpm, 0) / lastTenHeartRates.length;
        
        // Update heart rate display with average
        document.getElementById('heart-rate-value').textContent = `${Math.round(averageHeartRate)} BPM (avg)`;

        // Update status text if heart rate is greater than 0
        const statusText = document.getElementById('status-text');
        if (averageHeartRate > 0) {
            statusText.textContent = "Yes! Aya is alive! :)";
            statusText.classList.add('alive');
        }

        // Adjust heart animation speed based on average heart rate
        const heartIcon = document.querySelector('.fa-heart');
        const animationDuration = 60 / averageHeartRate;
        heartIcon.style.animation = `heartbeat ${animationDuration}s infinite`;
    } catch (error) {
        console.error('Error fetching heart rate:', error);
        document.getElementById('heart-rate-value').textContent = 'Error loading heart rate';
    }
}

async function fetchActivity() {
    try {
        const response = await fetch(`${API_BASE}${IS_NETLIFY ? '/activity' : '/activity'}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Get the most recent tag data
        const activityTags = data.data || [];
        const recentTags = activityTags.filter(tag => {
            const tagTime = new Date(tag.timestamp);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return tagTime > fiveMinutesAgo;
        });
        
        // Update activity status
        const activityValue = document.getElementById('activity-value');
        const runningIcon = document.querySelector('.fa-running');
        
        if (recentTags.length > 0) {
            const activities = recentTags.map(tag => tag.tag_type_1);
            if (activities.includes('exercise')) {
                activityValue.textContent = "She's working out! 🏃‍♂️💪";
                runningIcon.classList.add('active');
            } else if (activities.includes('activity')) {
                activityValue.textContent = "She's up and active! 🚶‍♀️";
                runningIcon.classList.add('active');
            } else {
                activityValue.textContent = "She's taking it easy 😌";
                runningIcon.classList.remove('active');
            }
        } else {
            activityValue.textContent = "She's currently resting 😴";
            runningIcon.classList.remove('active');
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
        document.getElementById('activity-value').textContent = 'Error loading activity';
    }
}

// Fetch data immediately and then every 60 seconds
fetchHeartRate();
fetchActivity();
setInterval(() => {
    fetchHeartRate();
    fetchActivity();
}, 60000);
