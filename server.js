const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const { connect } = require('./src/mongoClient');

const app = express();

const port = process.env.SERVER_PORT || 3000;

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect('mongodb://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find', {
useNewUrlParser: true,
useUnifiedTopology: true,
});

// Define a simple schema and model
const ItemSchema = new mongoose.Schema({
name: prompts,
});
const Item = mongoose.model('Item', ItemSchema);

// Define a route to fetch items
app.get('/items', async (req, res) => {
const items = await Item.find();
res.json(items);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});


app.use(express.static(join(__dirname, "build")));

app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html')));

app.listen(port, () => console.log(`Server listening on port ${port}`));
