import {Children, cloneElement} from "react";
import {useStore} from "zustand";
import {useBoothStore} from "../store";
import {ids} from "../utils";

/**
 * Tabpanel containing a single editor.
 */
export const EditorPanel: React.FC<{
  children?: React.ReactNode;

  /** Filename for the panel. */
  filename: string;

  /**
   * Group name for the panel.
   * @default "default"
   */
  group?: string;
}
> = (props) => {
  const {
    filename,
    group = "default"
  } = props;
  const store = useBoothStore();
  const active = useStore(store, state => state.groups[group]?.activeFile === filename);

  return (
    <div aria-expanded={active} aria-labelledby={ids.fileTab({filename, group})} hidden={!active}
    className="lqv-editor-panel" id={ids.editorPanel({filename, group})} role="tabpanel">
       {Children.map(props.children, node => {
        if (typeof node === "object" && "props" in node) {
          return cloneElement(node, {filename, group});
        }
        return node;
      })}
    </div>
  );
};
