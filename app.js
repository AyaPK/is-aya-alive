// Future Oura Ring API interactions will go here
console.log('Oura Ring Status App Initialized');

// Determine if we're in production (Netlify) or development
const IS_NETLIFY = window.location.hostname.includes('netlify.app');
const API_BASE = IS_NETLIFY ? '/.netlify/functions' : 'http://localhost:3000';

async function fetchHeartRate() {
    try {
        const response = await fetch(`${API_BASE}${IS_NETLIFY ? '/heartrate' : '/api/heartrate'}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Full response data:', data);
        // Get last 10 heart rates and calculate average
        const lastTenHeartRates = data.data.slice(-10);
        console.log('Last 10 heart rates:', lastTenHeartRates);
        const averageHeartRate = lastTenHeartRates.reduce((sum, reading) => sum + reading.bpm, 0) / lastTenHeartRates.length;
        
        // Get the most recent timestamp
        const lastHeartbeat = new Date(lastTenHeartRates[lastTenHeartRates.length - 1].timestamp);
        const dateTimeString = lastHeartbeat.toLocaleDateString() + ' ' + lastHeartbeat.toLocaleTimeString();
        
        // Check if sync is more than 1 week old
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const isOldSync = lastHeartbeat < oneWeekAgo;
        
        // Determine activity status based on heart rate
        const activityValue = document.getElementById('activity-value');
        const runningIcon = document.querySelector('.fa-running');
        
        console.log('Average Heart Rate:', averageHeartRate);
        
        if (averageHeartRate < 100) {
            console.log("less than")
            activityValue.textContent = "She is resting 😴";
            runningIcon.classList.remove('active');
        } else if (averageHeartRate >= 100 && averageHeartRate <= 110) {
            console.log("more than")
            activityValue.textContent = "She is active! 🚶‍♀️";
            runningIcon.classList.add('active');
        } else {
            activityValue.textContent = "She is working out! 🏃‍♂️💪";
            runningIcon.classList.add('active');
        }
        
        // Update heart rate display and timestamp separately
        document.getElementById('heart-rate-value').textContent = `${Math.round(averageHeartRate)} BPM (avg)`;
        document.getElementById('last-sync').innerHTML = `Last sync: ${dateTimeString}${
            isOldSync ? '<br><span class="disclaimer">The ring is probably lost, or this website is broken, oh no!</span>' : ''
        }`;

        // Always show alive status
        const statusText = document.getElementById('status-text');
        statusText.textContent = "Yes! Aya is alive! :)";
        statusText.classList.add('alive');

        // Adjust heart animation speed based on average heart rate
        const heartIcon = document.querySelector('.fa-heart');
        const animationDuration = 60 / averageHeartRate;
        heartIcon.style.animation = `heartbeat ${animationDuration}s infinite`;
    } catch (error) {
        console.error('Error fetching heart rate:', error);
        document.getElementById('heart-rate-value').textContent = '-- BPM';
        document.getElementById('last-sync').textContent = 'Last sync: unknown';
        
        // Even on error, show alive status
        const statusText = document.getElementById('status-text');
        statusText.textContent = "Yes! She is alive! :)";
        statusText.classList.add('alive');
    }
}

async function fetchActivity() {
    try {
        const response = await fetch(`${API_BASE}${IS_NETLIFY ? '/activity' : '/api/activity'}`);

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
            const mostRecentTag = recentTags[0].tag_type_1;
            if (mostRecentTag === 'exercise') {
                activityValue.textContent = "She's working out! 🏃‍♂️💪";
                runningIcon.classList.add('active');
            } else if (mostRecentTag === 'activity') {
                activityValue.textContent = "She's up and active! 🚶‍♀️";
                runningIcon.classList.add('active');
            } else {
                activityValue.textContent = "She's taking it easy 😌";
                runningIcon.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
        document.getElementById('activity-value').textContent = '--';
        
        document.getElementById('status-text').textContent = 'REQUEST FAILED - DO NOT BE ALARMED';
        document.getElementById('status-text').style.color = '#ff6b6b';  // Red-orange color
    }
}

// Fetch data immediately and then every 60 seconds
fetchHeartRate();
fetchActivity();
setInterval(() => {
    fetchHeartRate();
    fetchActivity();
}, 60000);
