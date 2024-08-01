
//Use the following code to retrieve configured secrets from SSM:

const AWS = require('aws-sdk');
const axios = require('axios');
const sm = new AWS.SecretsManager({region: 'us-east-1'});

// const { Parameters } = await (new AWS.SSM())
//   .getParameters({
//     Names: ["MONGO_API_KEY"].map(secretName => process.env[secretName]),
//     WithDecryption: true,
//   })
//   .promise();

//   const getSecrets = async (SecretId) => {
//     return new Promise((resolve, reject) => {
//         sm.getSecretValue({ SecretId }, (err, result) => {
//             if (err) reject(err);
//             else resolve(result.SecretString); // Assuming you want the secret string
//         });
//     });
// };

const getSecrets = await (new AWS.SSM())
.getParameters({
  Names: ["MONGO_API_KEY"].map(secretName => process.env[secretName]),
  WithDecryption: true,
})
.promise();


  /*
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
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

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


/**********************
 * Example get method *
 **********************/

 app.get('/reporting-prompts', function(req, res) {
  try {
    const apiKey =  getSecrets('MONGO_API_KEY');

    
    const response =  axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
        // Safely using the API key
      },
      data: {
        collection: 'prompts',
        database: 'userprompts',
        dataSource: 'RememberPrompt',
        filter: {}
      }
    });
}catch (error) {
}
 });

app.get('/reporting-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/reporting-prompts', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/reporting-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/reporting-prompts', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/reporting-prompts/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/reporting-prompts', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/reporting-prompts/*', function(req, res) {
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
