const fetch = require('node-fetch');

exports.handler = async function(event, context) {
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

    const response = await fetch('https://api.ouraring.com/v2/usercollection/heartrate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Oura API Response Status:', response.status);

    if (!response.ok) {
      console.error('Oura API Error:', {
        status: response.status,
        statusText: response.statusText
      });

      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Failed to fetch heart rate data',
          details: 'Unable to retrieve data from Oura API'
        })
      };
    }

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
        data: data.data ? data.data.slice(-2) : [],
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
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
