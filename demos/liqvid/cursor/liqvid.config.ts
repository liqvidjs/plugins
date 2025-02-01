import type { LiqvidConfig } from "@liqvid/cli";

const port = process.env.PORT || 3000;

const config: LiqvidConfig = {
  serve: { port },
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    frequency: 1,
    imageFormat: "png",
    output: "./dist/thumbs/%s.png",
    url: `http://localhost:${port}/dist/`,
  },
};

module.exports = config;
