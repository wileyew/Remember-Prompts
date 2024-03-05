const { MongoClient } = require('mongodb');
const MongoVariables = require("./utils/config");
// Connection URL and Database Name
const url = MongoVariables.url; // Update URL if needed
console.log('url for mongo' + JSON.stringify(url));
const dbName = 'yourDatabaseName'; // Replace with your database name

const client = new MongoClient(url, { useUnifiedTopology: true });

async function connect() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

module.exports = { connect };
