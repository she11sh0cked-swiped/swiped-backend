const nodeExternals = require('webpack-node-externals')
const path = require('path')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const { NODE_ENV = 'production' } = process.env

module.exports = {
  context: __dirname,
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  externals: [nodeExternals()],
  mode: NODE_ENV,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new SimpleProgressWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  target: 'node',
}
