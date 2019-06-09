const path = require("path");
const process = require("process");
const packageData = require("./package.json");
const webpack = require("webpack");

const { CleanPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Fiber = require("fibers");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const prodMode = process.env.NODE_ENV === "production";

const cleanOpts = {
  cleanOnceBeforeBuildPatterns: ["*.*", "!sell/*"],
  verbose: false,
  dry: false
};

const config = {
  entry: "./js/main.js",
  output: {
    filename: "[name].[contenthash:32].js",
    path: path.resolve(__dirname, "js", "dist"),
    hashFunction: "sha256",
    hashDigestLength: 64,
    publicPath: "js/dist/"
  },
  devtool: "source-map",
  mode: "production",
  plugins: [
    new CleanPlugin(cleanOpts),
    new MiniCssExtractPlugin({ filename: "style.[contenthash:32].css" }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "_includes", "js_template.html"),
      filename: path.resolve(__dirname, "_includes", "js_output.html"),
      minify: false,
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "_includes", "css_template.html"),
      filename: path.resolve(__dirname, "_includes", "css_output.html"),
      minify: false,
      inject: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              cacheDirectory: true
            }
          }
        ],
        include: path.resolve(__dirname, "js")
      },
      {
        test: /\.(s?css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              plugins: () => {
                return [require("autoprefixer")];
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              fiber: Fiber
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorOptions: { preset: ["default"], map: true },
        canPrint: false
      })
    ]
  },
  resolve: {
    extensions: [".js"],
    symlinks: false
  },
  node: false
};

module.exports = config;
