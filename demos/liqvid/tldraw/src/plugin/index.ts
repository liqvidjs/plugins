import {
  TLDrawShape,
  type Editor,
  type TLDrawShapeSegment,
  type TLRecord,
  type TLShapeId,
  type TLShapePartial,
} from "@tldraw/tldraw";
import {makeReplayPlugin} from "./plugin-utils";
import {isDrawShape, isPointer, isShape, isSnapshot} from "./record-types";
import type {ReplayState, TldrawAction, TldrawEvent} from "./types";
import {applyDiff, type CursorName} from "./utils";
import {defaultShape} from "./defaults";

type TLPointer = Extract<TLRecord, {typeName: "pointer"}>;

export type PointerHandler = (args: {
  kind?: CursorName;
  x?: number;
  y?: number;
}) => void;

export const tldrawReplay = makeReplayPlugin<
  TldrawEvent,
  ReplayState,
  TldrawAction,
  {
    /** Element to sync with */
    editor: Editor;

    /** Handle cursor updates */
    handlePointer: PointerHandler;

    /** Return whether the camera should follow the author. */
    isFollowing: () => boolean;
  }
>({
  apply: (state, action) => {
    // TODO make this a deep clone
    const clone = {...state};
    if (action.pointer) {
      clone.pointer = action.pointer;
    }

    return clone;
  },

  // blank state
  blankState: () => ({pointer: [0, 0]}),

  // decompress
  decompress: (datum) => {
    if (isPointer(datum)) {
      return {pointer: datum};
    }

    if (isSnapshot(datum)) {
      return {snapshot: datum};
    }

    // get unique key
    const keys = Object.keys(datum);
    if (keys.length !== 1) {
      return {};
    }
    const key = keys[0];

    // shape commands
    if (isShape(key)) {
      const update = datum[key];

      // shape remove
      if (update === null) {
        return {[key]: {remove: true}};
      }
      // shape append
      else if (Array.isArray(update)) {
        const [x, y, z] = update;
        return {[key]: {append: [{x, y, z}]}};
      }
      // shape create
      return {[key]: {init: applyDiff(defaultShape, update)}};
    }

    return {};
  },
  // commit
  commit(action, {editor, handlePointer}) {
    editor.store.mergeRemoteChanges(() => {
      // snapshot must come first
      if (action.snapshot) {
        editor.store.loadSnapshot(action.snapshot);
      }

      // pointer
      if (action.pointer) {
        const [x, y] = action.pointer;
        handlePointer({x, y});
      }

      // other updates
      const keys = Object.keys(action) as (keyof typeof action)[];
      for (const key of keys) {
        if (key === "snapshot" || key === "pointer") continue;

        if (isShape(key)) {
          const update = action[key];
          console.log(key, update);

          const shape = editor.store.get(key as TLShapeId);

          // create shape
          if ("init" in update) {
            editor.createShape({...update.init, isLocked: true});
          } else if ("append" in update) {
            // validation
            {
              if (!shape) {
                console.warn(`Expected shape: ${key}`);
                continue;
              }

              if (!isDrawShape(shape)) {
                console.warn(`Cannot append to non-draw shape: ${key}`);
                continue;
              }
            }

            const zerothSegment = shape.props.segments.at(0);
            if (!zerothSegment) {
              console.warn(
                `Cannot append to shape without zeroth segment: ${key}`,
              );
              continue;
            }

            editor.updateShape<TLDrawShape>({
              id: shape.id,
              type: shape.type,
              // need to put this here for the update to work
              isLocked: true,
              props: {
                ...shape.props,
                segments: [
                  {
                    ...zerothSegment,
                    points: [...zerothSegment.points, ...update.append],
                  },
                  ...shape.props.segments.slice(1),
                ],
              },
            });
          }
          // remove shape
          else if ("remove" in update) {
            shape && editor.deleteShape(shape.id);
          }
        }
      }
    });
  },
  // invert
  invert(state, action) {
    const inverse: TldrawAction = {};
    if (action.pointer) {
      inverse.pointer = state.pointer;
    }

    return inverse;
  },
  // merge
  merge(...actions) {
    return actions.reduce((a, b) => {
      return {
        ...a,
        ...b,
      };
    }, {});
  },
});
