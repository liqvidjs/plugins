import {useMemo, useRef} from "react";
import {clamp} from "@liqvid/utils/misc";
import {Utils} from "liqvid";
const {dragHelperReact} = Utils.interactivity;
// import {dragHelper} from "@liqvid/utils/react";

/**
 * Component for adjusting the vertical editor/console split.
 */
export function Resize() {
  const ref = useRef<HTMLDivElement>();

  /* event handlers */
  const resizeEvents = useMemo(() => dragHelperReact((e, {x}) => {
    const div = ref.current.parentElement;
    const rect = div.getBoundingClientRect();

    div.style.setProperty("--split", clamp(0.25, (x - rect.left) / rect.width, 0.75) * 100 + "%");
  }, () => {
    ref.current.parentElement.classList.add("dragging");
  }, () => {
    ref.current.parentElement.classList.remove("dragging");
  }, ref), []);

  return (
    <div
      {...resizeEvents}
      className="ui-resizable-handle ui-resizable-ew" style={{zIndex: 90}}
    />
  );
}
