const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'pagerefresh.js',
    path: path.resolve(__dirname, 'dist'),
	libraryTarget: 'umd',
	auxiliaryComment: {
	  root: "Root Comment",
	  commonjs: "CommonJS Comment",
	  commonjs2: "CommonJS2 Comment",
	  amd: "AMD Comment"
	}
  },
  devtool: 'inline-source-map',
  devServer: {
     contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
	// new UglifyJSPlugin(),
	new ExtractTextPlugin("pagerefresh.css"),
  ],
  module: {
     rules: [
       // {
         // test: /\.css$/,
         // use: [
           // 'style-loader',
           // 'css-loader'
        // ]
      // },
	  {
         test: /\.(png|svg|jpg|gif)$/,
         use: [
           'file-loader'
		]
      },
	  {
         test: /\.(woff|woff2|eot|ttf|otf)$/,
         use: [
           'file-loader'
         ]
      },
	  {
		test: /\.css$/,
		use: ExtractTextPlugin.extract({
			fallback: "style-loader",
			use: "css-loader"
		})
	  }
     ]
  }
};