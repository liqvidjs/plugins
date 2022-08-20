import type {Extension} from "@codemirror/state";
import {EditorView, keymap} from "@codemirror/view";
import {RecorderPlugin, ReplayDataRecorder} from "@liqvid/recording";
import {bind} from "@liqvid/utils/misc";
import {ReplayData} from "@liqvid/utils/replay-data";
import {icon} from "./icon";

type CaptureData = [number, number][] | string;

// the actual thingy that gets exported
export class CodeRecorder extends ReplayDataRecorder<CaptureData> {
  constructor() {
    super();
    bind(this, ["extension"]);
  }

  /**
   * Get a CodeMirror extension for recording.
   * @param specialKeys Map of key sequences to commands, e.g. {"Mod-Enter": "run"}.
   * @returns CodeMirror extension.
   */
  extension(specialKeys: Record<string, string> | string[] = {}): Extension {
    // legacy
    if (specialKeys instanceof Array) {
      specialKeys = Object.fromEntries(specialKeys.map((key) => [key, key]));
    }
    // record document changes
    const updateListener = EditorView.updateListener.of((update) => {
      if (!this.manager || this.manager.paused || !this.manager.active) return;

      // get selection change (if any)
      const transactions = update.transactions
        .map((t) => {
          if (!t.selection) return null;
          const range = t.selection.ranges[0];
          return [range.anchor, range.head] as [number, number];
        })
        .filter(Boolean)
        .slice(-1);

      // empty events can break replay
      if (update.changes.empty && transactions.length === 0) return;

      this.capture(this.manager.getTime(), [update.changes.toJSON(), ...transactions]);
    });

    // record special key presses
    const keyListener = keymap.of(
      Object.keys(specialKeys).map((key) => ({
        key,
        run: () => {
          if (this.manager && this.manager.active && !this.manager.paused) {
            this.capture(this.manager.getTime(), (specialKeys as Record<string, string>)[key]);
          }
          return false;
        },
      }))
    );

    return [updateListener, keyListener];
  }
}

const KeySaveComponent: React.FC<{data: ReplayData<CaptureData>}> = (props) => {
  return (
    <>
      <textarea readOnly value={JSON.stringify(props.data)}></textarea>
    </>
  );
};

export const CodeRecording: RecorderPlugin<
  [number, CaptureData],
  ReplayData<CaptureData>,
  CodeRecorder
> = {
  enabled: () => true,
  icon,
  key: "codemirror",
  name: "Code",
  recorder: new CodeRecorder(),
  saveComponent: KeySaveComponent,
  title: "Record code",
};
