const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || '/api'),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: Number(process.env.PORT || 3000),
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: process.env.BACKEND_URL || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    ],
    setupMiddlewares: function (middlewares, devServer) {
      devServer.app.get('/health', (req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          name: 'expense-tracker-frontend',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        });
      });
      return middlewares;
    },
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
