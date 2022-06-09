const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync('./src/handlers');
const entry = Object.fromEntries(
	handlers.map(handler => [handler, `./src/handlers/${handler}/index.ts`]),
);

module.exports = {
	mode: 'production',
	target: 'node',
	entry,
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			type: 'commonjs2',
		},
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
};
