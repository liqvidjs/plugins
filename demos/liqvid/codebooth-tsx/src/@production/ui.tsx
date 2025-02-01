import { javascript } from "@codemirror/lang-javascript";
import { loadJSON } from "@liqvid/utils/json";
import {
  basicSetup,
  Buttons,
  Clear,
  CodeBooth,
  EditorGroup,
  Replay,
  Resize,
  Run,
} from "@lqv/codebooth";
import { file } from "../files";
import { Preview } from "../Preview";

type CodeReplayData = React.ComponentProps<typeof Replay>["replay"] extends
  | infer K
  | Promise<infer K>
  ? K
  : never;

declare module "@liqvid/utils/json" {
  interface GetJSONMap {
    code: CodeReplayData;
  }
}

export function UI() {
  return (
    <CodeBooth>
      <EditorGroup id="replay">
        <Replay
          content={file}
          extensions={[basicSetup, javascript({ jsx: true, typescript: true })]}
          filename="index.tsx"
          replay={loadJSON("code")}
        />
      </EditorGroup>
      <Resize />
      <Preview />
      <Buttons>
        <Run />
        <Clear />
      </Buttons>
    </CodeBooth>
  );
}
