const path = require("path");
const process = require("process");
const packageData = require("./package.json");
const webpack = require("webpack");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");

const prodMode = process.env.NODE_ENV === "production";

const cleanOpts = {
  cleanOnceBeforeBuildPatterns: ["*.*", "!sell/*"],
  verbose: false,
  dry: false
};

const incDir = path.resolve(__dirname, "_includes");
const outPath = incDir;
const layoutDir = path.resolve(__dirname, "_layouts");

const config = {
  entry: "./js/main.js",
  output: {
    filename: "[name].[contenthash:32].js",
    path: path.resolve(__dirname, "js", "dist"),
    hashFunction: "sha256",
    hashDigestLength: 64,
    publicPath: "{{ site.baseurl }}/js/dist/"
  },
  devtool: "source-map",
  mode: "production",
  plugins: [
    new CleanWebpackPlugin(cleanOpts),
    new MiniCssExtractPlugin({
      filename: prodMode ? "style.[contenthash:32].css" : "style.css"
    }),
    new HtmlWebpackPlugin({
      template: path.join(layoutDir, "default_tpl.html"),
      filename: path.resolve(layoutDir, "default_out.html"),
      minify: false,
      inject: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(incDir, "css_template.html"),
      filename: path.resolve(outPath, "css_output.html"),
      minify: false,
      inject: false
    }),
    new WebpackPwaManifest({
      name: "Where Was I Going With That?",
      short_name: "Where Was I Going",
      description: "A Blog",
      background_color: "#eeeeff",
      publicPath: "/js/dist/",
      fingerprints: false,
      icons: [
        {
          src: path.resolve(__dirname, "img", "apple-touch-icon.png"),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: "img"
        }
      ],
      inject: true
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
              implementation: require("sass")
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
