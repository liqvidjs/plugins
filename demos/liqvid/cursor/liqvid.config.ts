import type {LiqvidConfig} from "@liqvid/cli";

const config: LiqvidConfig = {
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    imageFormat: "png",
    output: "./dist/thumbs/%s.png",
    url: "http://localhost:3002/dist/"
  }
};

module.exports = config;

