import {assertType} from "../utils";
import {applyArrayDiff, applyDiff} from "./apply";
import {
  arrayItemDiff,
  changeItemDiff,
  creationDiff,
  deletionDiff,
  objectItemDiff,
  setDiff,
  updateArrayDiff,
  updateObjectDiff,
} from "./builders";
import {ArrayDiff, Assoc, DiffRecord, ItemDiff} from "./types";
import {
  assertDefined,
  consume,
  getOffset,
  matchItemDiff,
  matchRunes,
  objectKeys,
} from "./utils";

/** Merge two array diffs. */
export function mergeArrayDiffs(a: ArrayDiff, b: ArrayDiff): ArrayDiff {
  const [deltaA, itemDiffsA = [], ...tailA] = a;
  const [deltaB, itemDiffsB = [], ...tailB] = b;

  const delta = deltaA + deltaB;

  // combine item diffs
  const itemDiffs: ItemDiff[] = [];

  let iterA = 0;
  let iterB = 0;

  for (; iterA < itemDiffsA.length || iterB < itemDiffsB.length; ) {
    const itemA = itemDiffsA.at(iterA);
    const itemB = itemDiffsB.at(iterB);

    const offsetA = itemA ? getOffset(itemA[0]) : 0;
    const offsetB = itemB ? getOffset(itemB[0]) : 0;

    const newOffsetB = offsetB - deltaA;

    if (offsetA > newOffsetB) {
      assertDefined(itemA);
      // skip if deleted by b
      if (offsetA > -deltaB) {
        itemDiffs.push(itemA);
      }
      iterA++;
    } else if (newOffsetB > offsetA) {
      assertDefined(itemB);
      if (deltaA >= 0) {
        // adjust the tail of A
        if (offsetB <= tailA.length) {
          const tailOffset = tailA.length - offsetB;
          const valueA = tailA[tailOffset];

          matchItemDiff(itemB, {
            // set
            set(_, valueB) {
              tailA[tailOffset] = valueB;
            },
            // array
            array(_, valueB) {
              assertType<unknown[]>(valueA);
              tailA[tailOffset] = applyArrayDiff(valueA, valueB);
            },
            object(_, valueB) {
              assertType<Record<string, unknown>>(valueA);
              tailA[tailOffset] = applyDiff(valueA, valueB);
            },
          });
        } else {
          itemDiffs.push([newOffsetB, itemB[1]] as ItemDiff);
        }
      } else {
        itemDiffs.push([newOffsetB, itemB[1]] as ItemDiff);
      }

      iterB++;
    } else {
      assertDefined(itemA);
      assertDefined(itemB);
      // offsetA === newOffsetB
      matchItemDiff(itemA, {
        set(_, valueA) {
          matchItemDiff(itemB, {
            // change(a) * change(b) = change(b)
            set(_, valueB) {
              itemDiffs.push(changeItemDiff(offsetA, valueB));
            },
            // change(a) * array(b) = change(a*b)
            array(_, valueB) {
              assertType<unknown[]>(valueA);
              itemDiffs.push(
                changeItemDiff(offsetA, applyArrayDiff(valueA, valueB)),
              );
            },
            // change(a) * object(b) = change(a*b)
            object(_, valueB) {
              assertType<Assoc>(valueA);
              itemDiffs.push(
                changeItemDiff(offsetA, applyDiff(valueA, valueB)),
              );
            },
          });
        },
        array(_, valueA) {
          matchItemDiff(itemB, {
            // array(a) * change(b) = change(b)
            set(_, valueB) {
              itemDiffs.push(changeItemDiff(offsetA, valueB));
            },
            // array(a) * array(b) = array(a*b)
            array(_, valueB) {
              itemDiffs.push(
                arrayItemDiff(offsetA, mergeArrayDiffs(valueA, valueB)),
              );
            },
          });
        },
        object(_, valueA) {
          matchItemDiff(itemB, {
            // object(a) * change(b) = change(b)
            set(_, valueB) {
              itemDiffs.push(changeItemDiff(offsetA, valueB));
            },
            // object(a) * object(b) = object(a*b)
            object(_, valueB) {
              itemDiffs.push(
                objectItemDiff(offsetA, mergeDiffs(valueA, valueB)),
              );
            },
          });
        },
      });

      iterA++;
      iterB++;
    }
  }

  // needs to come afterwards since we modify tailA above
  const tail = [
    ...tailA.slice(0, tailA.length + Math.min(0, deltaB)),
    ...tailB,
  ];

  return [delta, itemDiffs, ...tail];
}

/** Merge two object diffs. */
export function mergeDiffs(a: DiffRecord, b: DiffRecord): DiffRecord {
  const ret: DiffRecord = {};

  for (const rKeyB of objectKeys(b)) {
    matchRunes(b, rKeyB, {
      // create
      add(key, valueB) {
        consume(a, key, {
          // delete * create(b) = set(b)
          delete() {
            Object.assign(ret, setDiff(key, valueB));
          },
          none() {
            Object.assign(ret, creationDiff(key, valueB));
          },
          else(name) {
            throw new Error(`Invalid merge: ${name}-add`);
          },
        });
      },
      // delete
      delete(key) {
        consume(a, key, {
          delete() {
            throw new Error("Invalid merge: delete-delete");
          },
        });
        Object.assign(ret, deletionDiff(key));
      },
      // set
      set(key, valueB) {
        consume(a, key, {
          // create * set(b) = create(b)
          add() {
            Object.assign(ret, creationDiff(key, valueB));
          },
          // invalid
          delete() {
            throw new Error("Invalid merge: delete-set");
          },
          // _ * set(b) = set(b)
          else() {
            Object.assign(ret, setDiff(key, valueB));
          },
          none() {
            Object.assign(ret, setDiff(key, valueB));
          },
        });
      },
      // array
      array(key, valueB) {
        consume(a, key, {
          // create(a) * array(b) = create(a*b)
          add(valueA) {
            assertType<unknown[]>(valueA);
            Object.assign(
              ret,
              creationDiff(key, applyArrayDiff(valueA, valueB)),
            );
          },
          // set(a) * array(b) = set(a*b)
          set(valueA) {
            assertType<unknown[]>(valueA);
            Object.assign(ret, setDiff(key, applyArrayDiff(valueA, valueB)));
          },
          else(name) {
            throw new Error(`Invalid merge: ${name}-array`);
          },
          array(valueA) {
            Object.assign(
              ret,
              updateArrayDiff(key, mergeArrayDiffs(valueA, valueB)),
            );
          },
          none() {
            Object.assign(ret, updateArrayDiff(key, valueB));
          },
        });
      },
      // object
      object(key, valueB) {
        consume(a, key, {
          // create(a) * object(b) = object(a*b)
          add(valueA) {
            assertType<Assoc>(valueA);
            Object.assign(ret, creationDiff(key, applyDiff(valueA, valueB)));
          },
          // set(a) * object(b) = set(a*b)
          set(valueA) {
            assertType<Assoc>(valueA);
            Object.assign(ret, setDiff(key, applyDiff(valueA, valueB)));
          },
          else(name) {
            throw new Error(`Invalid merge: ${name}-array`);
          },
          // object(a) * object(b) = object(a*b)
          object(valueA) {
            Object.assign(
              ret,
              updateObjectDiff(key, mergeDiffs(valueA, valueB)),
            );
          },
          none() {
            Object.assign(ret, updateObjectDiff(key, valueB));
          },
        });
      },
    });
  }

  // add anything remaining from a
  Object.assign(ret, a);

  return ret;
}
