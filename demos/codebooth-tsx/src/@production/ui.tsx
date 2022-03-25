import {javascript} from "@codemirror/lang-javascript";
import {basicSetup, Buttons, Clear, CodeBooth, Replay, Resize, Run, TabPanel} from "@lqv/codebooth";
import {Utils} from "liqvid";
import {useCallback, useState} from "react";
import {Preview} from "../Preview";
const {loadJSON} = Utils.json;

type CodeReplayData = React.ComponentProps<typeof Replay>["replay"];
type HandleCallback = React.ComponentProps<typeof Replay>["handle"];

declare module "@liqvid/utils/json" {
  interface GetJSONMap {
    code: CodeReplayData;
  }
}

export function UI() {
  return (
    <CodeBooth activeGroup="replay">
      <TabPanel id="replay">
        <CodeReplay />
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

function CodeReplay(props: {
  /* this gets automagically set by TabPanel */
  group?: string;
}) {
  const [replay, setReplay] = useState<CodeReplayData>();

  const handle: HandleCallback = useCallback((useStore, key, doc) => {
    useStore.setState(prev => ({run: prev.run + 1}));
  }, []);

  if (!replay) {
    loadJSON("code").then(setReplay);
    return null;
  }

  return <Replay extensions={[basicSetup, javascript({jsx: true, typescript: true})]} filename="index.tsx" handle={handle} replay={replay} {...props} />
}
