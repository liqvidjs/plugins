import "../codebooth.css";
import "../style.css";
import "../syntax.css";

import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import {
  basicSetup,
  Buttons,
  Clear,
  CodeBooth,
  Copy,
  Editor,
  EditorGroup,
  EditorPanel,
  Replay,
  Resize,
  Run,
  Tab,
  TabList,
} from "@lqv/codebooth";
import { Bridge } from "@lqv/remotion";
import { Player } from "@remotion/player";
import { Audio } from "remotion";

import { Popup } from "../components/Popup";
import { file } from "../files";
import { duration, fps } from "../metadata";
import { Preview } from "../Preview";

const recordingData = fetch("./recordings.json").then((res) => res.json());

const extensions = [
  basicSetup,
  javascript({ jsx: true, typescript: true }),
  syntaxHighlighting(classHighlighter),
];

function App() {
  return (
    <Player
      clickToPlay={false}
      component={Content}
      durationInFrames={Math.ceil(fps * duration)}
      compositionWidth={window.innerWidth}
      compositionHeight={window.innerHeight}
      fps={fps}
      style={{
        width: "100%",
      }}
      controls
    />
  );
}

export default App;

function Content() {
  return (
    <Bridge>
      <Audio src="audio.mp4" />
      <CodeBooth>
        <section className="lqv-sidebar">
          <h2>View</h2>
          <TabList className="lqv-group-tabs">
            <Tab id="replay">Replay</Tab>
            <Tab id="playground">Playground</Tab>
          </TabList>

          <h2>Code</h2>
          <Buttons>
            <Run />
            <Copy from="replay" to="playground" />
            <Clear />
          </Buttons>
        </section>

        <EditorGroup id="replay">
          <EditorPanel filename="index.tsx">
            <Replay
              content={file}
              extensions={extensions}
              replay={recordingData}
            />
          </EditorPanel>
        </EditorGroup>
        <EditorGroup id="playground">
          <EditorPanel filename="index.tsx">
            <Editor extensions={extensions} />
          </EditorPanel>
        </EditorGroup>

        <Resize min={0.1} max={0.3} />
        <Popup title="Preview">
          <Preview />
        </Popup>
      </CodeBooth>
    </Bridge>
  );
}
