import type {Editor, TLShape, TLShapeId} from "@tldraw/tldraw";
import {makeReplayPlugin} from "./plugin-utils";
import {isInstance, isPointer, isShape} from "./record-types";
import type {
  TldrawData,
  TldrawEvent,
  TldrawPointerEvent,
  TldrawShapeEvent,
} from "./recording";
import {applyDiff, objDiff, type CursorName} from "./utils";

export type PointerHandler = (args: {
  kind?: CursorName;
  x?: number;
  y?: number;
}) => void;

export const tldrawReplay = makeReplayPlugin<
  TldrawEvent,
  {
    /** Element to sync with */
    editor: Editor;

    /** Handle cursor updates */
    handlePointer: PointerHandler;
  }
>({
  commit(event: TldrawEvent, {editor, handlePointer}) {
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
  },

  computeInverses(data: TldrawData): TldrawEvent[] {
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
                  inverse = [
                    type,
                    objDiff(newShape, shape),
                  ] as TldrawShapeEvent;
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
  },
});
