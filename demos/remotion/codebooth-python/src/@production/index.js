import "../codebooth.css";
import "../style.css";
import "../syntax.css";

import {python} from "@codemirror/lang-python";
import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, Buttons, Clear, CodeBooth, Console, Copy, Editor, EditorGroup, EditorPanel, Replay, ReplayMultiple, Resize, Run, Tab, TabList} from "@lqv/codebooth";
import {PythonRun} from "@lqv/codebooth/python";
import {Bridge} from "@lqv/remotion";
import {Player} from "@remotion/player";
import {Audio} from "remotion";

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
          <EditorPanel filename="untitled.py">
            <Replay
              extensions={[python(), basicSetup, syntaxHighlighting(classHighlighter)]}
              replay={recordingData}
            />
          </EditorPanel>
        </EditorGroup>
        <EditorGroup id="playground">
          <EditorPanel filename="untitled.py">
            <Editor
              extensions={[python(), basicSetup, syntaxHighlighting(classHighlighter)]}
            />
          </EditorPanel>
        </EditorGroup>

        <Resize min={.1} max={.3} />
        <Resize dir="ns" min={0.04} max={.5} />
        <PythonRun />
        <Console />
      </CodeBooth>
    </Bridge >
  );
}
