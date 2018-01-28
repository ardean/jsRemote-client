const merge = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  entry: "./demo/index.ts",
  devtool: "inline-source-map"
});