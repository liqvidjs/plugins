import {onClick} from "@liqvid/utils/react";
import {selectCmd} from "@lqv/codemirror";
import {useCallback, useEffect, useMemo} from "react";
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

  const select = useCallback((filename: string) => {
    // record event
    // @ts-expect-error Manager needs to be changed from protected to public
    if (recorder?.manager?.active) {
      recorder.capture(undefined,
        selectCmd + filename
      );
    }

    // set state
    store.setState(state => ({
      groups: {
        ...state.groups,
        [state.activeGroup]: {
          ...(state.groups[state.activeGroup]),
          activeFile: filename
        }
      }
    }));

    // focus editor
    // this has to come last!
    const state = store.getState();
    state.groups[state.activeGroup]?.files.find(_ => _.filename === filename)?.view.focus();
  }, [recorder]);

  const events = useMemo(() => onClick<HTMLButtonElement>(e => {
    select(e.currentTarget.textContent.trim());
  }), [select]);

  // set class
  useEffect(() => {
    // keyboard shortcuts
    const selectShortcuts: State["shortcuts"] = {};

    for (let i = 1; i <= 9; ++i) {
      selectShortcuts[`Mod-${i}`] = {
        key: `Mod-${i}`,
        run: () => {
          const state = store.getState();
          const group = state.groups[state.activeGroup];

          if (group.files.length < i)
            return false;

          select(group.files[i-1].filename);

          return true;
        }
      };
    }

    // set class
    store.setState(prev => ({
      // set class
      classNames: prev.classNames.concat("multifile"),
      // shortcuts
      shortcuts: {
        ...prev.shortcuts,
        ...selectShortcuts
      }
    }));
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
