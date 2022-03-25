import {ChangeSet, Text} from "@codemirror/state";
import type {EditorView} from "@codemirror/view";
import type {ReplayData} from "@liqvid/utils/replay-data";
import type {EventEmitter} from "events";
import {FakeSelection, Range} from "./fake-selection";

type Action = string | [changes: ChangeSet, selection?: [number, number]];

export function cmReplay({data, handle, playback, start, view}: {
  data: ReplayData<Action>;
  handle?: (key: string, doc: Text) => void;
  playback: EventEmitter;
  start?: number;
  view: EditorView;
}) {
  start ??= 0;
  let index = 0;
  let lastTime = 0;

  /* unpackage */
  // decompress times
  const times = data.map(_ => _[0]);

  for (let i = 1; i < times.length; ++i)
    times[i] += times[i-1];

  // deserialize changesets
  for (const entry of data) {
    if (typeof entry[1] !== "string")
      entry[1][0] = ChangeSet.fromJSON(entry[1][0]);
  }

  // compute inverses (fuck)
  const inverses: ChangeSet[] = [];
  let doc = view.state.doc;
  for (let i = 0; i < data.length; ++i) {
    const action = data[i][1];
    if (typeof action !== "string") {
      inverses[i] = action[0].invert(doc);
      doc = action[0].apply(doc);
    }
  }
  doc = undefined;

  /* main logic */
  const repaint = (t: number) => {
    const progress = t - start;

    let changes = ChangeSet.empty(view.state.doc.length);
    let selection: Range;

    // apply / revert changes
    if (lastTime <= t && index < data.length) {
      let i = index;
      for (; i < data.length && times[i] <= progress; ++i) {
        const action = data[i][1];

        if (typeof action === "string") {
          handle(action, changes.apply(view.state.doc));
        } else {
          changes = changes.compose(action[0]);

          // handle selection
          if (action[1]) {
            const [anchor, head] = action[1];
            selection = {anchor, head};
          }
        }
      }
      index = i;
    } else if (t < lastTime && 0 < index) {
      let i = index - 1;
      for (; 0 <= i && progress < times[i]; --i) {
        if (inverses[i])
          changes = changes.compose(inverses[i]);
      }
      index = i + 1;
    }

    const effects = selection ? [FakeSelection.of(selection)] : undefined;

    view.dispatch(view.state.update({changes, effects}));

    lastTime = t;
  };

  /* subscribe */
  playback.on("seek", repaint);
  playback.on("timeupdate", repaint);

  return () => {
    playback.off("seek", repaint);
    playback.off("timeupdate", repaint);
  };
}

export {fakeSelection} from "./fake-selection";
