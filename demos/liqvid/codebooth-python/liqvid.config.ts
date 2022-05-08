import type {LiqvidConfig} from "@liqvid/cli";

const scripts = {
};

const config: LiqvidConfig = {
  build: {scripts},
  render: {
    output: "video.mp4",
    url: "http://localhost:3003/dist/"
  },
  serve: {
    port: 3003,
    scripts
  },
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    concurrency: 1,
    frequency: 1,
    imageFormat: "png",
    output: "./dist/thumbs/%s.png",
    url: "http://localhost:3003/dist/"
  }
};

module.exports = config;
