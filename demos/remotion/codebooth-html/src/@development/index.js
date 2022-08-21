import "../codebooth.css";
import "../style.css";
import "../syntax.css";

import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, Buttons, Clear, CodeBooth, Console, EditorPanel, FileTabs, Record, Resize, Run} from "@lqv/codebooth";
import {extensionFromFilename, HTMLPreview} from "@lqv/codebooth/html";

import {Popup} from "../components/Popup";
import {files} from "../files";
import {codeRecorder, RecordingControl} from "./Record";

const extn = syntaxHighlighting(classHighlighter);

function App() {
  return (
    <div className="App">
      <CodeBooth recorder={codeRecorder}>
        <section className="lqv-sidebar">
          <h2>Files</h2>
          <FileTabs />
          <RecordingControl />
        </section>
        {Object.keys(files).map((filename) => (
          <EditorPanel filename={filename} key={filename}>
            <Record
              content={files[filename]}
              extensions={[
                basicSetup,
                extensionFromFilename(filename),
                extn
              ]}
            />
          </EditorPanel>
        ))}
        <Resize min={.1} max={.3}/>
        <Resize dir="ns" min={0.04} max={.5}/>
        <Popup title="Preview">
          <HTMLPreview />
        </Popup>
        <Console />
        <Buttons>
          <Run />
          <Clear />
        </Buttons>
      </CodeBooth>
    </div>
  );
}

export default App;
