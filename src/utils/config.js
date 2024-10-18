require('dotenv').config(); // This line is needed to load the environment variables from the .env file

const axios = require('axios'); // Assuming Axios is used for HTTP requests

const data = JSON.stringify({
  collection: 'prompts',
  database: 'userprompts',
  dataSource: 'RememberPrompt',
  // Ensure `receivedData` is defined or imported from somewhere
});

const config = {
  method: 'post',
  url: 'mongodb://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/insertOne',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE' // Use the environment variable here
  },
  data: data
};

// Export the config for use in mongoClientConnection.js
module.exports = config;
