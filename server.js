require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Define CORS options
const corsOptions = {
  origin: "*", // Adjust as needed for production
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors(corsOptions)); // Correct usage of CORS with options
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

app.use(cors({
  origin: 'https://workingwebserver.d1gjum1suik77t.amplifyapp.com'
}));

const { ObjectId } = require('mongodb');

const sanitizeInput = (input) => {
  return String(input).replace(/<script.*?>.*?<\/script>/gi, '')
                      .replace(/<[\/\!]*?[^<>]*?>/gi, '')
                      .replace(/<style.*?>.*?<\/style>/gi, '')
                      .replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
};

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/reported-prompts', async (req, res) => {
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
    res.json(response.data);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/insert-prompts', async (req, res) => {
  const { email, category, upvotes, downvotes, comments, ...formData } = req.body;
  const document = {
    category: sanitizeInput(category),
    userId: sanitizeInput(email),
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
});

app.post('/upvote/:id', async (req, res) => {
  const objectId = req.params.id;
  console.log('Upvoting prompt with ObjectID:', objectId);

  const updateConfig = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.MONGO_API_KEY
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      filter: { _id: ObjectId(objectId) },
      update: { $inc: { upvotes: 1 } },
      upsert: true
    })
  };

  try {
    const updateResponse = await axios(updateConfig);
    console.log('Update response:', updateResponse.data);
  } catch (error) {
    console.error('Error during the upvote operation:', error);
    res.status(500).send('Error while upvoting the prompt.');
  }
});

app.post('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { username, comment, userEmail } = req.body;

  const safeComment = sanitizeInput(comment);
  const safeUsername = sanitizeInput(username);

  const commentObject = {
    username: safeUsername,
    comment: safeComment,
    userEmail: sanitizeInput(userEmail),
    timestamp: new Date()
  };

  const updateConfig = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.MONGO_API_KEY
    },
    data: JSON.stringify({
      collection: 'prompts',
      database: 'userprompts',
      dataSource: 'RememberPrompt',
      filter: { _id: ObjectId(id) },
      update: {
        $push: { comments: commentObject }
      }
    })
  };

  try {
    const response = await axios(updateConfig);
    if (response.data.modifiedCount === 1) {
      console.log('ID: ' + id);
      res.status(200).send('Comment added successfully.');
    } else {
      res.status(404).send('No prompt found with the given ID.');
    }
  } catch (error) {
    console.error('Error while adding comment:', error);
    res.status(500).send('Failed to add comment due to server error.');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
