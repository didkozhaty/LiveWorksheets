const path = require('path');
const fs = require('fs');
const entryFiles = {};
const files = fs.readdirSync('./src')
files.forEach(file => {
    if(!file.endsWith(".ts"))
        return;
    const name = file.replace('.ts', '');
    entryFiles[name] = `./src/${file}`; // Создаём объект для входных точек
});
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "development",
    devtool: false,
    entry: entryFiles,
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
};