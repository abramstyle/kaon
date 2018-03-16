const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { ReactLoadablePlugin } = require('react-loadable/webpack');
const { generateCdnPath } = require('../../utils');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const getConfig = config => ({
  entry: {
    app: [
      'babel-polyfill',
      config.isomorphic.main,
    ],
    commons: [
      'react',
      'redux',
      'react-redux',
      'react-dom',
      'isomorphic-fetch',
      'classnames',
      'react-router',
      'react-router-config',
      'react-router-dom',
      'react-helmet',
      'react-loadable',
      'immutable',
      '@abramstyle/redux-api',
    ],
  },
  output: {
    filename: '[name]-[hash].js',
    // the output bundle

    path: config.build.target,

    publicPath: generateCdnPath(config),
    // necessary for HMR to know where to load the hot update chunks
    sourceMapFilename: '[name]-[hash].js.map',
  },

  // context: resolve('sources'),

  // devtool: 'eval-source-map',
  devtool: 'cheap-module-source-map',

  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      }],
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
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
              path: config.postcss.path,
            },
          },
        }],
      }),
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

  plugins: [
    new ManifestPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates
    new ReactLoadablePlugin({
      filename: `${config.build.target}/react-loadable.json`,
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['commons', 'manifest'],
      minChunks(module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      },
    }),
    new webpack.DefinePlugin({
      'process.env.APP_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new UglifyJSPlugin(),
    new ExtractTextPlugin('[name]-[contenthash].css'),
  ],
});

module.exports = getConfig;
