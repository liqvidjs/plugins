import {usePlayback} from "@lqv/playback/react";
import {useEffect, useRef} from "react";
import {cursorReplay} from ".";
type CursorData = Parameters<typeof cursorReplay>[0]["data"];

/**
 * Move an image along a recorder cursor path. React version of {@link cursorReplay}.
 */
export function Cursor(props: Omit<Parameters<typeof cursorReplay>[0], "data" | "playback" | "target"> & {
  /** Cursor data to replay. */
  data: CursorData | Promise<CursorData>;

  /** Src of cursor image. */
  src: string;
}) {
  const playback = usePlayback();
  const ref = useRef<HTMLImageElement>();

  // subscribe
  useEffect(() => {
    if (props.data instanceof Promise) {
      let unsub: () => void;
      props.data.then(data => {
        unsub = cursorReplay({
          playback,
          target: ref.current,
          ...props,
          data
        });
      });
      return () => {
        unsub?.();
      };
    } else {
      return cursorReplay({
        playback,
        target: ref.current,
        ...props,
        data: props.data
      });
    }
  }, [props.align, ref.current]);

  return (
    <img className="lv-cursor" ref={ref} src={props.src} />
  );
}
