/* eslint-disable @typescript-eslint/no-explicit-any */

type ArrayDiffKey = `[]${string}`;
type ArrayDiff = [delta: number, itemDiffs?: [number, any][], ...tail: any[]];

type CreateKey = `+${string}`;

type ObjectApplyKey = `@${string}`;

type RemoveKey = `-${string}`;
type RemovePlaceholder = 0;

type SetKey = `=${string}`;

interface DiffRecord {
  [key: ArrayDiffKey]: ArrayDiff;
  [key: CreateKey]: any;
  [key: ObjectApplyKey]: DiffRecord;
  [key: RemoveKey]: RemovePlaceholder;
  [key: SetKey]: any;
}

export function objDiff(a: any, b: any): DiffRecord {
  const ret: DiffRecord = {};

  const keysA = Object.keys(a);
  const keysB = new Set(Object.keys(b));

  for (const key of keysA) {
    if (!keysB.has(key)) {
      ret[`-${key}`] = 0;
      continue;
    }

    const valueA = a[key];
    const valueB = b[key];

    if (typeof valueA !== typeof valueB) {
      console.warn("Expected same type");
    } else {
      if (!cmp(valueA, valueB)) {
        switch (typeof valueA) {
          case "string":
          case "number":
          case "boolean":
          case "bigint":
            ret[`=${key}`] = valueB;
            break;
          case "object":
            if (valueA === null || valueB === null) {
              ret[`=${key}`] = valueB;
            } else if (Array.isArray(valueA) !== Array.isArray(valueB)) {
              ret[`=${key}`] = valueB;
            } else if (Array.isArray(valueA) && Array.isArray(valueB)) {
              // diffs
              const itemDiffs: [number, any][] = [];

              for (let i = 0; i < Math.min(valueA.length, valueB.length); ++i) {
                const itemA = valueA[i];
                const itemB = valueB[i];

                if (!cmp(itemA, itemB)) {
                  itemDiffs.push([i, itemB]);
                }
              }

              const delta = valueB.length - valueA.length;

              // pure deletion
              if (itemDiffs.length === 0 && delta <= 0) {
                ret[`[]${key}`] = [delta];
              } else {
                ret[`[]${key}`] = [
                  valueB.length - valueA.length,
                  itemDiffs,
                  ...valueB.slice(valueA.length),
                ];
              }
            } else {
              ret[`@${key}`] = objDiff(valueA, valueB) as any;
            }
            break;
        }
      }
    }
    keysB.delete(key);
  }

  for (const key of keysB) {
    ret[`+${key}`] = b[key];
  }

  return ret;
}

export function applyDiff(a: any, b: DiffRecord): any {
  const copy = structuredClone(a);

  for (const key of Object.keys(b)) {
    switch (true) {
      // delete
      case startsWith(key, "-" as const):
        delete copy[key.slice(1)];
        break;
      // create/set
      case startsWith(key, "+" as const):
      case startsWith(key, "=" as const):
        copy[key.slice(1)] = b[key];
        break;
      // array
      case startsWith(key, "[]" as const): {
        const [delta, itemDiffs, ...appends] = b[key] as ArrayDiff;
        const target = copy[key.slice(2)] as any[] | undefined;

        if (target === undefined) {
          throw new TypeError("Expected array");
        }

        if (itemDiffs) {
          for (const [index, item] of itemDiffs) {
            target[index] = item;
          }
        }

        if (delta < 0) {
          target.splice(target.length + delta, -delta);
        } else {
          for (const append of appends) {
            target.push(append);
          }
        }

        break;
      }
      // object
      case startsWith(key, "@" as const): {
        const target = copy[key.slice(1)] as object | undefined;

        if (target === undefined) {
          throw new TypeError("Expected object");
        }

        copy[key.slice(1)] = applyDiff(target, b[key]);
        break;
      }
    }
    // const parts = key.split(".");
    // let target = copy;
    // for (let i = 0; i < parts.length - 1; ++i) {
    //   if (!Object.prototype.hasOwnProperty.call(target, parts[i])) {
    //     target[parts[i]] = {};
    //   }
    //   target = target[parts[i]];
    // }

    // if (b[key] === undefined) {
    //   if (target instanceof Array) {
    //     target.splice(parseInt(parts.at(-1)!), 1);
    //   } else {
    //     delete target[parts.at(-1)!];
    //   }
    // } else {
    //   target[parts.at(-1)!] = b[key];
    // }
  }

  return copy;
}

function assertObject(a: unknown): asserts a is Record<string, unknown> {
  if (typeof a !== "object" || a === null) {
    throw new TypeError(`Expected object, got ${typeof a}`);
  }
}

function cmp(a: unknown, b: unknown): a is typeof b {
  if (typeof a !== typeof b) return false;

  switch (typeof a) {
    case "bigint":
    case "boolean":
    case "function":
    case "number":
    case "string":
    case "symbol":
    case "undefined":
      return a === b;
  }

  if (a === null || b === null) return a === b;

  assertObject(a);
  assertObject(b);

  const keysA = Object.keys(a);
  const keysB = new Set(Object.keys(b));

  if (keysA.length !== keysB.size) return false;
  return keysA.every((key) => keysB.has(key) && cmp(a[key], b[key]));
}

function startsWith<K extends string>(
  key: string,
  prefix: K,
): key is `${K}${string}` {
  return key.startsWith(prefix as string);
}
