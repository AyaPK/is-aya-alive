const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Validate request origin (optional but recommended)
  const allowedOrigins = [
    'https://isayaalive.com', 
    'http://localhost:3000', 
    'https://localhost:3000'
  ];
  const origin = event.headers.origin;
  
  if (origin && !allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized origin' })
    };
  }

  try {
    const token = process.env.OURA_TOKEN;
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No authentication token available' })
      };
    }

    // Proxy the request to Oura API with secure token handling
    const response = await fetch('https://api.ouraring.com/v2/usercollection/daily_activity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Log only non-sensitive information
    console.log('Oura API Response Status:', response.status);

    // Check if the response is successful
    if (!response.ok) {
      // Log error details without exposing token
      console.error('Oura API Error:', {
        status: response.status,
        statusText: response.statusText
      });

      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Failed to fetch activity data',
          details: 'Unable to retrieve data from Oura API'
        })
      };
    }

    // Parse and return only necessary data
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({
        data: data.data ? data.data.slice(-10) : [], // Only return last 10 entries
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    // Log error without sensitive information
    console.error('Fetch Error:', {
      message: error.message,
      name: error.name
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: 'Unable to process request'
      })
    };
  }
};
