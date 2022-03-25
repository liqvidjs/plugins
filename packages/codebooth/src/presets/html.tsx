import {classHighlightStyle} from "@codemirror/highlight";
import {html} from "@codemirror/lang-html";
import {css} from "@codemirror/lang-css";
import {javascript} from "@codemirror/lang-javascript";
import {Extension, Text} from "@codemirror/state";
import {useCallback} from "react";
import {CodeBooth} from "..";
import {Buttons, Clear, Copy, Reset, Run, Tab, TabList} from "../components/buttons";
import {TabPanel} from "../components/TabPanel";
import {FileTabs} from "../components/FileTabs";
import {Console} from "../components/Console";
import {Editor} from "../components/Editor";
import {Replay} from "../components/Replay";
import {Resize} from "../components/Resize";
import {Preview} from "../components/Preview";
import {basicSetup} from "../extensions";
import {State} from "../store";

type RunCallback = React.ComponentProps<typeof CodeBooth>["run"];
type HandleCallback = React.ComponentProps<typeof Replay>["handle"];

/** HTML run function */
const run: RunCallback = (files, setState) => {

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
    case "Ctrl-L":
    case "Cmd-K":
      useStore.setState({messages: []});
      break;
  }
};

/** HTML demo */
export function HTMLDemo(props: {
  initial?: Record<string, {
    activeFile: string;
    files: {
      content: string;
      filename: string;
    }[];
  }>;
  extensions?: Extension[];
}) {
  const initial = props.initial || {
    demo: {
      activeFile: "index.html",
      files: [
        {content: "", filename: "index.html"},
        {content: "", filename: "script.js"},
        {content: "", filename: "style.css"}
      ]
    }
  };

  return (
    <CodeBooth run={run}>
      <FileTabs />
      {Object.keys(initial).map(group =>
        <TabPanel id={group} key={group}>
          {initial[group].files.map(file =>
            <Editor extensions={[basicSetup, extensionFromFilename(file.filename)]} filename={file.filename} key={file.filename} />
          )}
        </TabPanel>
      )}
      <Resize />
      <Console />
      <Buttons>
        <Reset to={initial} />
        <Run />
        <Clear />
      </Buttons>
    </CodeBooth>
  );
}

/** Interactive HTML replay */
export const HTMLReplay: React.FC<{
  replay: React.ComponentProps<typeof Replay>["replay"];
  start: number;
}> = (props) => {
  return (
    <CodeBooth activeGroup="replay" run={run}>
      <TabPanel id="replay">
        <Replay extensions={[basicSetup, html()]} filename="untitled.py" handle={handle} replay={props.replay} start={props.start} />
      </TabPanel>
      <TabPanel id="playground">
        <Editor extensions={[basicSetup, html()]} filename="untitled.py" />
      </TabPanel>
      <Resize />
      <Console />
      <Buttons>
        <TabList>
          <Tab id="replay">Code</Tab>
          <Tab id="playground">Playground</Tab>
        </TabList>
        <Copy from="replay" to="playground" />
        <Run />
        <Clear />
      </Buttons>
      {props.children}
    </CodeBooth>
  );
}

/** Record HTML demos */
export const HTMLRecord: React.FC<{}> = () => {
  return (
    <CodeBooth>
      <FileTabs />
      <TabPanel id="record">
        <Editor extensions={[basicSetup, html()]} filename="index.html" />
        <Editor extensions={[basicSetup, css()]} filename="style.css" />
        <Editor extensions={[basicSetup, javascript()]} filename="script.js" />
      </TabPanel>
      <Resize />
      <Buttons>
        <Run />
      </Buttons>
      <Preview />
    </CodeBooth>
  )
};

// /* messaging */
// const messages = useStore(state => state.messages);

// useEffect(() => {
//   function update(msg: MessageEvent) {
//     if (msg.data.type === "console.log") {
//       useStore.setState(prev => ({
//         ...prev,
//         messages: prev.messages.concat(msg.data.content)
//       }));
//     } else if (msg.data.type === "console.clear") {
//       useStore.setState(prev => ({
//         ...prev,
//         messages: []
//       }))
//     }
//   }

//   window.addEventListener("message", update);

//   return () => {
//     window.removeEventListener("message", update);
//   }
// }, []);

/** Get CM extension appropriate to filename extension */
function extensionFromFilename(filename: string): Extension {
  switch (true) {
    case filename.endsWith(".css"):
      return css();
    case filename.endsWith(".html"):
      return html();
    case filename.endsWith(".js"):
      return javascript();
  }
}