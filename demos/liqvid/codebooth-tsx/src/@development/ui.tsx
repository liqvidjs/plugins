import {javascript} from "@codemirror/lang-javascript";
import {basicSetup, Buttons, Clear, CodeBooth, Record, Resize, Run} from "@lqv/codebooth";
import {CodeRecording} from "@lqv/codemirror/recording";
import {useMemo} from "react";
import {file} from "../files";
import {Preview} from "../Preview";

export function UI() {
  const extensions = useMemo(() => [
    basicSetup,
    javascript({jsx: true, typescript: true}),
  ], []);

  return (
    <CodeBooth recorder={CodeRecording.recorder}>
      <Record content={file} extensions={extensions} filename="index.tsx" />
      <Resize />
      <Preview />
      <Buttons>
        <Run />
        <Clear />
      </Buttons>
    </CodeBooth>
  );
}
