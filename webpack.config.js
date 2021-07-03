const path = require('path');

const demo = process.env.DEMO || 'default';
console.log(`Building ${demo}...`);

module.exports = {
	entry: `./demos/${demo}/index.ts`,
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
		path: path.resolve(__dirname, `./demos/${demo}`),
	},
};
