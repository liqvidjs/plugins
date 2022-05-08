import type {CodeRecorder} from "@lqv/codemirror/recording";
import {PlaybackContext, usePlayback} from "@lqv/playback/react";
import {useRef} from "react";
import {useStore} from "zustand";
import {BoothStore, makeStore, Store} from "./store";

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
          {props.children}
        </PlaybackContext.Provider>
      </BoothStore.Provider>
    </div>
  );
};
