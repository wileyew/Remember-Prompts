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
app.post("/insert-prompts", async (req, res) => {
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

app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html')));

app.listen(port, () => console.log(`Server listening on port ${port}`));
