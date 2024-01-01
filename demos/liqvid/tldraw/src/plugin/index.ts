import {length, ReplayData} from "@liqvid/utils/replay-data";
import type {MediaElement} from "@lqv/playback";
import {Editor, TLShapeId} from "@tldraw/tldraw";
import {isInstance, isPointer, isShape} from "./record-types";
import {TldrawEvent} from "./recording";
import {applyDiff, CursorName, log} from "./utils";

export type PointerHandler = (args: {
  kind?: CursorName;
  x?: number;
  y?: number;
}) => void;

/**
 * Move an image along a recorder cursor path.
 */
export function tldrawReplay({
  data,
  playback,
  start = 0,
  end = start + length(data),
  editor,
  handlePointer,
}: {
  /** Cursor data to replay. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ReplayData<TldrawEvent>;

  /** {@link MediaElement} to sync with. */
  playback: MediaElement;

  /**
   * When replay should begin
   * @default 0
   */
  start?: number;

  /**
   * When the cursor should end
   * @default `start` + total duration of `data`
   */
  end?: number;

  /** Element to sync with */
  editor: Editor;

  /** Handle cursor updates */
  handlePointer: PointerHandler;
}): () => void {
  /** Array of times that events happen */
  const times = data.reduce(
    (acc, [duration]) => acc.concat((acc.at(-1) ?? 0) + duration),
    [] as number[],
  );

  // initialize inverses

  // compute inverses

  /* main logic */
  let index = 0;
  let lastTime = 0;

  const update = (): void => {
    const t = playback.currentTime;
    const progress = (t - start) * 1000;

    // forward
    if (lastTime <= t && index < times.length) {
      let i = index;
      for (; i < data.length && times[i] <= progress; ++i) {
        const event = data[i][1];

        if (isPointer(event)) {
          handlePointer({x: event[0], y: event[1]});
          continue;
        }

        const [type, update] = event;
        switch (true) {
          case isInstance(type, update):
            editor.updateInstanceState(applyDiff(editor.instanceState, update));
            break;
          case isShape(type, update):
            const shape = editor.store.get(type as TLShapeId);
            if (shape) {
              if (update === null) {
                editor.deleteShape(shape.id);
              } else {
                // update shape
                editor.updateShape({
                  id: shape.id,
                  props: applyDiff(shape, update).props,
                });
              }
            } else {
              // new shape
              editor.createShape(update);
            }
            break;
        }
      }
      index = i;
    } else if (t < lastTime && 0 < index) {
      // backward
      let i = index - 1;
      for (; 0 <= i && progress < times[i]; --i) {}
      index = i + 1;
    }
  };

  // editor.updateInstanceState({isReadonly: true});

  const unsubscribeFromPlayback = subscribe(playback, update);

  return function unsubscribe() {
    unsubscribeFromPlayback();
  };
}

/**
 * Synchronize with playback.
 * @param playback {@link MediaElement} to synchronize with.
 * @param update Callback function.
 */
function subscribe(
  playback: MediaElement,
  update: (t: number) => void,
): () => void {
  const callback = (): void => update(playback.currentTime);

  // subscribe
  playback.addEventListener("seeking", callback);
  playback.addEventListener("timeupdate", callback);

  callback();

  // return unsubscription
  return () => {
    playback.removeEventListener("seeking", callback);
    playback.removeEventListener("timeupdate", callback);
  };
}
