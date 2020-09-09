
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const devMode = process.env.NODE_ENV === 'development'


module.exports = {

    devtool: devMode? 'inline-source-map': 'none',

    devServer: {
        contentBase: './dist'
    },

    entry: {
        mainJS: path.resolve(__dirname, "src", "index.ts")
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },

    resolve: {
        extensions: ['.ts', '.js', 'scss', '.html'],
    },

    optimization: {
        splitChunks: { chunks: "all" },
        minimize: !devMode,
        minimizer: [
            new TerserPlugin({
                terserOptions: { 
                    output: { 
                        ascii_only: true 
                    } 
                }
            })
        ],
    },


    module: {

        rules: [

            {
                test: /\.html$/i,
                loader: 'html-loader',
            },

            {
                test: /\.s[ac]ss$/i,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: devMode
                        }
                    }
                ]
            },

            {
                test: /\.tsx?$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true
                    }
                },
                exclude: [/node_modules/]
            },


            {
                test: /\.(png|svg|jpg|gif|mp3)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        }
                    },
                    
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            disable: devMode,
                        }
                    }
            
                ]
                
            }

        ]

    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "index.html")
        }),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        })
    ]

};