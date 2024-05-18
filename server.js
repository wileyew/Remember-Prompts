const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(join(__dirname, "build")));
app.use(express.json()); // Middleware to parse JSON bodies

const port = 5001;

app.get("/reported-prompts", async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': '9VldjBUGjaEHEgCbjIGukvk7gaieKQYpSTM1FZQFbKeabHchOvbDiYIvhq4WCcak'
      },
      data: {
        collection: "prompts",
        database: "userprompts",
        dataSource: "RememberPrompt",
        filter: {} // Assuming you want to fetch all documents without any filter
      }
    });

    // Send the response from MongoDB back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Sanitize input to prevent XSS attacks
const sanitizeInput = (input) => {
  return String(input).replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

app.post("/insert-prompts", async (req, res) => {
  console.log('inside function');
  const { userId, category, ...fields } = req.body;
  console.log('user id ' + userId);

  // Sanitize and structure document fields
  const document = {};
  for (const key in fields) {
    document[key] = sanitizeInput(JSON.stringify(fields[key]));
  }

  // Add sanitized user and category data
  document.userId = sanitizeInput(userId);
  document.category = sanitizeInput(category);

  // MongoDB API configuration
  const config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/insertOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      document: document
    })
  };

  try {
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error('Error when calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html')));

app.listen(port, () => console.log(`Server listening on port ${port}`));
