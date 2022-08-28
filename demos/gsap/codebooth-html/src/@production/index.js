import "../codebooth.css";
import "../style.css";
import "../syntax.css";
import "./interactive.css";

import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, Buttons, Clear, CodeBooth, Console, Copy, Editor, EditorGroup, EditorPanel, FileTabs, Replay, ReplayMultiple, Resize, Run, Tab, TabList} from "@lqv/codebooth";
import {extensionFromFilename, HTMLPreview} from "@lqv/codebooth/html";
import {Bridge} from "@lqv/gsap";
import {gsap} from "gsap";

import {Audio} from "./Audio";
import {Popup} from "../components/Popup";
import {ToggleButton} from "../components/ToggleButton";
import {files} from "../files";
import {duration} from "../metadata";
import {ScrubberBar} from "./ScrubberBar";

const tl = gsap.timeline({duration, paused: true});
const recordingData = fetch("./recordings.json").then(res => res.json());

function App() {
  return (
    <div className="App">
      <Bridge timeline={tl}>
        <Content />
        <ScrubberBar timeline={tl} />
      </Bridge>
    </div>
  );
}

export default App;

function Content() {
  return (
    <>
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
    </>
  );
}
