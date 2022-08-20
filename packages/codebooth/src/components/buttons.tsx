import {onClick} from "@liqvid/utils/react";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {useStore} from "zustand";
import {useBoothStore} from "../store";
import {ids} from "../utils";

/** Div to hold buttons. */
export const Buttons: React.FC<{children?: React.ReactNode}> = (props) => {
  return <div className="lqv-cb-buttons">{props.children}</div>;
};

/** Button for clearing the output/console. */
export const Clear: React.FC = () => {
  const store = useBoothStore();

  const clear = useCallback(() => {
    store.setState({messages: []});
  }, []);
  const events = useMemo(() => onClick(clear), []);

  /* add keyboard shortcuts */
  useEffect(() => {
    store.setState((prev) => ({
      shortcuts: {
        ...prev.shortcuts,
        "Mod-L": {
          key: "Mod-L",
          run: () => {
            clear();
            return true;
          },
        },
      },
    }));
  }, []);

  const label = "Clear";

  return (
    <button
      className="lqv-cb-clear"
      {...events}
      aria-label={label}
      title={label}
    >
      Clear
    </button>
  );
};

/** Button for copying the contents of one group to another. */
export const Copy: React.FC<{
  /** Source editor group. */
  from: string;

  /** Target editor group. */
  to: string;
}> = (props) => {
  const store = useBoothStore();

  const copy = useCallback(() => {
    const {groups} = store.getState();

    const from = groups[props.from],
      to = groups[props.to];

    if (!(from && to)) {
      console.error(`Could not copy from ${props.from} to ${props.to}`);
      return;
    }

    for (const file of from.files) {
      const source = file.view;
      const target = to.files.find((_) => _.filename === file.filename).view;
      target.dispatch(
        target.state.update({
          changes: {
            from: 0,
            to: target.state.doc.length,
            insert: source.state.doc,
          },
        })
      );
    }
  }, []);

  const events = useMemo(() => onClick(copy), []);

  return (
    <button className="lqv-cb-copy" {...events}>
      Copy
    </button>
  );
};

/** Button for resetting editor contents to initial state. */
export const Reset: React.FC = () => {
  const store = useBoothStore();
  const contents = useRef<Record<string, Record<string, string>>>({});

  /* get contents */
  useEffect(() => {
    const state = store.getState();
    for (const key in state.groups) {
      contents.current[key] = {};
      for (const file of state.groups[key].files) {
        contents.current[key][file.filename] = file.view.state.doc.toString();
      }
    }
  }, []);

  /* reset */
  const reset = useCallback(() => {
    const state = store.getState();
    for (const groupName in contents.current) {
      for (const file of state.groups[groupName].files) {
        if (file.filename in contents.current[groupName]) {
          file.view.dispatch(
            file.view.state.update({
              changes: {
                from: 0,
                to: file.view.state.doc.length,
                insert: contents.current[groupName][file.filename],
              },
            })
          );
        }
      }
    }
  }, []);

  const resetEvents = useMemo(() => onClick(reset), []);

  const label = "Reset";
  return (
    <button
      className="lqv-cb-reset"
      aria-label={label}
      title={label}
      {...resetEvents}
    >
      Reset
    </button>
  );
};

/** Button for running the code. */
export const Run: React.FC = () => {
  const store = useBoothStore();

  // run callback
  const run = useCallback(() => {
    store.setState((prev) => ({run: prev.run + 1}));
  }, []);

  /* add keyboard shortcuts */
  useEffect(() => {
    store.setState((prev) => ({
      shortcuts: {
        ...prev.shortcuts,
        "Mod-Enter": {
          key: "Mod-Enter",
          run: () => {
            run();
            return true;
          },
        },
      },
    }));
  }, []);

  // click events
  const events = useMemo(() => onClick(run), []);

  return (
    <button className="lqv-cb-run" {...events}>
      Run
    </button>
  );
};

/** Group selection tab. */
export const Tab: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** ID of {@link EditorGroup} this corresponds to */
    id: string;
  }
> = (props) => {
  const {children, id, ...attrs} = props;

  const store = useBoothStore();
  const active = useStore(store, (state) => state.activeGroup === id);

  const events = useMemo(
    () =>
      onClick(() => {
        store.setState({activeGroup: id});
      }),
    []
  );

  return (
    <button
      aria-controls={ids.editorGroup({group: id})}
      id={ids.groupTab({group: id})}
      aria-selected={active}
      role="tab"
      {...events}
      {...attrs}
    >
      {props.children}
    </button>
  );
};

/** Holds a list of {@link Tab}s. */
export const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const {children, ...attrs} = props;
  return (
    <div role="tablist" {...attrs}>
      {children}
    </div>
  );
};
