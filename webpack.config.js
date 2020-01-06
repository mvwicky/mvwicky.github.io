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

function compact(arr) {
  return arr.filter((e) => e !== undefined && typeof e !== "undefined");
}

function prodOr(p, d) {
  return prodMode ? p : d;
}

function ifProd(p) {
  return prodOr(p, undefined);
}

const cleanOpts = {
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

const config = {
  entry: "./src/js/main.ts",
  output: {
    filename: `[name].[contenthash:${hashlength}].js`,
    path: outPath,
    hashFunction: "sha256",
    hashDigestLength: 64,
    publicPath: "/dist/"
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
      name: "Where Was I Going With That?",
      short_name: "Where Was I Going",
      description: "A Blog",
      background_color: packageData.colors.background,
      theme_color: packageData.colors.theme,
      publicPath: "/dist/",
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
              sourceMap: prodMode
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

module.exports = config;
