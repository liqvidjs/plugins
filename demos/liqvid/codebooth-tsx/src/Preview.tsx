import * as Babel from "@babel/standalone";
import {useBoothStore} from "@lqv/codebooth";
import {useRef, useEffect} from "react";

declare global {
  interface Window {
    __Component: JSX.Element;
  }
}

export function Preview() {
  const ref = useRef<HTMLOutputElement>();
  const store = useBoothStore();

  useEffect(() => {
    store.subscribe(state => state.run, () => {
      const state = store.getState();
      console.log(state);
      const file = state.groups[state.activeGroup].files[0];
      const tsx = file.view.state.doc.toString();

      const opts: any = {
        filename: file.filename,
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
        eval(Babel.transform(tsx, opts).code);
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  return <output id="demo" ref={ref} />;
}
