import {javascript} from "@codemirror/lang-javascript";
import {AudioRecording, RecordingControl, VideoRecording} from "@liqvid/recording";
import {basicSetup, Buttons, Clear, CodeBooth, Record, Resize, Run, TabPanel} from "@lqv/codebooth";
import {CodeRecording} from "@lqv/codemirror/recording";
import {useMemo} from "react";
import {Preview} from "../Preview";

const controls = [<RecordingControl plugins={[AudioRecording, CodeRecording, VideoRecording]} />];


const content = String.raw`function Component() {
  return <h1>Hello World!</h1>;
}

ReactDOM.render(<Component />, document.getElementById("demo"));`;

export function UI() {
  const extensions = useMemo(() => [
    basicSetup,
    javascript({jsx: true, typescript: true}),
  ], []);

  return (
    <CodeBooth activeGroup="record">
      <TabPanel id="record">
        <Record content={content} extensions={extensions} filename="index.tsx" />
      </TabPanel>
      <Resize />
      <Preview />
      <Buttons>
        <Run />
        <Clear />
      </Buttons>
    </CodeBooth>
  );
}
