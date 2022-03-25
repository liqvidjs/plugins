import {PlaybackContext, usePlayback} from "liqvid";
import {useRef} from "react";
import {BoothStore, createStore, Store} from "./store";

// buttons
export * from "./components/buttons";
export {Console} from "./components/Console";
export {Editor} from "./components/Editor";
export {Record} from "./components/Record";
export {Replay} from "./components/Replay";
export {Resize} from "./components/Resize";
export {TabPanel} from "./components/TabPanel";
export * from "./extensions";
export {useBoothStore} from "./store";

/**
 * Container for code editing/recording/replaying.
 */
export const CodeBooth: React.FC<{
  /** Name of active group. */
  activeGroup?: string;
} & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const {activeGroup, children, ...attrs} = props;
  const store = useRef<Store>();
  if (!store.current) {
    store.current = createStore({activeGroup});
  }

  /* render */
  return (
    <div className="lqv-codebooth" data-affords="click" {...attrs}>
      <BoothStore.Provider value={store.current}>
        <PlaybackContext.Provider value={usePlayback()}>
        {props.children}
        </PlaybackContext.Provider>
      </BoothStore.Provider>
    </div>
  );
}
