const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // Ensure webpack is properly required

module.exports = {
  entry: './src/index.js', // Entry point for your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output file name
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to JavaScript files
        exclude: /node_modules/, // Exclude the node_modules directory
        use: {
          loader: 'babel-loader', // Use Babel for transpiling JavaScript files
        },
      },
    ],
  },
  resolve: {
    // Configuration for resolving modules
    fallback: {
      "stream": require.resolve('stream-browserify'), // Fallback for stream module using stream-browserify
      "process": require.resolve('process/browser'), // Ensure process is resolved for browser environments
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Template file for HtmlWebpackPlugin
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // Provide a polyfill for the process on browser environments
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Update static directory path
    },
    compress: true, // Enable gzip compression
    port: 3000, // Port on which to run the server
    open: true, // Open default browser when the server starts
  },
};
