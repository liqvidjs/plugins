import "../codebooth.css";
import "../style.css";
import "../syntax.css";
import "./interactive.css";

import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, Buttons, Clear, CodeBooth, Console, Copy, Editor, EditorGroup, EditorPanel, FileTabs, Replay, ReplayMultiple, Resize, Run, Tab, TabList} from "@lqv/codebooth";
import {extensionFromFilename, HTMLPreview} from "@lqv/codebooth/html";
import {Bridge} from "@lqv/remotion";
import {Player} from "@remotion/player";
import {Audio} from "remotion";

// import audio from "../../public/audio.webm";
import {Popup} from "../components/Popup";
import {ToggleButton} from "../components/ToggleButton";
import {files} from "../files";
import {duration, fps} from "../metadata";

const recordingData = fetch("./recordings.json").then(res => res.json());

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
        width: "100%"
      }}
      controls
    />
  );
}

export default App;

function Content() {
  return (
    <Bridge>
      <Audio src="./audio.mp4" />
      <CodeBooth>
        <section className="lqv-sidebar">
          <h2>View</h2>
          <TabList className="lqv-group-tabs">
            <Tab id="replay">Replay</Tab>
            <Tab id="playground">Playground</Tab>
          </TabList>
          <ToggleButton className="show-console" title="Console" />
          <ToggleButton className="show-preview" title="Preview" />

          <h2>Files</h2>
          <FileTabs />

          <h2>Code</h2>
          <Buttons>
            <Run />
            <Copy from="replay" to="playground" />
            <Clear />
          </Buttons>
        </section>

        <EditorGroup id="replay">
          {Object.keys(files).map((filename) => (
            <EditorPanel filename={filename} key={filename}>
              <Replay
                content={files[filename]}
                extensions={[
                  basicSetup,
                  extensionFromFilename(filename),
                  syntaxHighlighting(classHighlighter)
                ]}
              />
            </EditorPanel>
          ))}
          <ReplayMultiple replay={recordingData} start={0} />
        </EditorGroup>
        <EditorGroup id="playground">
          {Object.keys(files).map((filename) => (
            <EditorPanel filename={filename} key={filename}>
              <Editor
                extensions={[
                  basicSetup,
                  extensionFromFilename(filename),
                  syntaxHighlighting(classHighlighter)
                ]}
              />
            </EditorPanel>
          ))}
        </EditorGroup>
        <Resize min={.1} max={.3} />
        <Resize dir="ns" min={0.04} max={.5} />
        <Popup title="Preview">
          <HTMLPreview />
        </Popup>
        <Console />
      </CodeBooth>
    </Bridge>
  );
}
