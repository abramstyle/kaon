const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const babelOptions = require('../../.babelrc');

const { generateCdnPath } = require('../../utils');

const getConfig = config => ({
  mode: 'production',
  entry: {
    app: [
      // 'babel-polyfill',
      config.isomorphic.main,
    ],
    commons: [
      'react',
      'redux',
      'react-redux',
      'react-dom',
      'react-router',
      'react-router-dom',
      'react-helmet',
    ],
  },
  output: {
    filename: '[name]-[chunkhash].js',

    chunkFilename: '[name]-[chunkhash].js',

    path: config.build.target,

    publicPath: generateCdnPath(config),
  },

  devtool: 'source-map',

  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: babelOptions,
      }],
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          minimize: true,
          modules: true,
          importLoaders: 1,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      }, {
        loader: 'postcss-loader',
        options: {
          config: {
            path: path.resolve(__dirname, '../postcss.config.js'),
          },
        },
      }],
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          minetype: 'application/font-woff',
        },
      },
    }, {
      test: /\.jpe?g$|\.gif$|\.png$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: {
        loader: 'file-loader',
      },
    }],
  },

  optimization: {
    namedModules: true,
    minimize: false,
    minimizer: [
      new UglifyJsPlugin(),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },

  performance: {
    hints: false,
  },

  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name]-[contenthash].css',
      chunkFilename: '[name]-[contenthash].css',
    }),
    new LoadablePlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        APP_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      __IS_SERVER__: JSON.stringify(false),
      __DEV__: JSON.stringify(__DEV__),
      __STAGING__: JSON.stringify(__STAGING__),
      __RELEASE__: JSON.stringify(__RELEASE__),
      __PROD__: JSON.stringify(__PROD__),
    }),
  ],
});

module.exports = getConfig;
