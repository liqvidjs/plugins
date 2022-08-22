import "../codebooth.css";
import "../style.css";
import "../syntax.css";

import {javascript} from "@codemirror/lang-javascript";
import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, Buttons, Clear, CodeBooth, EditorPanel, Record, Resize, Run} from "@lqv/codebooth";
import {Popup} from "../components/Popup";
import {file} from "../files";
import {Preview} from "../Preview";
import {codeRecorder, RecordingControl} from "./Record";

const extensions = [
  basicSetup,
  javascript({jsx: true, typescript: true}),
  syntaxHighlighting(classHighlighter)
];

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
        <EditorPanel filename="index.tsx">
          <Record
            content={file}
            extensions={extensions}
          />
        </EditorPanel>
        <Resize min={.1} max={.3} />
        <Popup title="Preview">
          <Preview />
        </Popup>
      </CodeBooth>
    </div>
  );
}

export default App;
