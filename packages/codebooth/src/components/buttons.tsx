import {Utils} from "liqvid";
import {useCallback, useEffect, useMemo} from "react";
const {onClick} = Utils.mobile;
// import {onClick} from "@liqvid/utils/react";
import {State, useBoothStore} from "../store";
import {EditorView, keymap} from "@codemirror/view";
import {shortcuts} from "../extensions";

const mac = navigator.platform === "MacIntel";

/** Div to hold buttons. */
export const Buttons: React.FC = (props) => {
  return (<div className="lqv-cb-buttons">{props.children}</div>);
}

/** Button for clearing the output/console. */
export function Clear() {
  const useStore = useBoothStore();

  const clear = useCallback(() => {
    useStore.setState({messages: []});
  }, []);
  const events = useMemo(() => onClick(clear), []);

  /* add keyboard shortcuts */
  useEffect(() => {
    for (const view of getAllEditors(useStore.getState())) {
      addKeyboardShortcuts(view, "Mod-L", () => {
        clear();
        return true;
      });
    }
  }, []);

  const label = "Clear";

  return (<button className="lqv-cb-clear" {...events} aria-label={label} title={label}>Clear</button>);
}

/** Button for copying the contents of one buffer to another. */
export const Copy: React.FC<{
  from: string;
  to: string;
}> = (props) => {
  const useStore = useBoothStore();

  const copy = useCallback(() => {
    const {groups} = useStore.getState();

    for (const key in groups) {
      // look for source documents
      if (!key.startsWith(props.from + ":"))
        continue;
      const filename = key.slice((props.from + ":").length);
      const source = groups[key];

      // find corresponding target document
      const target = groups[props.to + ":" + filename];
      if (!target) {
        continue;
      }

      // copy document
      target.dispatch(target.state.update({
        changes: {
          from: 0,
          to: target.state.doc.length,
          insert: source.state.doc
        }
      }));
    }
  }, []);

  const events = useMemo(() => onClick(copy), []);

  return (<button className="lqv-cb-copy" {...events}>Copy</button>);
}

/** Button for resetting editor. */
export const Reset: React.FC<{
  to: Record<string, {
    files: {
      content: string;
      filename: string;
    }[];
  }>;
}> = (props) => {
  const useStore = useBoothStore();
  const events = useMemo(() => onClick(e => {
    const {groups} = useStore.getState();
    for (const groupName in props.to) {
      const source = props.to[groupName];
      const target = groups[groupName];

      for (const file of source.files) {
        const view = target.files.find(_ => _.filename === file.filename)?.view;
        if (!view) {
          throw new Error(`Could not find ${file.filename} in group ${groupName}`);
          continue;
        }

        view.dispatch(view.state.update({
          changes: {
            from: 0,
            to: file.content.length,
            insert: file.content
          }
        }));
      }
    }
  }), []);

  return (<button className="lqv-cb-reset" {...events}>Reset</button>);
}

/** Button for running the code. */
export function Run() {
  const useStore = useBoothStore();

  // run callback
  const run = useCallback(() => {
    useStore.setState(prev => ({run: prev.run + 1}));
  }, []);

  /* add keyboard shortcuts */
  useEffect(() => {
    for (const view of getAllEditors(useStore.getState())) {
      addKeyboardShortcuts(view, "Mod-Enter", () => {
        run();
        return true;
      });
    }
  }, []);

  // click events
  const events = useMemo(() => onClick(run), []);

  return (<button className="lqv-cb-run" {...events}>Run</button>)
}

/** Group selection tab. */
export const Tab: React.FC<{
  /** ID of {@link TabPanel} this corresponds to */
  id: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const {children, id, ...attrs} = props;

  const useStore = useBoothStore();
  const active = useStore(state => state.activeGroup === id);

  const events = useMemo(() => onClick(() => {
    useStore.setState({activeGroup: id});
  }), []);

  return (<button
    aria-controls={`panel-${id}`} id={`tab-${id}`}
    aria-selected={active} role="tab"
    {...events} {...attrs}>{props.children}</button>
  );
}

/** Holds a list of tabs. */
export const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const {children, ...attrs} = props;
  return (<div role="tablist" {...attrs}>{children}</div>);
};

/** Add keyboard shortcuts to editors */
function addKeyboardShortcuts(view: EditorView, key: string, run: (view: EditorView) => boolean) {
  view.dispatch({
    effects: shortcuts.reconfigure([
      shortcuts.get(view.state),
      keymap.of([
        {key, run}
      ])
    ])
  });
}

function getAllEditors(state: State): EditorView[] {
  const editors: EditorView[] = [];
  for (const key in state.groups) {
    for (const file of state.groups[key].files) {
      editors.push(file.view);
    }
  }

  return editors;
}

/** Format key sequences with special characters on Mac */
function fmtSeq(str: string) {
  if (navigator.platform !== "MacIntel")
    return str;
  if (str === void 0)
    return str;
  return str.split("+").map(k => {
    if (k === "Ctrl")
      return "^";
    else if (k === "Alt")
      return "⌥"
    if (k === "Shift")
      return "⇧";
    if (k === "Meta")
      return "⌘";
    return k;
  }).join("");
}
