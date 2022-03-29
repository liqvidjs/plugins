import {usePlayback} from "@lqv/playback/react";
import {useEffect, useRef} from "react";
import {cursorReplay} from ".";

/**
 * Move an image along a recorder cursor path. React version of {@link cursorReplay}.
 */
export function Cursor(props: Omit<Parameters<typeof cursorReplay>[0], "playback" | "target"> & {
  /** Src of cursor image. */
  src: string;
}) {
  const playback = usePlayback();
  const ref = useRef<HTMLImageElement>();

  // subscribe
  useEffect(() => {
    return cursorReplay({
      playback,
      target: ref.current,
      ...props
    });
  }, [props.align, ref.current]);

  return (
    <img className="lv-cursor" ref={ref} src={props.src} />
  );
}
