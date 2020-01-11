import * as path from "path";
import process from "process";
import * as fs from "fs";

import * as yaml from "js-yaml";
import { GenerateSW } from "workbox-webpack-plugin";
import webpack from "webpack";
import {
  CleanWebpackPlugin,
  Options as CleanOptions
} from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import WebpackPwaManifest from "webpack-pwa-manifest";
import HtmlWebpackPlugin from "html-webpack-plugin";

import OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
import TerserPlugin = require("terser-webpack-plugin");

import * as pkg from "./package.json";

const cfg = yaml.safeLoad(fs.readFileSync("./_config.yml", "utf-8"));
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

const cleanOpts: CleanOptions = {
  verbose: false,
  dry: false,
  cleanOnceBeforeBuildPatterns: [
    "**/*",
    "!fonts",
    "!fonts/**/*",
    "!img",
    "!img/**/*"
  ]
};

const hashFn = prodOr("sha256", "md5");
const hashlength = prodOr(32, 10);
const fontHash = `${hashFn}:hash:hex:${hashlength}`;
const fontName = `[name].[${fontHash}].[ext]`;
const srcDir = path.resolve(__dirname, "src");
const outPath = path.resolve(__dirname, "dist");
const layoutDir = path.resolve(__dirname, "_layouts");
const publicPath = "/dist/";

function configureServiceWorker() {
  const swDest = "service-worker.js";
  const importsDirectory = "wb";
  return new GenerateSW({
    swDest,
    importsDirectory,
    importWorkboxFrom: "local",
    cacheId: "wwigwt",
    runtimeCaching: [
      {
        urlPattern: /\/blog\//,
        handler: "CacheFirst"
      }
    ]
  });
}

const config: webpack.Configuration = {
  entry: pkg.entry,
  output: {
    filename: `[name].[contenthash:${hashlength}].js`,
    path: outPath,
    hashFunction: "sha256",
    hashDigestLength: 64,
    publicPath
  },
  devtool: prodOr("source-map", "cheap-module-eval-source-map"),
  mode: prodOr("production", "development"),
  plugins: [
    new CleanWebpackPlugin(cleanOpts),
    new MiniCssExtractPlugin({
      filename: `style.[contenthash:${hashlength}].css`
    }),
    new HtmlWebpackPlugin({
      template: path.join(layoutDir, "default_tpl.html"),
      filename: path.resolve(layoutDir, "default_out.html"),
      minify: false,
      inject: true
    }),
    new WebpackPwaManifest({
      name: cfg.title,
      short_name: "Where Was I Going",
      description: cfg.description,
      background_color: pkg.colors.background,
      theme_color: pkg.colors.theme,
      publicPath,
      fingerprints: false,
      icons: [
        {
          src: path.resolve(__dirname, "img", "apple-touch-icon.png"),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: "img"
        }
      ],
      inject: true
    }),
    configureServiceWorker()
  ],
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: path.resolve(__dirname, ".cache"),
              exclude: /node_modules/,
              presets: [
                [
                  "@babel/preset-env",
                  {
                    corejs: { version: 3, proposals: true },
                    modules: false,
                    debug: false,
                    useBuiltIns: "usage"
                  }
                ],
                "@babel/typescript"
              ],
              plugins: [
                "@babel/plugin-proposal-optional-chaining",
                "@babel/proposal-object-rest-spread"
              ],
              parserOpts: {
                strictMode: true
              }
            }
          }
        ],
        include: path.join(srcDir, "js")
      },
      {
        test: /\.(s?css)$/,
        use: compact([
          {
            loader: prodOr(MiniCssExtractPlugin.loader, "style-loader")
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: prodOr(2, 1),
              sourceMap: prod
            }
          },
          ifProd({
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              plugins: () => {
                return [require("autoprefixer")];
              }
            }
          }),
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                outputStyle: "expanded"
              }
            }
          }
        ])
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
              emitFile: true
            }
          }
        ],
        include: path.resolve("src", "scss")
      }
    ]
  },
  optimization: {
    minimizer: compact([
      ifProd(
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        })
      ),
      ifProd(
        new OptimizeCSSPlugin({
          cssProcessor: require("cssnano"),
          cssProcessorOptions: { preset: ["default"], map: true },
          canPrint: false
        })
      )
    ])
  },
  resolve: {
    extensions: [".js"],
    symlinks: false
  },
  node: false,
  stats: {
    modules: false,
    children: false,
    excludeAssets: [/^fonts\//]
  }
};

export default config;
