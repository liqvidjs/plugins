import { useMemo, useRef } from "react";
import { clamp } from "@liqvid/utils/misc";
import { onDrag } from "@liqvid/utils/react";
import "./Popup.css";

type DragDir = "s" | "e" | "se";

export function Popup(props: {
  children?: React.ReactNode;

  title?: string;
}) {
  const dragDir = useRef<DragDir>();
  const ref = useRef<HTMLElement>();
  const offset = useRef({ x: 0, y: 0 });

  const dragEvents = useMemo(
    () =>
      onDrag(
        (e, hit) => {
          // prevent from dragging off the page
          const left =
            clamp(
              0,
              hit.x - offset.current.x,
              window.innerWidth - ref.current.offsetWidth,
            ) / window.innerWidth;

          const top =
            clamp(
              0,
              hit.y - offset.current.y,
              window.innerHeight - ref.current.offsetHeight,
            ) / window.innerHeight;

          Object.assign(ref.current.style, {
            left: `${left * 100}%`,
            top: `${top * 100}%`,
          });
        },
        // down
        (e, hit) => {
          e.preventDefault();
          const dims = ref.current.getBoundingClientRect();
          offset.current.x = hit.x - dims.left;
          offset.current.y = hit.y - dims.top;

          document.body.classList.add("dragging");
        },
        () => document.body.classList.remove("dragging"),
      ),
    [],
  );

  const resizeEvents = useMemo(
    () =>
      onDrag(
        (e, { dx, dy }) => {
          e.preventDefault();
          const rect = ref.current.getBoundingClientRect();

          let { height, width } = rect;

          if (dragDir.current.includes("e")) width += dx;
          if (dragDir.current.includes("s")) height += dy;

          Object.assign(ref.current.style, {
            height: `${height}px`,
            width: `${width}px`,
          });
        },
        (e) => {
          dragDir.current = (e.target as HTMLDivElement).className.match(
            /ui-resizable-([se]+)/,
          )[1] as DragDir;

          document.body.classList.add("resizing");
        },
        () => document.body.classList.remove("resizing"),
      ),
    [],
  );

  return (
    <aside className="popup" ref={ref}>
      {props.title && (
        <header className="draggable" {...dragEvents}>
          {props.title}
        </header>
      )}
      <div className="ui-resizable-handle ui-resizable-e" {...resizeEvents} />
      <div className="ui-resizable-handle ui-resizable-s" {...resizeEvents} />
      <div className="ui-resizable-handle ui-resizable-se" {...resizeEvents} />
      <div className="popup-content">{props.children}</div>
    </aside>
  );
}
