import {useME} from "@lqv/playback/react";
import {useEditor} from "@tldraw/tldraw";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {tldrawReplay, type PointerHandler} from ".";
import {layerCanvas} from "./layers";
import {isCamera} from "./record-types";
import {TldrawData} from "./recording";
import {getCursorSvgs} from "./utils";

/**
 * Move an image along a recorder cursor path. React version of {@link cursorReplay}.
 */
export function TldrawReplay(
  props: Omit<
    Parameters<typeof tldrawReplay>[0],
    "data" | "playback" | "editor"
  > & {
    /** Cursor data to replay. */
    data: TldrawData | Promise<TldrawData>;
  },
): React.ReactNode {
  const playback = useME();
  const editor = useEditor();
  const cursors = useMemo(getCursorSvgs, []);

  /**
   * Update the pointer position and image
   */
  const handlePointer: PointerHandler = useCallback(
    (opts) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      // update image
      if ("kind" in opts && opts.kind !== undefined) {
        const info = cursors.get(opts.kind);
        if (!info) return;
        cursor.style.backgroundImage = info.image;
      }

      // update coordinates
      if (opts.x !== undefined && opts.y !== undefined) {
        const {x, y} = opts;
        const {z} = editor.camera;
        cursorRef.current.style.willChange = "transform";
        cursorRef.current.style.transform = `translate(${x * z - 16}px, ${
          y * z - 16
        }px)`;
      }
    },
    [cursors, editor.camera],
  );

  // subscribe to replay
  useEffect(() => {
    const subscribe = (data: TldrawData) =>
      tldrawReplay({
        playback,
        editor,
        ...props,
        data,
        handlePointer,
      });

    // Promise polymorphism
    if (props.data instanceof Promise) {
      let unsub: () => void;
      props.data.then((data) => (unsub = subscribe(data)));
      return () => {
        unsub?.();
      };
    } else {
      return subscribe(props.data);
    }
  }, [editor, handlePointer, playback, props, props.data]);

  // keep viewport in sync
  useEffect(
    () =>
      editor.store.listen(({changes}) => {
        const layer = layerRef.current;
        if (!layer) return;

        for (const key of Object.keys(
          changes.updated,
        ) as (keyof typeof changes.updated)[]) {
          const record = changes.updated[key][1];
          if (!isCamera(record)) continue;

          const {x, y} = record;
          const {z} = editor.camera;
          layer.style.transform = `translate(${x * z}px, ${y * z}px)`;
        }
      }),
    [editor.camera, editor.store],
  );

  const layerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const cursor = cursors.get("cross");

  return (
    <div
      ref={layerRef}
      style={{
        left: "0",
        top: "0",
        position: "absolute",
        zIndex: layerCanvas,
      }}
    >
      <div
        ref={cursorRef}
        style={{
          backgroundImage: cursor?.image,
          height: "32px",
          width: "32px",
        }}
      />
    </div>
  );
}
