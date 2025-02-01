import { onClick } from "@liqvid/utils/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";
import classNames = require("classnames");

import { useBoothStore } from "../store";
import { ids } from "../utils";

/** Div to hold buttons. */
export function Buttons({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames("lqv-cb-buttons", className)} {...props} />;
}

/** Button for clearing the output/console. */
export function Clear({
  children = "Clear",
  className,
  shortcut = "Mod-L",
  title = "Clear",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Shortcut to clear the output/console.
   * @default "Mod-L"
   */
  shortcut?: string;
}) {
  const store = useBoothStore();

  const clear = useCallback(() => {
    store.setState({ messages: [] });
  }, []);
  const events = useMemo(() => onClick(clear), []);

  /* add keyboard shortcuts */
  useEffect(() => {
    store.setState((prev) => ({
      shortcuts: {
        ...prev.shortcuts,
        [shortcut]: {
          key: shortcut,
          run: () => {
            clear();
            return true;
          },
        },
      },
    }));
  }, []);

  return (
    <button
      className={classNames("lqv-cb-clear", className)}
      title={title}
      type="button"
      {...events}
      {...props}
    >
      {children}
    </button>
  );
}

/** Button for copying the contents of one group to another. */
export function Copy({
  children = "Copy",
  className,
  from: propsFrom,
  to: propsTo,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Source editor group. */
  from: string;

  /** Target editor group. */
  to: string;
}) {
  const store = useBoothStore();

  const copy = useCallback(() => {
    const { groups } = store.getState();

    const from = groups[propsFrom],
      to = groups[propsTo];

    if (!(from && to)) {
      console.error(`Could not copy from ${propsFrom} to ${propsTo}`);
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
        }),
      );
    }
  }, []);

  const events = useMemo(() => onClick(copy), []);

  return (
    <button
      className={classNames("lqv-cb-copy", className)}
      type="button"
      {...events}
      {...props}
    >
      {children}
    </button>
  );
}

/** Button for resetting editor contents to initial state. */
export function Reset({
  children = "Reset",
  className,
  title = "Reset",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
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
            }),
          );
        }
      }
    }
  }, []);

  const resetEvents = useMemo(() => onClick(reset), []);

  return (
    <button
      className={classNames("lqv-cb-reset", className)}
      title={title}
      type="button"
      {...resetEvents}
      {...props}
    >
      {children}
    </button>
  );
}

/** Button for running the code. */
export function Run({
  children = "Run",
  className,
  shortcut = "Mod-Enter",
  title = "Run",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Shortcut to run the code.
   * @default "Mod-Enter"
   */
  shortcut?: string;
}) {
  const store = useBoothStore();

  // run callback
  const run = useCallback(() => {
    store.setState((prev) => ({ run: prev.run + 1 }));
  }, []);

  /* add keyboard shortcuts */
  useEffect(() => {
    store.setState((prev) => ({
      shortcuts: {
        ...prev.shortcuts,
        [shortcut]: {
          key: shortcut,
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
    <button
      className={classNames("lqv-cb-run", className)}
      {...events}
      {...props}
    >
      {children}
    </button>
  );
}

/** Group selection tab. */
export function Tab({
  id,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** ID of {@link EditorGroup} this corresponds to */
  id: string;
}) {
  const store = useBoothStore();
  const active = useStore(store, (state) => state.activeGroup === id);

  const events = useMemo(
    () =>
      onClick(() => {
        store.setState({ activeGroup: id });
      }),
    [],
  );

  return (
    <button
      aria-controls={ids.editorGroup({ group: id })}
      aria-selected={active}
      id={ids.groupTab({ group: id })}
      role="tab"
      {...events}
      {...props}
    />
  );
}

/** Holds a list of {@link Tab}s. */
export function TabList(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" {...props} />;
}
