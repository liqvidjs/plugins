This demo shows how to use the cursor recording plugin in Liqvid projects.

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/liqvid/cursor
git checkout
cd demos/liqvid/cursor
yarn install
```

## Recording
1. Start the development server with
  ```bash
  liqvid serve
  ```

2. Click on the circle in the bottom right. If Audio is grayed out, click the circle a couple more times and it should work.

3. Select Audio and Cursor, or Video and Cursor.

4. Press `Ctrl+Alt+2` to start recording. When you are finished, press `Ctrl+Alt+2` to stop recording.

5. Copy the duration to `src/@production/index.tsx`. Save the audio file as `static/audio.webm`. Save the cursor data as `static/recordings.json`.

## Deploying

1. Convert the audio file:
  ```bash
  liqvid audio convert static/audio.webm
  ```

2. Optionally, set the duration as the `end` property of `<Cursor>`.

3. Make production bundle:
  ```bash
  liqvid build
  ```

4. Generate thumbnail previews:
  ```bash
  liqvid thumbs
  ```

5. View the production build at http://localhost:3000/dist/. To see how to embed the video in a page, go to http://localhost:3000/dist/parent.html. (See Note below).

6. To deploy to your site, upload the `dist` directory.

## Notes

1. If you want to work on the production version and have it live-reload, run `NODE_ENV=production liqvid serve` and go to http://localhost:3000/ (*not* `/dist`).
