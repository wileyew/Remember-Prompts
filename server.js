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

// Fetch prompts from MongoDB with updated upvotes
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
app.post("/upvote-prompt", async (req, res) => {

  //convert 
  console.log ('request details' + JSON.stringify(req.body ));
  const { promptId } = req.body;  // Assuming the client sends `promptId` that needs the upvote
  const promptIdInt = Number(promptId);
  const config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      filter: { _id: promptIdInt },  // Filter document by `id`
      update: {
        $inc: { upvotes: 1 }  // Increment `upvotes` by 1
      }
    })
  };

  try {
    const response = await axios(config);
    if (response.data.matchedCount === 0) {
      return res.status(404).send('Prompt not found');
    }
    res.json({ message: "Upvote successful", updatedCount: response.data.modifiedCount });
  } catch (error) {
    console.error('Error when calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Update upvotes for a prompt
app.post('/upvote/:id', async (req, res) => {
  console.log('request details' + JSON.stringify(req.body));
  const { promptId } = req.body;  // Assuming the client sends `promptId` that needs the upvote

  const config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      filter: { _id: promptId },  // Ensure this ID is correctly formatted if necessary
      update: {
        $inc: { upvotes: 1 }  // Increment `upvotes` by 1
      }
    })
  };

  try {
    const response = await axios(config);
    if (response.data.matchedCount === 0) {
      return res.status(404).send('Prompt not found');
    }
    res.json({ message: "Upvote successful", updatedCount: response.data.modifiedCount });
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
