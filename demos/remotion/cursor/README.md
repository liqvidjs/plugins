This demo shows how to use the cursor recording plugin in Remotion projects.

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/remotion/cursor
git checkout
cd demos/remotion/cursor
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

2. Click (or focus and Enter) on the circle in the top left to start recording.

3. Click (or focus and Enter) on the circle again to stop recording.

4. Copy the duration to `src/metadata.ts`. Save the cursor data as `public/recordings.json`.

## Interactive video

1. Preview the cursor replay in [`@remotion/player`](https://www.remotion.dev/docs/player) with `yarn replay`.

2. Build the app with `yarn build`.

## Static video

1. Preview the cursor replay in Remotion studio with `yarn preview`.

2. Render the video with `yarn render`.
