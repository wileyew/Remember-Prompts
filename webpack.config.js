// require('dotenv').config(); // If you're using dotenv to load environment variables

// module.exports = {
//   // Other configuration...

//   plugins: [
//     new webpack.EnvironmentPlugin({
//       NODE_ENV: 'development', // Use 'development' as default value or process.env.NODE_ENV
//       API_ENDPOINT: process.env.API_ENDPOINT || 'https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find', // Provide a default value or use an environment variable
//     })
//   ],
  
//   resolve: {
//     fallback: {
//       "fs": false, // Choosing not to polyfill 'fs'
//       "path": require.resolve("path-browserify"), // Polyfill for 'path'
//       "http": require.resolve("stream-http"), // Polyfill for 'http'
//       "zlib": require.resolve("browserify-zlib"), // Polyfill for 'zlib'
//       "querystring": require.resolve("querystring-es3"), // Polyfill for 'querystring'
//       "os": require.resolve("os-browserify/browser"), // Polyfill for 'os'
//       // Note: If you're not actually using these modules (fs, http, zlib, etc.) in your code,
//       // these polyfills might be unnecessary.
//     }
//   },
//   // Other configuration...
// };
const webpack = require('webpack');
require('dotenv').config(); // Load environment variables from .env file in Node.js environment

module.exports = {
  // Your existing Webpack configuration...
  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV', // Ensures process.env.NODE_ENV is available
      'https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find', // Replace 'API_ENDPOINT' with the actual environment variables you need
    ]),
  ],
};
