This demo shows how to use the CodeBooth plugin for Python tutorials in GSAP projects.

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/gsap/codebooth-python
git checkout
cd demos/gsap/codebooth-python
yarn install
```

## Recording
1. Start the development server with `yarn record`.

2. Click anywhere on the page to allow audio recording. Then click (or focus and Enter) on the Record button in the left pane.

3. Click (or focus and Enter) on the Record button again to stop recording.

4. Copy the duration to `src/metadata.ts`. Save the audio file and recording data in `public` as instructed.

5. [Convert and fix](https://liqvidjs.org/docs/cli/audio#convert) the audio recording:  
```bash
cd public
# fix webm file produced by browser
ffmpeg -i audio.webm -strict -2 audio-fixed.webm
mv audio-fixed.webm audio.webm

# make available in mp4
ffmpeg -i audio.webm audio.mp4
```

## Viewing the recording

Preview the final product with `yarn replay`.

## Deploying

1. Make a production build with `yarn build`.

2. Upload the `build` directory to your server.

