import type {ReplayData} from "@liqvid/utils/replay-data";
import {
  StoreSnapshot,
  TLRecord,
  TLShape,
  TLShapePartial,
  VecModel,
} from "@tldraw/editor";

// compressed events
export type PointerCoords = [number, number];

// shapes
export type ShapeKey = `shape:${string}`;
export type ShapeUpdate = {[key: ShapeKey]: TLShape};
export type ShapeAppend = {
  [key: ShapeKey]: [x: number, y: number, z: number];
};
export type ShapeRemove = {[key: ShapeKey]: null};

export type TldrawEvent =
  | PointerCoords
  | ShapeAppend
  | ShapeRemove
  | ShapeUpdate
  | StoreSnapshot<TLRecord>;
export type TldrawData = ReplayData<TldrawEvent>;

// state
export type ReplayState = {
  pointer: [number, number];
};

// actions
export type TldrawAction = {
  pointer?: [number, number];
  snapshot?: StoreSnapshot<TLRecord>;
  [key: ShapeKey]:
    | {
        init: TLShape;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | {update: any; append: VecModel[]}
    | {remove: true};
};

// export type TldrawPointerEvent = [number, number];
// export type TldrawShapeEvent = [`shape:${string}`, TLShape | null];
// export type TldrawInstanceEvent = ["instance", object];

// export type TldrawEvent =
//   | TldrawInstanceEvent
//   | TldrawPointerEvent
//   | TldrawShapeEvent
//   | StoreSnapshot<TLRecord>;
