This demo shows how to use the CodeBooth plugin for TSX tutorials.

## Installation

Download this directory and install the packages:

```bash
git clone git@github.com:liqvidjs/plugins.git --no-checkout liqvid-plugins
cd liqvid-plugins
git sparse-checkout set demos/codebooth-tsx
git checkout
cd demos/codebooth-tsx
yarn install
```

## Recording
1. Start the development server with
  ```bash
  liqvid serve
  ```

2. Click on the circle in the bottom right. If Audio is grayed out, click the circle a couple more times and it should work.

3. Select Audio and Code, or Video and Code.

4. Press `Ctrl+Alt+2` to start recording. Press `Ctrl+Enter` to refresh the React preview. When you are finished, press `Ctrl+Alt+2` to stop recording. (See Note 1 below).

5. Save the audio file as `static/audio.webm`. Save the coding data as `static/recordings.json`.

## Deploying

1. Convert the audio file:
  ```bash
  liqvid audio convert static/audio.webm
  ```

2. Set the duration (in milliseconds) in `src/@production/index.tsx` (in future, the recording interface will tell you this, for now look at the audio file).

3. Make production bundle:
  ```bash
  liqvid build
  ```

4. Generate thumbnail previews:
  ```bash
  liqvid thumbs
  ```

5. View the production build at http://localhost:3000/dist/. To see how to embed the video in a page, go to http://localhost:3000/dist/parent.html. (See Note 2 below).

6. To deploy to your site, upload the `dist` directory.

## Production

## Notes

1. If you change the keyboard commands for "Start/Stop/Pause/Discard recording", you must add ` passKeys={["Mod-Alt-2", "Mod-Alt-3", "Mod-Alt-4"]}` (but replace these with your new key sequences) to `<Record>` in `src/@development/ui.tsx`. Note that `passKeys` uses `-` between modifiers (CodeMirror syntax), but the recording control uses `+` (Liqvid syntax).

2. If you want to work on the production version and have it live-reload, run `NODE_ENV=production liqvid serve` and go to http://localhost:3000/ (*not* `/dist`).
