const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const config = {
    entry: './index.ts',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        hot: true,
        proxy: {
            '/api': 'http://api:5000'
        },
        host: '0.0.0.0', // can be overwritten by process.env.HOST
        port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    },
    output: {
        path: __dirname + '/dist',
        filename: 'index.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'opensheetmusicdisplay | webpack-usage-example',
            // favicon: 'resources/favicon.ico' // not providing a favicon.ico can cause 404 warnings
        }),
        new CopyWebpackPlugin([
            {
                from: 'resources/SampleMusic.xml',
                to: 'musicXmlSample.xml'
            },
        ]),
        new webpack.HotModuleReplacementPlugin()
    ]
};

module.exports = config;
