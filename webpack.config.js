const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");

const developmentConfig = {
  mode: 'development',
  entry: ['./dev/index.js'],
  output: {
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: { "path": require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        enforce: 'pre',
        use: [{
          loader: 'prettier-loader',
          options: {
            parser: 'babel'
          }
        }]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),

  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: "./",
    compress: false,
    port: 9000,
    writeToDisk: true
  },
}

const productionConfig = {
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: { path: require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
    ],
  },
  externals: {
    react: 'react',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'CreateRelationWidget',
    libraryTarget: 'umd',
    libraryExport: 'default',
  }
}

module.exports = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
