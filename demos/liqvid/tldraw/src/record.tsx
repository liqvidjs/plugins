import {RecordingControl, RecordingManager} from "@liqvid/recording";
import {
  TLEventInfo,
  TLKeyboardEventInfo,
  Tldraw,
  useEditor,
} from "@tldraw/tldraw";
import {Playback, Player, useKeymap} from "liqvid";

import {useCallback, useEffect} from "react";
import {TldrawRecording} from "./plugin/recording";
import {objDiff} from "./plugin/diff";

const manager = new RecordingManager();

const controls = [
  <RecordingControl manager={manager} plugins={[TldrawRecording]} />,
];

const playback = new Playback({duration: 60000});

export function Recording() {
  return (
    <Player controls={controls} playback={playback}>
      <div
        data-affords="click"
        style={{
          position: "absolute",
          inset: 0,
          height: "var(--lv-canvas-height)",
        }}
      >
        <Tldraw>
          <BubbleKeyboardEvents />
          <AttachEditor />
        </Tldraw>
      </div>
    </Player>
  );
}

function AttachEditor() {
  const editor = useEditor();

  TldrawRecording.recorder.provideEditor(editor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ed = editor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).objDiff = objDiff;

  return null;
}

/** Pass keyboard shortcuts up to the Liqvid keymap */
function BubbleKeyboardEvents() {
  const editor = useEditor();
  const keymap = useKeymap();

  const handleKeyboardShortcuts = useCallback(
    (e: TLEventInfo) => {
      if (!(e.type === "keyboard" && e.name === "key_down")) return;

      // only want to do recording shortcuts
      // remove if you're changing the recording shortcuts
      if (!(e.ctrlKey && e.altKey)) return;

      keymap.handle(asKeyboardEventish(e));
    },
    [keymap],
  );

  useEffect(() => {
    editor.on("event", handleKeyboardShortcuts);

    return () => {
      editor.off("event", handleKeyboardShortcuts);
    };
  }, [editor, handleKeyboardShortcuts]);

  return null;
}

/** Wrap a Tldraw event info so that Liqvid's keymap can handle it */
function asKeyboardEventish(
  e: TLKeyboardEventInfo,
): Pick<KeyboardEvent, "getModifierState" | "preventDefault"> &
  TLKeyboardEventInfo {
  return {
    ...e,
    preventDefault() {},
    getModifierState(modifier: string) {
      switch (modifier) {
        case "Alt":
          return e.altKey;
        case "Control":
          return e.ctrlKey;
        case "Shift":
          return e.shiftKey;
      }
      return false;
    },
  };
}
