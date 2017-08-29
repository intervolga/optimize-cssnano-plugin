const path = require('path');
const Plugin = require(path.join(__dirname, '..', '..', 'index.js'));
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(entry, prevSourceMap = true, nextSourceMap = true) {
  return {
    entry: entry,

    output: {
      path: path.dirname(entry),
      filename: 'produced.bundle.js',
      libraryTarget: 'commonjs2',
    },

    devtool: 'source-map',

    module: {
      rules: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: false,
                sourceMap: prevSourceMap,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: prevSourceMap ? 'inline' : false,
              },
            },
          ],
        }),
      },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {minimize: false, sourceMap: prevSourceMap},
              },
              {
                loader: 'postcss-loader',
                options: {sourceMap: prevSourceMap ? 'inline' : false},
              },
              {
                loader: 'sass-loader',
                options: {
                  outputStyle: 'expanded',
                  sourceMap: prevSourceMap,
                },
              },
            ],
          }),
        }],
    },

    plugins: [
      new ExtractTextPlugin({
        allChunks: true,
        filename: 'produced.css',
      }),
      new Plugin({
        sourceMap: nextSourceMap,
        cssnanoOptions: {
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
          }],
        },
      }),
    ],

    target: 'node',
  };
};
