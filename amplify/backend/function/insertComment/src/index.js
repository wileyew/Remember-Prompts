const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const awsServerlessExpress = require('aws-serverless-express');
const app = express();
app.use(bodyParser.json());

// Middleware to check API key
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Endpoint to fetch reported prompts
app.get('/api/reported-prompts', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      data: {
        collection: 'prompts',
        database: 'userprompts',
        dataSource: 'RememberPrompt',
        filter: {}
      }
    });
    console.log('response from MongoDB API in server js:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create server
const server = awsServerlessExpress.createServer(app);

// Lambda handler
exports.handler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context);
};
