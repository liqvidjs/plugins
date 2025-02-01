import type { ArrayDiff, DiffRecord } from "./types";
import { matchItemDiff, matchRunes, objectKeys } from "./utils";

/** Apply a diff to an object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyDiff(a: any, b: DiffRecord): any {
  const copy = structuredClone(a);

  for (const rkey of objectKeys(b)) {
    matchRunes(b, rkey, {
      add(key, item) {
        copy[key] = item;
      },
      delete(key) {
        delete copy[key];
      },
      array(key, item) {
        const target = copy[key];

        if (!Array.isArray(target)) {
          throw new TypeError("Expected array");
        }

        copy[key] = applyArrayDiff(target, item);
      },
      object(key, item) {
        const target = copy[key];

        if (typeof target !== "object" || target === null) {
          console.dir({ a, b });
          throw new TypeError("Expected object");
        }

        copy[key] = applyDiff(target, item);
      },
      set(key, item) {
        copy[key] = item;
      },
    });
  }

  return copy;
}

/** Apply a diff to an array. */
export function applyArrayDiff<T>(arr: T[], diff: ArrayDiff): T[] {
  const [delta, itemDiffs = [], ...appends] = diff;
  const copy = arr.slice();

  for (const diff of itemDiffs) {
    matchItemDiff(diff, {
      set(offset, item) {
        copy[copy.length - offset] = item as T;
      },
      array(offset, item) {
        copy[copy.length - offset] = applyArrayDiff(
          copy[copy.length - offset] as unknown[],
          item,
        ) as T;
      },
      object(offset, item) {
        copy[copy.length - offset] = applyDiff(
          copy[copy.length - offset],
          item,
        ) as T;
      },
    });
  }

  if (delta < 0) {
    copy.splice(copy.length + delta, -delta);
  } else {
    for (const append of appends) {
      copy.push(append as T);
    }
  }

  return copy;
}
