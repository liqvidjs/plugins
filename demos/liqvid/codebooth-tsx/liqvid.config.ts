const port = process.env.PORT || 3000;

module.exports = {
  serve: {port},
  thumbs: {
    browserHeight: 800,
    browserWidth: 1280,
    output: "./dist/thumbs/%s.jpeg"
  }
};
