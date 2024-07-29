const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
app.get('/api/reported-prompts', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
      },
      data: {
        collection: 'prompts',
        database: 'userprompts',
        dataSource: 'RememberPrompt',
        filter: {}
      }
    });
    const text = response.data;
    console.log('response from MongoDB API in server js:', text);
    res.json(text);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 3000');
});

exports.handler = async (event) => {
  const server = app.listen(3000);
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      console.log('Server started');
      resolve({
        statusCode: 200,
        body: JSON.stringify('Server is running'),
      });
    });
    server.on('error', (error) => {
      console.error('Server failed to start', error);
      reject({
        statusCode: 500,
        body: JSON.stringify('Internal Server Error'),
      });
    });
  });
};
