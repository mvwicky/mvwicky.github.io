import * as path from "path";

import autoprefixer from "autoprefixer";
import { GenerateSW } from "workbox-webpack-plugin";
import webpack, { RuleSetLoader } from "webpack";
import ManifestPlugin from "webpack-manifest-plugin";
import {
  CleanWebpackPlugin,
  Options as CleanOptions,
} from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

import OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
import TerserPlugin = require("terser-webpack-plugin");

import * as pkg from "./package.json";

const prod = process.env.NODE_ENV === "production";

function compact<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((e) => e !== undefined && typeof e !== "undefined") as T[];
}

function prodOr<P = any, D = any>(pVal: P, dVal: D): P | D {
  return prod ? pVal : dVal;
}

function ifProd<T>(obj: T): T | undefined {
  return prodOr(obj, undefined);
}

const hashFn = prodOr("sha256", "md5");
const hashlength = prodOr(32, 10);
const fontHash = `${hashFn}:hash:hex:${hashlength}`;
const fontName = `[name].[${fontHash}].[ext]`;
const srcDir = path.resolve(__dirname, "src");
const outPath = path.resolve(__dirname, "dist");
const layoutDir = path.resolve(__dirname, "_layouts");
const publicPath = "/dist/";

function configureServiceWorker() {
  const maxEntries = 30;
  const maxAgeSeconds = 43200;
  const expiration = { maxEntries, maxAgeSeconds };
  return new GenerateSW({
    swDest: path.join(outPath, "sw", "sw.js"),
    cacheId: "wwigwt",
    exclude: [/default_out\.html/],
    runtimeCaching: [
      {
        urlPattern: /\/?$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "home",
          cacheableResponse: {
            statuses: [200],
          },
          expiration,
        },
      },
      {
        urlPattern: /\/blog\//,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "blog-posts",
          cacheableResponse: {
            statuses: [200],
          },
          expiration,
        },
      },
    ],
  });
}

const babelCache = path.resolve(__dirname, ".cache", "babel-loader");
const babelLoader: RuleSetLoader = {
  loader: "babel-loader",
  options: {
    cacheDirectory: prodOr(false, babelCache),
    cacheCompression: false,
    exclude: /node_modules/,
    presets: [
      [
        "@babel/preset-env",
        {
          corejs: { version: 3, proposals: true },
          modules: false,
          debug: false,
          useBuiltIns: "usage",
        },
      ],
      ["@babel/preset-typescript"],
    ],
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
      "@babel/proposal-object-rest-spread",
    ],
    parserOpts: {
      strictMode: true,
    },
  },
};

function configureHTMLPlugin() {
  return new HtmlWebpackPlugin({
    filename: path.resolve(layoutDir, "default_out.html"),
    minify: false,
    inject: true,
    meta: false,
    scriptLoading: "defer",
  });
}

function configureCleanPlugin() {
  const patterns = ["**/*"].concat(prod ? [] : ["!fonts", "!fonts/**/*"]);
  const opts: CleanOptions = {
    verbose: false,
    dry: false,
    cleanOnceBeforeBuildPatterns: patterns,
  };

  return new CleanWebpackPlugin(opts);
}

const config: webpack.Configuration = {
  entry: pkg.entry,
  output: {
    filename: `[name].[contenthash:${hashlength}].js`,
    path: outPath,
    hashFunction: "sha256",
    hashDigestLength: 64,
    publicPath,
    pathinfo: false,
  },
  devtool: prodOr("source-map", false),
  mode: prodOr("production", "development"),
  plugins: compact([
    new ManifestPlugin({ publicPath }),
    configureCleanPlugin(),
    new MiniCssExtractPlugin({
      filename: `style.[contenthash:${hashlength}].css`,
    }),
    configureHTMLPlugin(),
    ifProd(configureServiceWorker()),
  ]),
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        use: [babelLoader],
        include: path.join(srcDir, "js"),
      },
      {
        test: /\.(s?css)$/,
        use: compact([
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: prodOr(2, 1),
              sourceMap: prod,
            },
          },
          ifProd({
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              plugins: [
                require("postcss-flexbugs-fixes"),
                autoprefixer({ flexbox: "no-2009" }),
              ],
            },
          }),
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                outputStyle: "expanded",
              },
            },
          },
        ]),
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: fontName,
              outputPath: "fonts",
              esModule: false,
              emitFile: true,
            },
          },
        ],
        include: path.resolve("src", "scss"),
      },
    ],
  },
  optimization: {
    splitChunks: false,
    minimizer: compact([
      ifProd(
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        })
      ),
      ifProd(
        new OptimizeCSSPlugin({
          cssProcessor: require("cssnano"),
          cssProcessorOptions: { preset: ["default"], map: true },
          canPrint: false,
        })
      ),
    ]),
  },
  resolve: {
    extensions: [".js"],
    symlinks: false,
  },
  node: false,
  stats: {
    modules: false,
    children: false,
    excludeAssets: [/^fonts\//],
  },
};

export default config;
