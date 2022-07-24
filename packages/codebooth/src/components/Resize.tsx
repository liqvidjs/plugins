import {clamp} from "@liqvid/utils/misc";
import {onDrag} from "@liqvid/utils/react";
import {useMemo, useRef} from "react";

/**
 * Component for adjusting the vertical editor/console split.
 */
export const Resize: React.FC<{
  /**
   * Resize direction, east-west or north-south.
   * @default "ew"
   */
  dir?: "ew" | "ns";

  /**
   * Maximum value.
   * @default 0.75
   */
  max?: number;

  /**
   * Minimum value.
   * @default 0.25
   */
  min?: number;
}> = ({dir = "ew", max = 0.75, min = 0.25}) => {
  const ref = useRef<HTMLDivElement>();

  /* event handlers */
  const resizeEvents = useMemo(() => {
    let container: HTMLDivElement;
    return onDrag((e, {x, y}) => {
      const rect = container.getBoundingClientRect();

      if (dir === "ew") {
        container.style.setProperty("--split", clamp(min, (x - rect.left) / rect.width, max) * 100 + "%");
      } else if (dir === "ns") {
        container.style.setProperty("--v-split", clamp(min, (rect.bottom - y) / rect.height, max) * 100 + "%");
      }
    }, () => {
      container = ref.current.closest(".lqv-codebooth") as HTMLDivElement;
      container.classList.add("dragging");
    }, () => {
      container.classList.remove("dragging");
    });
  }, []);

  return (
    <div
      {...resizeEvents}
      ref={ref}
      className={`ui-resizable-handle ui-resizable-${dir}`} style={{zIndex: 90}}
    />
  );
};
