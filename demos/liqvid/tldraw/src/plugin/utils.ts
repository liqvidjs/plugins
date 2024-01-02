// export type ObjectDifference<T> = {
//   /** Added */
//   a?: Partial<T>;

import {structuredClone} from "@tldraw/tldraw";

//   /** Removed */
//   r?: Partial<T>;

//   /** Updated */
//   u?: Partial<T>;
// };

// export function objDiff<T extends object>(a: T, b: T): ObjectDifference<T> {
//   const keysA = Object.keys(a) as (keyof T)[];
//   const keysB = new Set<keyof T>(Object.keys(b) as (keyof T)[]);

//   const data: ObjectDifference<T> = {};

//   for (const key of keysA) {
//     if (!keysB.has(key)) {
//       data.r ??= {};
//       data.r[key] = a[key];
//       continue;
//     }

//     const valueA = a[key];
//     const valueB = b[key];

//     if (!cmp(valueA, valueB)) {
//       data.u ??= {};
//       data.u[key] = valueB;
//     }
//     keysB.delete(key);
//   }

//   for (const key of keysB.values()) {
//     data.a ??= {};
//     data.a[key] = b[key];
//   }

//   return data;
// }

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

function assertObject(a: unknown): asserts a is Record<string, unknown> {
  if (typeof a !== "object" || a === null) {
    throw new TypeError(`Expected object, got ${typeof a}`);
  }
}

const CURSOR_NAMES = ["cross"] as const;
export type CursorName = (typeof CURSOR_NAMES)[number];

export interface CursorInfo {
  image: string;
  x: number;
  y: number;
}

/**
 * Get the SVGs for Tldraw's various cursor types
 */
export function getCursorSvgs(): Map<CursorName, CursorInfo> {
  const map = new Map<CursorName, CursorInfo>();

  for (const rule of getTlcontainerStyleRules()) {
    for (const name of CURSOR_NAMES) {
      const value = rule.style.getPropertyValue(`--tl-cursor-${name}`);
      const $_ = value.match(
        /^(?<url>.+\))\s+(?<x>\d+) (?<y>\d+),\s+(?<fallback>[a-z-]+)$/,
      )!;

      const groups = $_?.groups as
        | Record<"url" | "x" | "y" | "fallback", string>
        | undefined;
      if (!groups) continue;

      map.set(name, {
        image: groups.url,
        x: parseFloat(groups.x),
        y: parseFloat(groups.y),
      });
    }
  }

  return map;
}

/** Find CSS rules matching .tl-container */
function* getTlcontainerStyleRules() {
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!isStyleRule(rule)) continue;
        if (rule.selectorText !== ".tl-container") continue;

        yield rule;
      }
    } catch (e) {
      // tried to access cross-domain stylesheet
    }
  }
}

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.constructor.name === "CSSStyleRule";
}

export function objDiff(a: any, b: any): object {
  const ret = {} as any;

  const keysA = Object.keys(a);
  const keysB = new Set(Object.keys(b));

  for (const key of keysA) {
    if (!keysB.has(key)) {
      ret[key] = undefined;
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
            ret[key] = valueB;
            break;
          case "object":
            if (valueA === null || valueB === null) {
              ret[key] = valueB;
            } else {
              const nested = objDiff(valueA, valueB) as any;
              for (const subkey of Object.keys(nested)) {
                ret[`${key}.${subkey}`] = nested[subkey];
              }
            }
            break;
        }
      }
    }
    keysB.delete(key);
  }

  for (const key of keysB) {
    ret[key] = b[key];
  }

  return ret;
}

export function applyDiff(a: any, b: any) {
  const copy = structuredClone(a);

  for (const key of Object.keys(b)) {
    const parts = key.split(".");
    let target = copy;
    for (let i = 0; i < parts.length - 1; ++i) {
      if (!Object.prototype.hasOwnProperty.call(target, parts[i])) {
        target[parts[i]] = {};
      }
      target = target[parts[i]];
    }

    if (b[key] === undefined) {
      if (target instanceof Array) {
        target.splice(parseInt(parts.at(-1)!), 1);
      } else {
        delete target[parts.at(-1)!];
      }
    } else {
      target[parts.at(-1)!] = b[key];
    }
  }

  return copy;
}

export function log<T>(x: T): T {
  // console.log(x);
  return x;
}
