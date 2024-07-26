const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.get('/api/reported-prompts', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MONGO_API_KEY
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
