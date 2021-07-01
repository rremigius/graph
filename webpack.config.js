const path = require('path');

module.exports = {
	entry: './src/index.ts',
	mode: "development",
	devtool: "eval-source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			}
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'graph.js',
		path: path.resolve(__dirname, 'dist'),
	},
};