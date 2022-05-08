import {javascript} from "@codemirror/lang-javascript";
import {basicSetup, Buttons, Clear, CodeBooth, Record, Resize, Run} from "@lqv/codebooth";
import {CodeRecording} from "@lqv/codemirror/recording";
import {useMemo} from "react";
import {Preview} from "../Preview";

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
    <CodeBooth recorder={CodeRecording.recorder}>
      <Record content={content} extensions={extensions} filename="index.tsx" />
      <Resize />
      <Preview />
      <Buttons>
        <Run />
        <Clear />
      </Buttons>
    </CodeBooth>
  );
}
