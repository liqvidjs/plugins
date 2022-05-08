import {onClick} from "@liqvid/utils/react";
import {selectCmd} from "@lqv/codemirror";
import {useEffect, useMemo} from "react";
import {useStore} from "zustand";
import {State, useBoothStore} from "../store";
import {ids} from "../utils";

const selector = (state: State) => [state.activeGroup, state.groups[state.activeGroup]?.activeFile];

/**
 * File selector component.
 */
export function FileTabs() {
  const store = useBoothStore();
  const [activeGroup, activeFilename] = useStore(store, selector);
  const group = store.getState().groups[activeGroup];
  const {recorder} = store.getState();

  const events = useMemo(() => onClick<HTMLButtonElement>(e => {
    // record event
    // @ts-expect-error Manager needs to be changed from protected to public
    if (recorder?.manager?.active) {
      recorder.capture(undefined,
        selectCmd + e.currentTarget.textContent
      );
    }

    // set state
    store.setState(state => ({
      groups: {
        ...state.groups,
        [state.activeGroup]: {
          ...(state.groups[state.activeGroup]),
          activeFile: e.currentTarget.textContent.trim()
        }
      }
    }));
  }), [recorder]);

  // set class
  useEffect(() => {
    store.setState(prev => ({classNames: prev.classNames.concat("multifile")}));
  }, []);

  if (!group)
    return null;

  return (<div className="lqv-file-tabs" role="tablist">
    {group.files.map(({filename}) => (
      <button
        key={filename}
        className={`lqv-filetype-${getFileType(filename)}`} id={ids.fileTab({filename, group: activeGroup})}
        aria-controls={ids.editorPanel({filename, group: activeGroup})} aria-selected={activeFilename === filename} role="tab"
        {...events}
      >
        {filename}
      </button>
    ))}
  </div>);
}

/**
 * Get file extension.
 * @param filename Name of file.
 * @returns File extension.
 */
function getFileType(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1);
}
