const IS_NETLIFY = window.location.hostname.includes('netlify.app') || 
                   window.location.hostname.includes('isayaalive.com');
const API_BASE = IS_NETLIFY ? '/.netlify/functions' : 'http://localhost:3000/api';

async function fetchHeartRate() {
    try {
        const response = await fetch(`${API_BASE}/heartrate`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const lastTenHeartRates = data.data.slice(-10);
        const averageHeartRate = lastTenHeartRates.reduce((sum, reading) => sum + reading.bpm, 0) / lastTenHeartRates.length;
        
        const lastHeartbeat = new Date(lastTenHeartRates[lastTenHeartRates.length - 1].timestamp);
        const dateTimeString = lastHeartbeat.toLocaleDateString() + ' ' + lastHeartbeat.toLocaleTimeString();
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const isOldSync = lastHeartbeat < oneWeekAgo;
        
        const activityValue = document.getElementById('activity-value');
        const runningIcon = document.querySelector('.fa-running');
        
        if (averageHeartRate < 100) {
            activityValue.textContent = "She is resting 😴";
            runningIcon.classList.remove('active');
        } else if (averageHeartRate >= 100 && averageHeartRate <= 110) {
            activityValue.textContent = "She is active! 🚶‍♀️";
            runningIcon.classList.add('active');
        } else {
            activityValue.textContent = "She is working out! 🏃‍♂️💪";
            runningIcon.classList.add('active');
        }
        
        document.getElementById('heart-rate-value').textContent = `${Math.round(averageHeartRate)} BPM (avg)`;
        document.getElementById('last-sync').innerHTML = `Last sync: ${dateTimeString}${
            isOldSync ? '<br><span class="disclaimer">The ring is probably lost, or this website is broken, oh no!</span>' : ''
        }`;

        const statusText = document.getElementById('status-text');
        statusText.textContent = "Yes! Aya is alive! :)";
        statusText.classList.add('alive');

        const heartIcon = document.querySelector('.fa-heart');
        const animationDuration = 60 / averageHeartRate;
        heartIcon.style.animation = `heartbeat ${animationDuration}s infinite`;
    } catch (error) {
        document.getElementById('heart-rate-value').textContent = '-- BPM';
        document.getElementById('last-sync').textContent = 'Last sync: unknown';
        
        const statusText = document.getElementById('status-text');
        statusText.textContent = "Yes! She is alive! :)";
        statusText.classList.add('alive');
    }
}

async function fetchActivity() {
    try {
        const response = await fetch(`${API_BASE}/activity`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const activityTags = data.data || [];
        const recentTags = activityTags.filter(tag => {
            const tagTime = new Date(tag.timestamp);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return tagTime > fiveMinutesAgo;
        });
        
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
        document.getElementById('activity-value').textContent = '--';
        
        document.getElementById('status-text').textContent = 'REQUEST FAILED - DO NOT BE ALARMED';
        document.getElementById('status-text').style.color = '#ff6b6b';
    }
}

setInterval(() => {
    fetchHeartRate();
    fetchActivity();
}, 60000);

fetchHeartRate();
fetchActivity();
