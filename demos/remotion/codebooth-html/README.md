This demo shows how to use the CodeBooth plugin for HTML tutorials in Remotion projects.

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/remotion/codebooth-html
git checkout
cd demos/remotion/codebooth-html
yarn install
```

## Directory structure

- `build/`  
  Compiled interactive video to upload to your site.

- `public/`  
  Shared public assets.

- `shared/`  
  Code shared between the interactive and static renders.

- `src/`  
  Web-only code.

  - `src/@development/`  
    Code for recording.

  - `src/@production/`  
    Code for the interactive playback with [`@remotion/player`](https://www.remotion.dev/docs/player).

- `video/`  
  Code for the rendered video.

## Recording

1. Start the development server with `yarn start` or `yarn record`.

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

## Interactive video

1. Preview the coding replay in [`@remotion/player`](https://www.remotion.dev/docs/player) with `yarn replay`.

2. Build the app with `yarn build`.

## Static video

1. Preview the coding replay in Remotion studio with `yarn preview`.

2. Render the video with `yarn render`.

**Warning** The demo that I recorded will only render correctly with `yarn render --concurrency 1`, due to the use of `Math.random()` in the demo. The usual pattern for [using randomness in Remotion](https://www.remotion.dev/docs/using-randomness) does not apply here. If you are not using randomness, you should not adjust the concurrency settings, since this will make rendering much slower. (If you were sufficiently ambitious you could maybe rework the `<HTMLPreview>` component to proxy `Math.random()` to Remotion's `random()`.)