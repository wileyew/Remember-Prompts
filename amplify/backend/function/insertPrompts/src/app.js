
/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["MONGO_API_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const algorithm = 'aes-256-cbc'; // Encryption algorithm
const secretKey = process.env.ENCRYPTION_KEY; // Ensure this key is 32 characters
const iv = crypto.randomBytes(16); // Initialization vector

// Function to encrypt data
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};
// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});
const sanitizeInput = (input) => {
  return String(input).replace(/<script.*?>.*?<\/script>/gi, '')
                      .replace(/<[\/\!]*?[^<>]*?>/gi, '')
                      .replace(/<style.*?>.*?<\/style>/gi, '')
                      .replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
};


/**********************
 * Example get method *
 **********************/

app.get('/insert-prompts', async function(req, res) {
   
});

app.get('/insert-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/


app.post('/insert-prompts/*', async function(req, res) {
  const { email, category, upvotes, downvotes, comments, ...formData } = req.body;
  const encryptedEmail = encrypt(sanitizeInput(email)); // Encrypt and sanitize email
  const document = {
    category: sanitizeInput(category),
    userId: encryptedEmail, // Store encrypted email
    upvotes: upvotes ? 0 : undefined,
    downvotes: downvotes ? 0 : undefined,
    comments: comments ? '' : undefined
  };

  const filteredFormData = Object.keys(formData)
    .filter((key) => !document.hasOwnProperty(key))
    .reduce((acc, key) => {
      acc[key] = sanitizeInput(formData[key]);
      return acc;
    }, {});

  const finalDocument = { ...document, ...filteredFormData };

  const config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/insertOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.MONGO_API_KEY
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      document: finalDocument
    })
  };

  try {
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error('Error when calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/insert-prompts', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/insert-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/insert-prompts', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/insert-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
