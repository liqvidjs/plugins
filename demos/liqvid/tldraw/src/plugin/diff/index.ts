export { applyArrayDiff, applyDiff } from "./apply";
export {
  arrayItemDiff,
  creationDiff,
  deletionDiff,
  objectItemDiff,
  updateArrayDiff,
  updateObjectDiff,
} from "./builders";
export { arrDiff, objDiff } from "./compute";
export { mergeArrayDiffs, mergeDiffs } from "./merge";
export type { DiffRecord } from "./types";
export { invertDiff, matchItemDiff, matchRunes } from "./utils";
