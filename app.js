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
        
        if (averageHeartRate < 70) {
            activityValue.textContent = "Ssssshhhhh, she is sleeping! 😴";
            runningIcon.classList.remove('active');
        } else if (averageHeartRate < 100) {
            activityValue.textContent = "She is resting 😌";
            runningIcon.classList.remove('active');
        } else if (averageHeartRate >= 100 && averageHeartRate <= 110) {
            activityValue.textContent = "She is active! 🚶‍♀️";
            runningIcon.classList.add('active');
        } else {
            activityValue.textContent = "She is working out! 🏃‍♀️💪";
            runningIcon.classList.add('active');
        }
        
        document.getElementById('heart-rate-value').textContent = `${Math.round(averageHeartRate)} BPM`;
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
        console.error('Error fetching heart rate:', error);
        document.getElementById('heart-rate-value').textContent = '-- BPM';
        document.getElementById('last-sync').textContent = 'Last sync: unknown';
        
        const statusText = document.getElementById('status-text');
        statusText.textContent = "Yes! She is alive! :)";
        statusText.classList.add('alive');
    }
}

setInterval(fetchHeartRate, 60000);
fetchHeartRate();
