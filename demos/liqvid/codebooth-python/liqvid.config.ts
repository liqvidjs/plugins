import type {LiqvidConfig} from "@liqvid/cli";

const scripts = {
};

const port = process.env.PORT || 3000;

const config: LiqvidConfig = {
  build: {scripts},
  render: {
    audioFile: "./dist/audio.mp4",
    output: "video.mp4",
    url: `http://localhost:${port}/dist/`
  },
  serve: {
    port,
    scripts
  },
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    frequency: 1,
    imageFormat: "png",
    output: "./dist/thumbs/%s.png",
    url: `http://localhost:${port}/dist/`
  }
};

module.exports = config;
