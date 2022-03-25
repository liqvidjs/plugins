import {useBoothStore} from "../store";
import {Children, cloneElement} from "react";

/** Holds a group of editors. */
export const TabPanel: React.FC<{
  /** ID of this group. */
  id: string;
} & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const {children, id, ...attrs} = props;

  const useStore = useBoothStore();
  const active = useStore(state => state.activeGroup === id);

  return (
    <div
      aria-expanded={active} aria-labelledby={`tab-${id}`} hidden={!active}
      className="lqv-tabpanel" id={`panel-${id}`} role="tabpanel"
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
