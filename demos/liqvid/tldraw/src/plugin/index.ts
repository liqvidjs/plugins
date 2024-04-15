import {
  TLShape,
  TLStoreSnapshot,
  type Editor,
  type TLDrawShape,
  type TLShapeId,
} from "@tldraw/tldraw";
import {defaultShape} from "./defaults";
import {applyDiff, mergeDiffs} from "./diff";
import {creationDiff, deletionDiff, updateObjectDiff} from "./diff/builders";
import {invertDiff, matchRunes, objectKeys} from "./diff/utils";
import {makeReplayPlugin} from "./plugin-utils";
import {isDrawShape, isPointer, isShape} from "./record-types";
import type {Point3, ReplayState, TldrawAction, TldrawEvent} from "./types";
import {assertType, type CursorName} from "./utils";
import {segmentAppend} from "./zsa";

// type TLPointer = Extract<TLRecord, {typeName: "pointer"}>;

const deletePlaceholder = 0;

export type PointerHandler = (args: {
  kind?: CursorName;
  x?: number;
  y?: number;
}) => void;

type TldrawProps = {
  /** Element to sync with */
  editor: Editor;

  /** Handle cursor updates */
  handlePointer: PointerHandler;

  /** Return whether the camera should follow the author. */
  isFollowing: () => boolean;
};

type TldrawHistory = {
  shapes?: Map<string, TLShape>;
};

export const tldrawReplay = makeReplayPlugin<
  TldrawEvent,
  ReplayState,
  TldrawAction,
  TldrawProps,
  TldrawHistory
>({
  apply: (state, action) => {
    // TODO make this a deep clone
    const clone = {...state};
    if (action.pointer) {
      clone.pointer = action.pointer;
    }

    if (action.diff) {
      clone.snapshot.store = applyDiff(clone.snapshot.store, action.diff);
    }

    return clone;
  },

  // blank state
  blankState: () => ({pointer: [0, 0], snapshot: {} as TLStoreSnapshot}),

  // decompress
  decompress: (datum, history) => {
    history.shapes ??= new Map();

    if (isPointer(datum)) {
      return {pointer: datum};
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
      if (update === deletePlaceholder) {
        history.shapes.delete(key);
        return {diff: deletionDiff(key)};
      }
      // shape append
      else if (Array.isArray(update)) {
        if (update.length === 0) {
          console.error("Expected non-empty array");
          return {};
        }

        if (typeof update[0] === "number") {
          assertType<Point3>(update);
          return {diff: updateObjectDiff(key, segmentAppend([update]))};
        } else {
          assertType<Point3[]>(update);
          return {diff: updateObjectDiff(key, segmentAppend(update))};
        }
      }
      // shape create
      if (!history.shapes.has(key)) {
        const shape = applyDiff(defaultShape, update);
        history.shapes.set(key, shape);
        return {diff: creationDiff(key, shape)};
      }
      // shape update
      return {diff: updateObjectDiff(key, update)};
    }

    return {};
  },

  // commit
  commit(action, {editor, handlePointer}) {
    editor.store.mergeRemoteChanges(() => {
      // pointer
      if (action.pointer) {
        const [x, y] = action.pointer;
        handlePointer({x, y});
      }

      // state diffs
      if (action.diff) {
        const runedKeys = objectKeys(action.diff ?? {});
        for (const runedKey of runedKeys) {
          matchRunes(action.diff, runedKey, {
            add(key, value) {
              if (isShape(key)) {
                assertType<TLShape>(value);
                editor.createShape({...value, isLocked: true});
              }
            },
            delete(key) {
              if (isShape(key)) {
                editor.updateShape({
                  id: key as TLShapeId,
                  isLocked: false,
                  type: "",
                });
                editor.deleteShape(key as TLShapeId);
              }
            },
            object(key, update) {
              if (isShape(key)) {
                // validation
                const shape = editor.store.get(key as TLShapeId);
                {
                  if (!shape) {
                    console.warn(`Expected shape: ${runedKey}`);
                    return;
                  }

                  if (!isDrawShape(shape)) {
                    console.warn(
                      `Cannot append to non-draw shape: ${runedKey}`,
                    );
                    return;
                  }
                }

                editor.updateShape<TLDrawShape>(applyDiff(shape, update));
              }
            },
          });
        }
      }
    });
  },

  // initialize
  initialize(state, props) {
    props.editor.store.loadSnapshot(state.snapshot);
  },

  // invert
  invert(state, action) {
    const inverse: TldrawAction = {};

    if (action.pointer) {
      inverse.pointer = state.pointer;
    }

    if (action.diff) {
      inverse.diff = invertDiff(state.snapshot.store, action.diff);
    }

    return inverse;
  },

  // merge
  merge(...actions) {
    return actions.reduce((a, b) => {
      return {
        ...a,
        ...b,
        diff: mergeDiffs(a.diff ?? {}, b.diff ?? {}),
      };
    }, {});
  },
});
