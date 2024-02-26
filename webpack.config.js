const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
    resolve: {
        // Add fallbacks
        fallback: {
          "stream": require.resolve('stream-browserify'),
          // Add other fallbacks here as needed
        },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
  ],
  devServer: {
    contentBase: './dist',
  },
};
