const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const OfflinePlugin = require('offline-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "[name]-[hash].css"
});

const webRoot = function (env) {
  if (env === 'production') {
    return 'https://wallet.mixcoin.one';
  } else {
    return 'http://wallet.mixin.local';
  }
};

const appId = function (env) {
  return 'b7347ca4-186e-4e54-9db6-755a4ab0b5d4';
};

const appPrivateKey = function (env) {
  return ``;
};

const appSessionId = function (env) {
  return 'ee3ef954-fc93-48f8-ad50-bc705f9164e5';
};

module.exports = {
  entry: {
    app: './src/app.js'
  },

  output: {
    publicPath: '/assets/',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-[chunkHash].js'
  },

  resolve: {
    alias: {
      jquery: "jquery/dist/jquery",
      handlebars: "handlebars/dist/handlebars.runtime"
    }
  },

  module: {
    rules: [{
      test: /\.html$/, loader: "handlebars-loader?helperDirs[]=" + __dirname + "/src/helpers"
    }, {
      test: /\.(scss|css)$/,
      use: extractSass.extract({
        use: [{
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }],
        fallback: "style-loader"
      })
    }, {
      test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpg|gif)$/,
      use: [
        'file-loader'
      ]
    }]
  },

  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: (process.env.NODE_ENV === 'production'),
      WEB_ROOT: JSON.stringify(webRoot(process.env.NODE_ENV)),
      APP_NAME: JSON.stringify("Mixin Wallet"),
      APP_SESSION_ID: JSON.stringify(appSessionId(process.env.NODE_ENV)),
      APP_PRIVATE_KEY: JSON.stringify(appPrivateKey(process.env.NODE_ENV)),
      APP_CLIENT_ID: JSON.stringify(appId(process.env.NODE_ENV))
    }),
    new HtmlWebpackPlugin({
      template: './src/layout.html'
    }),
    new FaviconsWebpackPlugin({
      logo: './src/launcher.png',
      prefix: 'icons-[hash]-',
      background: '#FFFFFF'
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async'
    }),
    extractSass
    ,new OfflinePlugin()
  ]
};
