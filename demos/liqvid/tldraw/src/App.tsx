import {Tldraw, useEditor} from "@tldraw/tldraw";

import {RecordingControl} from "@liqvid/recording";
import {Playback, Player} from "liqvid";
import {TldrawRecording} from "./plugin/recording";

import "@tldraw/tldraw/tldraw.css";
import "liqvid/dist/liqvid.min.css";

const controls = [<RecordingControl plugins={[TldrawRecording]} />];

const playback = new Playback({duration: 60000});
import recording from "./recording.json";
import {TldrawReplay} from "./plugin/react";

export default function App() {
  return (
    <Player controls={controls} playback={playback}>
      {/* <SetRecordingTarget/> */}
      <div
        data-affords="click"
        style={{
          position: "absolute",
          inset: 0,
          height: "var(--lv-canvas-height)",
        }}
      >
        <Tldraw>
          <TldrawReplay data={recording} />
          <AttachEditor />
        </Tldraw>
      </div>
    </Player>
  );
}

function AttachEditor() {
  const editor = useEditor();
  TldrawRecording.recorder.provideEditor(editor);
  (window as any).ed = editor;

  return null;
}
