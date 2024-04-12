/* eslint-disable @typescript-eslint/no-explicit-any */
// export type ObjectDifference<T> = {
//   /** Added */
//   a?: Partial<T>;

import {structuredClone} from "@tldraw/utils";

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

/**
 * Pick certain fields from an object.
 * @param obj Object to pick fields from.
 * @param keys Keys to pick.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: (K | K[])[]
): Pick<T, K> {
  keys = keys.flat() as K[];
  return Object.fromEntries(
    (Object.keys(obj) as (keyof T)[])
      .filter((key) => (keys as (keyof T)[]).includes(key))
      .map((key) => [key, obj[key]]),
  ) as Pick<T, K>;
}

/**
 * Omit certain fields from an object.
 * @param obj Object to omit fields from.
 * @param keys Keys to omit.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: (K | K[])[]
): Omit<T, K> {
  keys = keys.flat() as K[];
  return Object.fromEntries(
    (Object.keys(obj) as (keyof T)[])
      .filter((key) => !(keys as (keyof T)[]).includes(key))
      .map((key) => [key, obj[key]]),
  ) as Omit<T, K>;
}

export function assertSameType<K>(a: unknown, b: K): asserts a is K {
  a;
  b;
}

export function assertType<K>(a: unknown): asserts a is K {
  a;
}
