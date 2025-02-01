import "../src/codebooth.css";
import "../src/style.css";
import "../src/syntax.css";
import "./static.css";

import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import { basicSetup, CodeBooth, EditorPanel, Replay } from "@lqv/codebooth";
import { Bridge } from "@lqv/remotion";
import { Audio, Sequence, staticFile } from "remotion";

import { Popup } from "../src/components/Popup";
import { file } from "../src/files";
import { durationInFrames } from "../src/metadata";
import { Preview } from "../src/Preview";

// Chromium doesn't support mp4. If you're using actual Chrome,
// you may be able to use audio.mp4 instead.
// https://www.remotion.dev/docs/media-playback-error#codec-not-supported-by-chromium
import audio from "../public/audio.webm";

const extensions = [
  basicSetup,
  javascript({ jsx: true, typescript: true }),
  syntaxHighlighting(classHighlighter),
];

const recordingData = fetch(staticFile("recordings.json")).then((res) =>
  res.json(),
);

export const Demo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: "white" }}>
      <Audio src={audio} />
      <Bridge>
        {/**
         * we don't use {@link ReplaySequence} here because the code recording
         * is shorter than the audio recording, and we want it to stay visible
         * after the typing has stopped
         */}
        <Sequence durationInFrames={durationInFrames} from={0} name="Coding">
          <CodeBooth>
            <EditorPanel filename="index.tsx">
              <Replay
                content={file}
                extensions={extensions}
                replay={recordingData}
              />
            </EditorPanel>

            <Popup title="Preview">
              <Preview />
            </Popup>
          </CodeBooth>
        </Sequence>
      </Bridge>
    </div>
  );
};
