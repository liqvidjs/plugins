import * as Babel from "@babel/standalone";
import {State, useBoothStore} from "@lqv/codebooth";
import {useEffect, useRef} from "react";
import {htmlTemplate, tsxTemplate} from "./files";

declare global {
  interface Window {
    __Component: JSX.Element;
  }
}

/**
 * Preview of TSX document.
 */
export function Preview() {
  /* this is largely taken from HTMLPreview in @lqv/codebooth/html */
  const store = useBoothStore();

  /** <iframe> containing preview document */
  const iframe = useRef<HTMLIFrameElement>();

  /* rendering */
  useEffect(() => {
    /* re-render */
    function render() {
      const files = getFileContents(store.getState());
      if (!("index.tsx" in files)) {
        return;
      }
      const tsx = tsxTemplate(files["index.tsx"]);

      // babel transform
      const opts: any = {
        filename: "index.tsx",
        plugins: [
          ["transform-modules-umd", {
            "globals": {
              "react": "React",
              "react-dom": "ReactDOM"
            }
          }]
        ],
        presets: ["env", "react", "typescript"]
      };
      try {
        const {code} = Babel.transform(tsx, opts);
        console.log(code);
        iframe.current.srcdoc = htmlTemplate(code);
      } catch (e) {

      }
    }

    // initial render
    render();
    // subscribe to run event

    return store.subscribe((state) => state.run, render);
  }, [store]);

  return (
    <iframe
      className="lqv-preview"
      ref={iframe}
      sandbox="allow-popups allow-scripts"
      title="TSX Preview"
    />
  );
}

/**
 * Get record of filenames to file contents.
 * @param state Booth state.
 */
function getFileContents(state: State): Record<string, string> {
  const ret: Record<string, string> = {};
  if (!state.groups[state.activeGroup]) return ret;
  const {files} = state.groups[state.activeGroup];
  for (const file of files) {
    ret[file.filename] = file.view.state.doc.toString();
  }
  return ret;
}
