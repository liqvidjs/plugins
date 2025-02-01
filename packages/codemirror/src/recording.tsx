import type { Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, keymap } from "@codemirror/view";
import { type RecorderPlugin, ReplayDataRecorder } from "@liqvid/recording";
import { bind } from "@liqvid/utils/misc";
import type { ReplayData } from "@liqvid/utils/replay-data";

import { icon } from "./icon";

import { scrollCmd } from ".";

export type EditorChange = [
  [number, ...(EditorChange | number | string)[]],
  [number, number],
];
export type SpecialKey = string;
export type ScrollAction =
  | [typeof scrollCmd, number, number]
  | [typeof scrollCmd, number];

export type CaptureData = EditorChange | ScrollAction | SpecialKey;

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
    if (Array.isArray(specialKeys)) {
      // biome-ignore lint/style/noParameterAssign: helpful for backwards compatibility
      specialKeys = Object.fromEntries(specialKeys.map((key) => [key, key]));
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $this = this;

    const scrollListener = ViewPlugin.fromClass(
      class {
        constructor(view: EditorView) {
          view.scrollDOM.addEventListener("scroll", () => {
            if (!$this.manager || $this.manager.paused || !$this.manager.active)
              return;
            const time = $this.manager.getTime();

            const fontSize = Number.parseFloat(
              getComputedStyle(view.scrollDOM).getPropertyValue("font-size"),
            );

            // vertical scroll is more common so we put it first and omit
            // horizontal scroll if it's zero
            const action: ScrollAction = [
              scrollCmd,
              view.scrollDOM.scrollTop / fontSize,
              view.scrollDOM.scrollLeft / fontSize,
            ];
            if (action[2] === 0) {
              action.pop();
            }

            $this.capture(time, action);
          });
        }
      },
    );

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

      this.capture(this.manager.getTime(), [
        update.changes.toJSON(),
        ...transactions,
        // biome-ignore lint/suspicious/noExplicitAny: TODO
      ] as any);
    });

    // record special key presses
    const keyListener = keymap.of(
      Object.keys(specialKeys).map((key) => ({
        key,
        run: () => {
          if (this.manager?.active && !this.manager.paused) {
            this.capture(
              this.manager.getTime(),
              (specialKeys as Record<string, string>)[key],
            );
          }
          return false;
        },
      })),
    );

    return [scrollListener, updateListener, keyListener];
  }
}

const KeySaveComponent: React.FC<{ data: ReplayData<CaptureData> }> = (
  props,
) => {
  return (
    <>
      <textarea readOnly value={JSON.stringify(props.data)} />
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
