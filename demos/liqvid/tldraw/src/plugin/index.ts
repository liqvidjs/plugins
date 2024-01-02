import {length, ReplayData} from "@liqvid/utils/replay-data";
import type {MediaElement} from "@lqv/playback";
import {Editor, TLShape, TLShapeId} from "@tldraw/tldraw";
import {isInstance, isPointer, isShape} from "./record-types";
import {
  TldrawData,
  TldrawEvent,
  TldrawPointerEvent,
  TldrawShapeEvent,
} from "./recording";
import {applyDiff, CursorName, objDiff} from "./utils";
import {subscribe} from "./plugin-utils";

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

  /** Array of inverse operations */
  const inverses = computeInverses(data);
  console.log(data.length, inverses.length);

  /* main logic */
  let index = 0;
  let lastTime = 0;

  function commit(event: TldrawEvent) {
    if (isPointer(event)) {
      handlePointer({x: event[0], y: event[1]});
      return;
    }

    const [type, update] = event;
    switch (true) {
      case isInstance(type, update):
        //   editor.updateInstanceState(applyDiff(editor.instanceState, update));
        return;
      case isShape(type, update): {
        const shape = editor.store.get(type as TLShapeId);

        // new shape
        if (!shape) {
          editor.createShape(update);
          return;
        }

        // delete shape
        if (update === null) {
          editor.deleteShape(shape.id);
          return;
        }
        // update shape
        editor.updateShape({
          id: shape.id,
          props: applyDiff(shape, update).props,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
    }
  }

  const update = (): void => {
    const t = playback.currentTime;
    const progress = (t - start) * 1000;

    // forward
    if (lastTime <= t && index < times.length) {
      let i = index;
      for (; i < data.length && times[i] <= progress; ++i) {
        commit(data[i][1]);
      }
      index = i;
    } else if (t < lastTime && 0 < index) {
      // backward
      let i = index - 1;
      for (; 0 <= i && progress < times[i]; --i) {
        commit(inverses[i]);
      }
      index = i + 1;
    }

    lastTime = t;
  };

  return subscribe(playback, update);
}

/**
 * Compute array of inverses for an array of Tldraw events.
 */
function computeInverses(data: TldrawData): TldrawEvent[] {
  const inverses: TldrawEvent[] = [];

  // states to keep track of
  let pointerState: TldrawPointerEvent | undefined = undefined;
  const shapeCache = new Map<string, TLShape>();

  for (let i = 0; i < data.length; ++i) {
    const event = data[i][1];

    let inverse: TldrawEvent;

    // first pointer event defines the initial state
    if (isPointer(event)) {
      inverse = pointerState ?? event;
      pointerState = event;
    } else {
      // https://github.com/microsoft/TypeScript/issues/26916
      const [type, update] = event;
      switch (true) {
        // shape event
        case isShape(type, update):
          {
            const shape = shapeCache.get(type);

            if (shape) {
              // shape deleted
              if (update === null) {
                inverse = [type, shape];
              }
              // shape updated
              else {
                const newShape = applyDiff(shape, update);
                inverse = [type, objDiff(newShape, shape)] as TldrawShapeEvent;
                shapeCache.set(type, newShape);
              }
            }
            // shape added
            else {
              inverse = [type, null] as TldrawShapeEvent;
              shapeCache.set(type, update);
            }
          }
          break;
        default:
          inverse = event;
      }
    }

    inverses.push(inverse);
  }

  return inverses;
}
