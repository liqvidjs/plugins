import classNames from "classnames";
import {Children, cloneElement, useEffect} from "react";
import {useStore} from "zustand";
import {useBoothStore} from "../store";
import {ids} from "../utils";

/** Holds a group of editors. */
export function EditorGroup({
  children,
  className,
  id,
  ...attrs
}: React.HTMLAttributes<HTMLDivElement> & {
  /** ID of this group. */
  id: string;
}) {
  const store = useBoothStore();
  const active = useStore(store, (state) => state.activeGroup === id);

  useEffect(() => {
    const state = store.getState();
    if (!state.activeGroup) {
      store.setState({activeGroup: id});
    }
  }, []);

  return (
    <div
      aria-expanded={active}
      aria-labelledby={ids.groupTab({group: id})}
      hidden={!active}
      className={classNames("lqv-editor-group", className)}
      id={ids.editorGroup({group: id})}
      role="tabpanel"
      {...attrs}
    >
      {Children.map(children, (node) => {
        if (typeof node === "object" && "props" in node) {
          return cloneElement(node, {group: id});
        }
        return node;
      })}
    </div>
  );
}
