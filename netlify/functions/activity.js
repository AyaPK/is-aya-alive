const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const response = await fetch('https://api.ouraring.com/v2/usercollection/tag', {
      headers: {
        'Authorization': `Bearer ${process.env.OURA_ACCESS_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Don\'t worry! I\'m alive! Just having trouble getting my activity data from the Oura Ring API.' })
    };
  }
};
