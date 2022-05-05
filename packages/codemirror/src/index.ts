import {ChangeSet, Text} from "@codemirror/state";
import type {EditorView} from "@codemirror/view";
import type {ReplayData} from "@liqvid/utils/replay-data";
import type {EventEmitter} from "events";
import {FakeSelection, Range} from "./fake-selection";

type Action = string | [changes: ChangeSet, selection?: [number, number]];

/** Reserved command for specifying file. */
export const selectCmd = "file:";

/**
 * Replay typing in CodeMirror.
 */
export function cmReplay(
  {data, handle, playback, start, view}:
    Omit<Parameters<typeof cmReplayMultiple>[0], "handle" | "views"> & {
      /**
       * Function for handling special commands.
       * @param cmd Command to handle.
       * @param doc CodeMirror document.
       */
      handle?: (cmd: string, doc: Text) => void;

      /** CodeMirror instance to sync with. */
      view: EditorView;
    }
): () => void {
  return cmReplayMultiple({
    data: [[0,selectCmd + "default"], ...data],
    handle: (key, docs) => handle(key, docs["default"]),
    playback, start,
    views: {
      "default": view
    }
  });
}

/** Replay typing to several CodeMirror instances in parallel. */
export function cmReplayMultiple({data, handle, playback, start = 0, views}: {
  /** Recording data to replay. */
  data: ReplayData<Action>;

  /**
   * Function for handling special commands.
   * @param cmd Command to handle.
   * @param docs CodeMirror documents.
   */
  handle?: (cmd: string, docs: Record<string, Text>) => void;

  /** Playback to sync with. */
  playback: EventEmitter;

  /**
   * Time playback should start.
   * @default 0
   */
  start?: number;

  /** CodeMirror instances to sync with. */
  views: Record<string, EditorView>;
}) {
  /** Current file being replayed into */
  let file: string = undefined;

  // validation
  if (!(data.length > 0 && data[0][0] === 0 && typeof data[0][1] === "string" && data[0][1].startsWith(selectCmd))) {
    throw new Error("First command must have time 0 and select the file");
  }

  /* unpackage */
  // decompress times
  const times = data.map(_ => _[0]);

  for (let i = 1; i < times.length; ++i)
    times[i] += times[i - 1];

  // deserialize changesets
  for (const entry of data) {
    if (typeof entry[1] !== "string")
      entry[1][0] = ChangeSet.fromJSON(entry[1][0]);
  }

  // initialize inverses
  const inverses: Record<keyof typeof views, ChangeSet[]> = {};
  for (const key in views) {
    inverses[key] = [];
  }

  // compute inverses
  const docs: Record<keyof typeof views, Text> = {};
  for (const key in views) {
    docs[key] = views[key].state.doc;
  }
  for (let i = 0; i < data.length; ++i) {
    const action = data[i][1];
    if (typeof action !== "string") {
      inverses[file][i] = action[0].invert(docs[file]);
      docs[file] = action[0].apply(docs[file]);
    } else if (action.startsWith(selectCmd)) {
      file = action.slice(selectCmd.length);
    }
  }

  /* main logic */
  let index = 0;
  let lastTime = 0;

  const repaint = (t: number) => {
    const progress = t - start;

    const changes: Record<string, ChangeSet> = {};
    for (const key in views) {
      changes[key] = ChangeSet.empty(views[key].state.doc.length);
    }

    const selections: Record<string, Range> = {};

    // apply / revert changes
    if (lastTime <= t && index < data.length) {
      let i = index;
      for (; i < data.length && times[i] <= progress; ++i) {
        const action = data[i][1];

        if (typeof action === "string") {
          if (action.startsWith(selectCmd)) {
            file = action.slice(selectCmd.length);
          }
          // handle action
          const docs: Record<string, Text> = {};
          for (const key in views) {
            docs[key] = changes[key].apply(views[key].state.doc);
          }
          handle(action, docs);
        } else {
          changes[file] = changes[file].compose(action[0]);

          // handle selection
          if (action[1]) {
            const [anchor, head] = action[1];
            selections[file] = {anchor, head};
          }
        }
      }
      index = i;
    } else if (t < lastTime && 0 < index) {
      let i = index - 1;
      for (; 0 <= i && progress < times[i]; --i) {
        if (inverses[file][i]) {
          changes[file] = changes[file].compose(inverses[file][i]);
        } else if (data[i][1] === selectCmd + file) {
          // find file to replay into
          for (let j = i-1; 0 <= j; --j) {
            const action = data[j][1];
            if (typeof action === "string" && action.startsWith(selectCmd)) {
              file = action.slice(selectCmd.length);
              break;
            }
          }
        }
      }
      index = i + 1;
    }

    for (const key in views) {
      const effects = selections[key] ? [FakeSelection.of(selections[key])] : undefined;
      views[key].dispatch(views[key].state.update({changes: changes[key], effects}));
    }

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
