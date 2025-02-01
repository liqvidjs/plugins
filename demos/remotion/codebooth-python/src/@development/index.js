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
  EditorPanel,
  Record,
  Resize,
  Run,
} from "@lqv/codebooth";
import { PythonRun } from "@lqv/codebooth/python";
import { codeRecorder, RecordingControl } from "./Record";

function App() {
  return (
    <div className="App">
      <CodeBooth recorder={codeRecorder}>
        <section className="lqv-sidebar">
          <h2>Code</h2>
          <Buttons>
            <Run />
            <Clear />
          </Buttons>
          <RecordingControl />
        </section>
        <EditorPanel filename="untitled.py">
          <Record
            extensions={[
              python(),
              basicSetup,
              syntaxHighlighting(classHighlighter),
            ]}
          />
        </EditorPanel>
        <Resize min={0.1} max={0.3} />
        <Resize dir="ns" min={0.04} max={0.5} />
        <PythonRun />
        <Console />
      </CodeBooth>
    </div>
  );
}

export default App;
