import {classHighlightStyle} from "@codemirror/highlight";
import {python} from "@codemirror/lang-python";
import {Extension, Text} from "@codemirror/state";
import * as React from "react";
import {useCallback} from "react";
import {CodeBooth} from "..";
import {Buttons, Clear, Copy, Reset, Run, Tab, TabList} from "../components/buttons";
import {Console} from "../components/Console";
import {Editor} from "../components/Editor";
import {Replay} from "../components/Replay";
import {Resize} from "../components/Resize";
import { TabPanel } from "../components/TabPanel";
import {basicSetup} from "../extensions";
import {PythonInterpreter} from "../interpreters/skulpt";

const interpreter = new PythonInterpreter();

type RunCallback = React.ComponentProps<typeof CodeBooth>["run"];
type HandleCallback = React.ComponentProps<typeof Replay>["handle"];

/** Python run function */
const run: RunCallback = (files, setState) => {
  const file = files["untitled.py"];
  let messages: {text: string; classNames: string[];}[];
  try {
    const output = interpreter.runSync(file);
    messages = output.filter(_ => _.trim()).map(text => ({classNames: ["user"], text}));
  } catch (e) {
    messages = [{
      classNames: ["user", "error"],
      text: e.args.v[0].v + "\n"
    }];
  }

  setState(prev => ({messages: prev.messages.concat(messages)}))
};

/** Replay handling function */
const handle: HandleCallback = (useStore, key, doc) => {
  switch (key) {
    case "Ctrl-Enter":
    case "Cmd-Enter":
      const {getActiveFiles, run} = useStore.getState();

      // if we're replaying, latest changes haven't been dispatched to editor yet
      const files = getActiveFiles();
      files["untitled.py"] = doc.toString();

      run(files, useStore.setState);
      break;
    case "Cmd-K":
      useStore.setState({messages: []});
      break;
  }
};

/** Python demo */
export function PythonDemo(props: {
  extensions?: Extension[];
  file?: string;
}) {
  return (
    <CodeBooth run={run}>
      <Editor extensions={[basicSetup, classHighlightStyle, python(), ...(props.extensions ?? [])]} filename="untitled.py"/>
      <Resize/>
      <Console/>
      <Buttons>
        <Reset/>
        <Run/>
        <Clear/>
      </Buttons>
    </CodeBooth>
  );
}

/** Interactive Python replay */
export const PythonReplay: React.FC<{
  replay: React.ComponentProps<typeof Replay>["replay"];
  start: number;
}> = (props) => {
  return (
    <CodeBooth activeGroup="replay" run={run}>
      <TabPanel id="replay">
        <Replay extensions={[basicSetup, classHighlightStyle, python()]} filename="untitled.py" handle={handle} replay={props.replay} start={props.start}/>
      </TabPanel>
      <TabPanel id="playground">
        <Editor extensions={[basicSetup, classHighlightStyle, python()]} filename="untitled.py"/>
      </TabPanel>
      <Resize/>
      <Console/>
      <Buttons>
        <TabList>
          <Tab id="replay">Code</Tab>
          <Tab id="playground">Playground</Tab>
        </TabList>
        <Copy from="replay" to="playground"/>
        <Run/>
        <Clear/>
      </Buttons>
      {props.children}
    </CodeBooth>
  );
}
