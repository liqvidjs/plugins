import {keymap} from "@codemirror/view";
import type {CodeRecorder} from "@lqv/codemirror/recording";
import {PlaybackContext, usePlayback} from "@lqv/playback/react";
import {useEffect, useRef} from "react";
import {useStore} from "zustand";
import {shortcuts} from "./extensions";
import {BoothStore, makeStore, Store, useBoothStore} from "./store";

// buttons
export * from "./components/buttons";
export {Console} from "./components/Console";
export {Editor} from "./components/Editor";
export {EditorGroup} from "./components/EditorGroup";
export {EditorPanel} from "./components/EditorPanel";
export {FileTabs} from "./components/FileTabs";
export {Record} from "./components/Record";
export {Replay, ReplayMultiple} from "./components/Replay";
export {Resize} from "./components/Resize";
export * from "./extensions";
export {State, Store, useBoothStore} from "./store";

/**
 * Container for code editing/recording/replaying.
 */
export const CodeBooth: React.FC<{
  /** CodeMirror recorder. */
  recorder?: CodeRecorder;
} & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const {children, recorder, ...attrs} = props;
  const store = useRef<Store>();
  if (!store.current) {
    store.current = makeStore({recorder});
  }
  const classNames = useStore(store.current, state => state.classNames);

  /* render */
  return (
    <div className={classNames.join(" ")} data-affords="click" {...attrs}>
      <BoothStore.Provider value={store.current}>
        <PlaybackContext.Provider value={usePlayback()}>
          <KeyboardShortcuts />
          {props.children}
        </PlaybackContext.Provider>
      </BoothStore.Provider>
    </div>
  );
};

function KeyboardShortcuts(): null {
  const store = useBoothStore();

  useEffect(() => {
    // this is somewhat wasteful but oh well
    function reconfigure() {
      const state = store.getState();

      for (const groupName in state.groups) {
        for (const {view} of state.groups[groupName].files) {
          view.dispatch({
            effects: shortcuts.reconfigure([
              keymap.of(Object.values(state.shortcuts))
            ])
          });
        }
      }
    }

    // update with new shortcuts
    store.subscribe(state => state.shortcuts, reconfigure);

    // update with new editors
    store.subscribe(state => state.groups, reconfigure);
  }, []);

  return null;
}
