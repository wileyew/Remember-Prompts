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
  return String(input).replace(/<script.*?>.*?<\/script>/gi, '')
                      .replace(/<[\/\!]*?[^<>]*?>/gi, '')
                      .replace(/<style.*?>.*?<\/style>/gi, '')
                      .replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
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

app.post("/insert-prompts", async (req, res) => {
  const { email, category, upvotes, downvotes, comments, ...formData } = req.body;

  const document = {
      category: sanitizeInput(category),
      userId: sanitizeInput(email),
      upvotes: upvotes ? 0 : undefined,  
      downvotes: downvotes ? 0 : undefined,
      comments: comments ? "" : undefined,
  };

  // Only add unique keys from formData that are not already defined in the document
  const filteredFormData = Object.keys(formData)
      .filter(key => !document.hasOwnProperty(key))
      .reduce((acc, key) => {
          acc[key] = sanitizeInput(formData[key]);
          return acc; // No need to modify upvotes, downvotes, comments here
      }, {});

  // Combine document and filteredFormData
  const finalDocument = { ...document, ...filteredFormData };


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
          document: finalDocument  // Use the final, combined document
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


app.post('/upvote/:id', async (req, res) => {
  try {
      const objectId = req.params.id.$oid;
      console.log("Upvoting prompt with ObjectID:", objectId);

      // First attempt to update the existing document
      const updateConfig = {
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
              filter: { _id: { $oid: objectId } }, 
              update: { $inc: { upvotes: 1 } }
          })
      };

      const updateResponse = await axios(updateConfig);
      console.log("MongoDB Update Response:", updateResponse.data);

      // If no document was updated, insert a new one
      if (updateResponse.data.modifiedCount === 0) {
          const { email, category, upvotes, downvotes, comments, ...formData } = req.body;

          const document = {
              ...formData, // Use original data from the request
              category: sanitizeInput(category),
              userId: sanitizeInput(email),
              upvotes: upvotes ? upvotes + 1 : 1, // Start with 1 upvote
              downvotes: downvotes ? 0 : undefined,
              comments: comments ? "" : undefined,
          };

          const insertConfig = {
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
          
          console.log("Inserting new prompt as none found with ObjectID:", objectId);
          const insertResponse = await axios(insertConfig);
          console.log("MongoDB Insert Response:", insertResponse.data); 
      } 

      res.json({ success: true, message: 'Upvote processed successfully' }); // Unified success message

  } catch (error) {
      console.error('Error processing upvote:', error);
      if (error.response) {
          console.error("MongoDB API Error Response:", error.response.data);
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
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
