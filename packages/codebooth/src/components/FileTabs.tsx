import {Utils} from "liqvid";
import {useMemo} from "react";
// import {CodeBoothRecorder, recorders} from "./recorders";
import {useBoothStore} from "../store";
const {onClick} = Utils.mobile;
// import {manager} from "./actions";

/**
 * File selector component.
 */
export function FileTabs() {
  const useStore = useBoothStore();
  const active = useStore(state => state.active);
  const openFiles = useStore(state => state.openFiles);

  const events = useMemo(() => onClick<HTMLButtonElement>(e => {
    // record event
    // if (manager.active) {
    //   (recorders.booth as CodeBoothRecorder).capture(undefined, {
    //     selectFile: (e.currentTarget as HTMLButtonElement).textContent
    //   });
    // };

    // set state
    useStore.setState({
      active: (e.currentTarget as HTMLButtonElement).textContent.trim()
    });
  }), []);

  return (<div className="lqv-file-tabs" role="tablist">
    {openFiles.map((file) => (
      <button
        key={file.filename}
        className={`lqv-filetype-${file.type}`} id={`lqv-tab-${sanitize(file.filename)}`}
        aria-controls={`lqv-panel-${sanitize(file.filename)}`} aria-selected={active === file.filename} role="tab"
        {...events}
      >
        {file.filename}
      </button>
    ))}
  </div>);
}

/**
 * Sanitize a string for use as a CSS class or ID
 */
 export function sanitize(str: string) {
  return str.replace(/[^A-Za-z0-9_-]/g, "_");
}
