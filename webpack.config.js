const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const modulesPaths = [ 
    // require.resolve('./src/webpackTest/BuildTest.jsx'),
     require.resolve('./src/DevExBytel_2/VMware2.jsx'),
    // require.resolve('./src/Pgsql/Pgsql.jsx')
]

module.exports = modulesPaths.map(modulePath => {
    const fileName = path.basename(modulePath, path.extname(modulePath))
    return {
        entry: {
            [fileName]: modulePath,
        },
        mode: 'production',
        devtool: "inline-sourcemap",
        output: {
            library: fileName,
            libraryTarget: 'commonjs2',
            libraryExport: 'default',
            path: path.resolve(__dirname, 'build'),
            filename: fileName + '.js',
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                { 
                    test: /\.(eot|svg|ttf|woff|woff2)$/, 
                    use: "url-loader?name=[name].[ext]"
                }
            ],
        },

        resolve:{
            alias: {
                globalize$: path.resolve( __dirname, "node_modules/globalize/dist/globalize.js" ),
                globalize: path.resolve(__dirname, "node_modules/globalize/dist/globalize"),
                cldr$: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr.js"),
                cldr: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr")
              },
        },

        optimization: {
            minimize:true,
            minimizer:[
                new UglifyJsPlugin({
                    test: /\.(js|jsx)$/,
                })
            ]
        },

    };
})
