import {EditorView, keymap} from "@codemirror/view";
import {RecorderPlugin, ReplayDataRecorder} from "@liqvid/recording";
import {bind} from "@liqvid/utils/misc";
import {ReplayData} from "@liqvid/utils/replay-data";
import {icon} from "./icon";

type CaptureData = string | [number, number][];

// the actual thingy that gets exported
export class CodeRecorder extends ReplayDataRecorder<CaptureData> {
  constructor() {
    super();
    bind(this, ["extension"]);
  }

  extension(keys: string[] = []) {
    console.log(keys);
    // record document changes
    const updateListener = EditorView.updateListener.of(update => {
      if (!this.manager || this.manager.paused || !this.manager.active)
        return;

      // get selection change (if any)
      const transactions =
        update.transactions
          .map(t => {
            if (!t.selection)
              return null;
            const range = t.selection.ranges[0];
            return [range.anchor, range.head] as [number, number];
          })
          .filter(Boolean)
          .slice(-1);

      this.capture(this.manager.getTime(), [
        update.changes.toJSON(),
        ...transactions
      ]);
    });

    // record special key presses
    const keyListener = keymap.of(
      keys.map(key => ({
        key,
        run: () => {
          console.log(`pressed ${key}`);
          if (!this.manager || this.manager.paused || !this.manager.active)
            return false;
          this.capture(this.manager.getTime(), key);
          return false;
        }
      }))
    );

    return [updateListener, keyListener];
  }
}

function KeySaveComponent(props: {data: ReplayData<CaptureData>}) {
  return (
    <>
      <textarea readOnly value={JSON.stringify(props.data)}></textarea>
    </>
  );
}

export const CodeRecording: RecorderPlugin<[number, CaptureData], ReplayData<CaptureData>, CodeRecorder> = {
  enabled: () => true,
  icon,
  key: "codemirror",
  name: "Code",
  recorder: new CodeRecorder(),
  saveComponent: KeySaveComponent,
  title: "Record code"
};

// function formatNum(x: number): number {
//   return parseFloat(x.toFixed(2));
// }
