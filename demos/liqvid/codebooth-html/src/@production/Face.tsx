import {clamp} from "@liqvid/utils/misc";
import {onClick, onDrag} from "@liqvid/utils/react";
import {usePlayer, Video} from "liqvid";
import {useMemo, useRef, useState} from "react";

/** Floating video */
export const Face: React.FC = (props) => {
  const player = usePlayer();
  const offset = useRef({x: 0, y: 0});
  const dragEvents = useMemo(() => onDrag(
    // move
    (e, hit) => {
      const {domElement} = ref.current;

      // prevent from dragging off the page
      const left = clamp(
        0,
        hit.x - offset.current.x - player.canvas.offsetLeft,
        player.canvas.offsetWidth - domElement.offsetWidth
      ) / player.canvas.offsetWidth;

      const top = clamp(
        0,
        hit.y - offset.current.y - player.canvas.offsetTop,
        player.canvas.offsetHeight - domElement.offsetHeight
      ) / player.canvas.offsetHeight;

      Object.assign(domElement.style, {
        left: `${left * 100}%`,
        top: `${top * 100}%`
      });
    },
    // down
    (e, hit) => {
      e.preventDefault();
      const {domElement} = ref.current;

      const dims = domElement.getBoundingClientRect();
      offset.current.x = hit.x - dims.left;
      offset.current.y = hit.y - dims.top;

      document.body.classList.add("dragging");
    },
    // up
    () => {
      document.body.classList.remove("dragging");
    }
  ), []);

  const ref = useRef<Video>();

  return (
    <Video className="draggable floating-face" disablePictureInPicture {...dragEvents} ref={ref}>
      {props.children}
    </Video>
  );
};

export function FaceControl() {
  const player = usePlayer();
  const [active, setActive] = useState(true);

  const label = active ? "Hide face" : "Show face";

  const events = useMemo(() => onClick<HTMLButtonElement>(e => {
    player.canvas.classList.toggle("no-face");
    setActive(prev => !prev);
    e.currentTarget.blur();
  }), []);

  return (
    <button className="lv-controls-face" aria-label={label} title={label} {...events}>
      <svg className={active ? "active" : undefined} viewBox="-10 -10 120 120">
        <circle cx="50" cy="50" r="45" fill="transparent" stroke="#FFF" strokeWidth="5"/>
        <circle cx="30" cy="30" r="5" fill={"#FFF"}/>
        <circle cx="70" cy="30" r="5" fill={"#FFF"} strokeWidth="0"/>
        <path d="M 20,50 A 30,30 0,0,0 80,50" fill={"#FFF"} strokeWidth="5"/>
      </svg>
    </button>
  );
}
