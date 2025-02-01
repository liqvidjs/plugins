import "../codebooth.css";
import "../style.css";
import "../syntax.css";

import { python } from "@codemirror/lang-python";
import { syntaxHighlighting } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import {
  basicSetup,
  Buttons,
  Clear,
  CodeBooth,
  Console,
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
import { PythonRun } from "@lqv/codebooth/python";
import { Bridge } from "@lqv/gsap";
import { gsap } from "gsap";

import { duration } from "../metadata";
import { Audio } from "./Audio";
import { ScrubberBar } from "./ScrubberBar";

const tl = gsap.timeline({ duration, paused: true });
const recordingData = fetch("./recordings.json").then((res) => res.json());

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

          <h2>Code</h2>
          <Buttons>
            <Run />
            <Copy from="replay" to="playground" />
            <Clear />
          </Buttons>
        </section>

        <EditorGroup id="replay">
          <EditorPanel filename="untitled.py">
            <Replay
              extensions={[
                python(),
                basicSetup,
                syntaxHighlighting(classHighlighter),
              ]}
              replay={recordingData}
            />
          </EditorPanel>
        </EditorGroup>
        <EditorGroup id="playground">
          <EditorPanel filename="untitled.py">
            <Editor
              extensions={[
                python(),
                basicSetup,
                syntaxHighlighting(classHighlighter),
              ]}
            />
          </EditorPanel>
        </EditorGroup>

        <Resize min={0.1} max={0.3} />
        <Resize dir="ns" min={0.04} max={0.5} />
        <PythonRun />
        <Console />
      </CodeBooth>
    </>
  );
}
