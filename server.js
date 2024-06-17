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
app.use(express.json());
app.use(express.static(join(__dirname, "build")));

const port = 5001;

// Function to sanitize input
const sanitizeInput = (input) => {
  return String(input).replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Fetch prompts from MongoDB
app.get("/reported-prompts", async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
      },
      data: {
        collection: "prompts",
        database: "userprompts",
        dataSource: "RememberPrompt",
        filter: {}
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Insert new prompts
app.post("/insert-prompts", async (req, res) => {
  const { userId, category, ...fields } = req.body;
  const document = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, sanitizeInput(value)])
  );

  document.userId = sanitizeInput(userId);
  document.category = sanitizeInput(category);

  const config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/insertOne',
    headers: {
      'Content-Type': 'application/json',
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

// Update upvotes for a prompt
app.post('/upvote/:id', async (req, res) => {
  const id = req.params.id;
  const config = {
    method: 'post',
    url: 'https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/insertOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'jXaRAPSi1pp3XxskWF07QA3zmPkDjWudFTl5OrXzytL8ZqtRoSxU6IPWYXby4Xfn'
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      filter: { _id: id },
      update: {
        $inc: { upvotes: 1 } // Increment upvotes by 1
      }
    })
  };

  try {
    const response = await axios(config);
    if (response.data.modifiedCount === 0) {
      res.status(404).json({ success: false, message: 'No document found with the given ID' });
    } else {
      res.json({ success: true, message: 'Upvote successfully incremented', data: response.data });
    }
  } catch (error) {
    console.error('Error when calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle comments
app.post('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { username, comment, userEmail } = req.body;
  // Insert logic to store comments in MongoDB
});

// Serve SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
