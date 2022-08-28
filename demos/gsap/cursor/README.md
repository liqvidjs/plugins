This demo shows how to use the cursor recording plugin in GSAP projects.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/gsap/cursor
git checkout
cd demos/gsap/cursor
yarn install
```

## Recording
1. Start the development server with `yarn record`.

2. Click (or focus and Enter) on the circle in the top left to start recording.

3. Click (or focus and Enter) on the circle again to stop recording.

4. Copy the duration to `src/@production/index.js`. Save the cursor data as `public/recordings.json`.

## Viewing the recording

Preview the final product with `yarn replay`.

## Deploying

1. Make a production build with `yarn build`.

2. Upload the `build` directory to your server.

