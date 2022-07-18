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
1. Start the development server with
  ```bash
  yarn start
  ```

2. Click (or focus and Enter) on the circle in the top left to start recording.

3. Click (or focus and Enter) on the circle again to stop recording.

4. Copy the duration to `src/@production/index.js`. Save the cursor data as `public/recordings.json`.

## Viewing the recording

1. Make a production build with
```bash
yarn build
```

2. View the production build with
```bash
yarn global add serve
serve -s build
```

3. Alternatively, you can change the import logic in `src/index.tsx`. This is useful if you want to develop on the production view.
