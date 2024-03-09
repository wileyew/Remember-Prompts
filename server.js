const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const axios = require("axios");
const { connect } = require('./src/mongoClient');
const cors = require("cors"); // Import cors


const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.static(join(__dirname, "build")));

const port =  5001;

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  prompt: { type: String, required: true },
  hallucinationAnswer: { type: String, required: true },
  answerUpdated: { type: String, required: false },
  answerVersionAnswerUpdated: { type: String, required: false, default: '' },
  versionChatbotHallucinationAnswer: { type: String, required: true },
  chatbotPlatform: { type: String, required: true },
  updatedPromptAnswer: { type: String, required: true },
  promptTrigger: { type: String, required: true },
  keywordSearch: { type: String, required: true },
  privacy: { type: Boolean, required: true },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PromptRecord', schema);

// Connection
const mongoURI = 'mongodb+srv://evanwwiley:NeothematrixRedPillORBlue3@rememberprompt.iraz3qt.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  app.get("/reported-prompts", async (req, res) => {
    console.log('checking for data.');
    try {
      const response = await axios.post('https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find', {
        "collection": "prompts",
        "database": "userprompts",
        "dataSource": "RememberPrompt",
        "filter": {}
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'// Corrected environment variable access
        }
      });
  
      // Send the response from MongoDB back to the client
      res.json(response.data);
    } catch (error) {
      console.error('Error calling MongoDB API:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.static(join(__dirname, "build")));

app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html')));

app.listen(port, () => console.log(`Server listening on port ${port}`));
