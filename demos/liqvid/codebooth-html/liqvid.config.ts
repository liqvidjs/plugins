import type { LiqvidConfig } from "@liqvid/cli";

const scripts = {};

const port = process.env.PORT || 3000;

const config: LiqvidConfig = {
  audio: {
    transcribe: {
      input: "./dist/audio.webm",
      apiKey: "ho6IutFyHawhFGGID3vU2PEz7_46-WKHTr6zhPNDU7e_",
      apiUrl:
        "https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/ad816af7-c138-4671-8c42-7e4e7fdd5151",
    },
  },
  build: { scripts },
  render: {
    audioFile: "./static/audio.mp4",
    concurrency: 1,
    output: "video.mp4",
    url: `http://localhost:${port}/dist/`,
  },
  serve: {
    port,
    scripts,
  },
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    concurrency: 1,
    frequency: 1,
    imageFormat: "png",
    output: "./dist/thumbs/%s.png",
    url: `http://localhost:${port}/dist/`,
  },
};

module.exports = config;
