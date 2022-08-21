const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const env = process.env.NODE_ENV || "development";

module.exports = {
  entry: `./src/@${env}/index.tsx`,
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "static"),
  },

  externals: {
    "@babel/standalone": "Babel",
  },

  mode: env,

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: "ts-loader",
      },
    ],
  },

  // necessary due to bug in old versions of mobile Safari
  devtool: false,

  optimization: {
    emitOnErrors: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          safari10: true,
        },
      }),
    ],
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@env": path.join(__dirname, "src", "@" + env),
    },
  },
};
