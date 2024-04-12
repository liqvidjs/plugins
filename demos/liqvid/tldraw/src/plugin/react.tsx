import {useME} from "@lqv/playback/react";
import {Editor, Tldraw, useEditor} from "@tldraw/tldraw";
import {useEffect, useRef, useState} from "react";
import {tldrawReplay} from ".";
import {CanvasLayer} from "./react/CanvasLayer";
import {CursorImage} from "./react/CursorImage";
import type {TldrawData} from "./types";

/**
 * Replay Tldraw canvas. React version of {@link tldrawReplay}.
 */
export function TldrawReplay({
  children,
  start,
  data,
  ...props
}: Omit<
  Parameters<typeof tldrawReplay>[0],
  "data" | "playback" | "editor" | "handlePointer"
> &
  React.ComponentPropsWithoutRef<typeof Tldraw> & {
    /** Cursor data to replay. */
    data: TldrawData | Promise<TldrawData>;
  }): React.ReactNode {
  const playback = useME();
  const [editor, setEditor] = useState<Editor | null>(null);

  const cursorRef = useRef<React.ComponentRef<typeof CursorImage>>(null);

  /** Whether to follow the author's camera. */
  const isFollowing = useRef(true);

  // subscribe to replay
  useEffect(() => {
    const subscribe = (data: TldrawData) => {
      if (!editor) return () => {};
      return tldrawReplay({
        start,
        playback,
        editor,
        data,
        handlePointer: cursorRef.current?.handlePointer ?? (() => {}),
        isFollowing: () => isFollowing.current,
      });
    };

    // Promise polymorphism
    if (data instanceof Promise) {
      let unsub: () => void;
      data.then((d) => (unsub = subscribe(d)));
      return () => {
        unsub?.();
      };
    } else {
      return subscribe(data);
    }
  }, [data, editor, playback, props, start]);

  return (
    <Tldraw>
      {/*
       * React explodes if we call `loadSnapshot()`, which is part of
       * initialize(), inside <Tldraw>. So we have to do this awkward
       * thing instead.
       */}
      <SetEditor setEditor={setEditor} />
      <CanvasLayer>
        <CursorImage ref={cursorRef} />
      </CanvasLayer>
      {children}
    </Tldraw>
  );
}

function SetEditor({setEditor}: {setEditor: (editor: Editor | null) => void}) {
  const editor = useEditor();
  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);
  return null;
}
