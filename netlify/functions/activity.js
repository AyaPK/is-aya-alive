const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Log all environment variables for debugging
  console.log('Environment Variables:', {
    OURA_TOKEN: process.env.OURA_TOKEN ? 'Present' : 'Missing',
    OURA_ACCESS_TOKEN: process.env.OURA_ACCESS_TOKEN ? 'Present' : 'Missing'
  });

  try {
    // Try with OURA_TOKEN first
    let token = process.env.OURA_TOKEN || process.env.OURA_ACCESS_TOKEN;
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No Oura Ring API token found' })
      };
    }

    const response = await fetch('https://api.ouraring.com/v2/usercollection/daily_activity', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Log raw response status and headers
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    
    // Log parsed data
    console.log('Parsed Data:', JSON.stringify(data));

    // If API returns an error message
    if (data.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'API Error',
          message: data.message 
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    // Detailed error logging
    console.error('Fetch Error:', {
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch activity',
        details: error.toString()
      })
    };
  }
};
