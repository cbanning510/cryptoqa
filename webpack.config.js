// const createExpoWebpackConfigAsync = require("@expo/webpack-config");

// module.exports = async function (env, argv) {
//   const config = await createExpoWebpackConfigAsync(
//     {
//       ...env,
//       babel: {
//         dangerouslyAddModulePathsToTranspile: ["react-native-svg"],
//       },
//     },
//     argv
//   );

//   config.module.rules.push({
//     test: /\.svg$/,
//     use: [
//       {
//         loader: "file-loader",
//         options: {
//           name: "static/media/[name].[hash:8].[ext]",
//         },
//       },
//     ],
//   });

//   return config;
// };
const webpack = require("webpack");

module.exports = {
  entry: ["react-hot-loader/patch", "./index.web.js"],
  devServer: {
    hot: true,
    static: __dirname,
  },
  optimization: {
    moduleIds: "named",
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          babelrc: false,
          presets: [
            "@babel/preset-env",
            "react",
            "module:@react-native/babel-preset",
          ],
          plugins: ["react-hot-loader/babel"],
        },
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "@svgr/webpack",
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    extensions: [".web.js", ".js", ".web.jsx", ".jsx"],
    mainFields: ["browser", "main"],
  },
};
