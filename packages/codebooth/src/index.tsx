import { keymap } from "@codemirror/view";
import type { CodeRecorder } from "@lqv/codemirror/recording";
import { PlaybackContext, useME } from "@lqv/playback/react";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

import { shortcuts } from "./extensions";
import { BoothStore, type Store, makeStore, useBoothStore } from "./store";

// buttons
export * from "./components/buttons";
export { Console } from "./components/Console";
export { Editor } from "./components/Editor";
export { EditorGroup } from "./components/EditorGroup";
export { EditorPanel } from "./components/EditorPanel";
export { FileTabs } from "./components/FileTabs";
export { Record } from "./components/Record";
export { Replay, ReplayMultiple } from "./components/Replay";
export { Resize } from "./components/Resize";
export * from "./extensions";
export { useBoothStore, type State, type Store } from "./store";

/**
 * Container for code editing/recording/replaying.
 */
export const CodeBooth: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    /** CodeMirror recorder. */
    recorder?: CodeRecorder;
  }
> = ({ children, className, recorder, ...attrs }) => {
  const store = useRef<Store>();
  if (!store.current) {
    store.current = makeStore({ recorder });
  }
  const stateClassNames = useStore(store.current, (state) => state.classNames);

  /* render */
  return (
    <div
      className={classNames(stateClassNames, className)}
      data-affords="click"
      {...attrs}
    >
      <BoothStore.Provider value={store.current}>
        <PlaybackContext.Provider value={useME()}>
          <KeyboardShortcuts />
          {children}
        </PlaybackContext.Provider>
      </BoothStore.Provider>
    </div>
  );
};

function KeyboardShortcuts(): null {
  const store = useBoothStore();

  useEffect(() => {
    // this is somewhat wasteful but oh well
    function reconfigure(): void {
      const state = store.getState();

      for (const groupName in state.groups) {
        for (const { view } of state.groups[groupName].files) {
          view.dispatch({
            effects: shortcuts.reconfigure([
              keymap.of(Object.values(state.shortcuts)),
            ]),
          });
        }
      }
    }

    const unsubs: (() => void)[] = [];

    // update with new shortcuts
    unsubs.push(store.subscribe((state) => state.shortcuts, reconfigure));

    // update with new editors
    unsubs.push(store.subscribe((state) => state.groups, reconfigure));

    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }, [store]);

  return null;
}
