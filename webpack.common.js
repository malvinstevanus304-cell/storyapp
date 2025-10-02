const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
    sw: path.resolve(__dirname, 'src/public/sw.js'), // entry untuk service worker
  },
  output: {
    filename: '[name].bundle.js', // hasil: app.bundle.js dan sw.bundle.js
    path: path.resolve(__dirname, 'dist'),
    clean: true, // biar setiap build dist bersih dulu
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]', // rapihin gambar di dist/images
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      excludeChunks: ['sw'], // jangan inject sw.bundle.js ke index.html
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public'),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            ignore: ['**/sw.js'], // sw.js jangan dicopy lagi, sudah jadi entry
          },
        },
      ],
    }),
  ],
};
