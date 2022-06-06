const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
 module: {
   rules: [
     {
       test: /\.css$/i,
       use: ['style-loader', 'css-loader'],
     },
   ],
 },
 plugins: [
    new HtmlWebpackPlugin({
        hash: true,
        title: 'Reddit Connections',
        template: './src/index.html',
        favicon: './src/logo.png',
        filename: 'index.html' //relative to root of the application,
    })
    ],
    resolve: {
        fallback: { 
            "querystring": require.resolve("querystring-es3"),
            // "timers": require.resolve("timers-browserify"),
            // "util": require.resolve("util/"),
            "url": require.resolve("url/"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/")
        },
    },
    externals: {
        jquery: 'jQuery'
    }
};