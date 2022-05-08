import {Children, cloneElement, useEffect} from "react";
import {useStore} from "zustand";
import {useBoothStore} from "../store";
import {ids} from "../utils";

/** Holds a group of editors. */
export const EditorGroup: React.FC<{
  /** ID of this group. */
  id: string;
} & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const {children, id, ...attrs} = props;

  const store = useBoothStore();
  const active = useStore(store, state => state.activeGroup === id);

  useEffect(() => {
    const state = store.getState();
    if (!state.activeGroup) {
      store.setState({activeGroup: id});
    }
  }, []);

  return (
    <div
      aria-expanded={active} aria-labelledby={ids.groupTab({group: id})} hidden={!active}
      className="lqv-editor-group" id={ids.editorGroup({group: id})} role="tabpanel"
      {...attrs}
    >
      {Children.map(children, node => {
        if (typeof node === "object" && "props" in node) {
          return cloneElement(node, {group: id});
        }
        return node;
      })}
    </div>
  );
};
