import config from "./webpack.config";

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin({
  outputFormat: "humanVerbose",
  granularLoaderData: true,
});

export default smp.wrap(config);
