import {applyDiff, objDiff} from "../src/plugin/diff";

describe("objDiff and applyDiff", () => {
  test("property deletion", () => {
    const a = {x: 1};
    const b = {};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"-x": 0});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("property additions", () => {
    const a = {};
    const b = {x: 1};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"+x": 1});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("property changes", () => {
    const a = {x: 1};
    const b = {x: 2};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"=x": 2});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("array appends", () => {
    const a = {x: [0, 1, 2]};
    const b = {x: [0, 1, 2, 3, 4]};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"[]x": [2, [], 3, 4]});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("array deletions", () => {
    const a = {x: [0, 1, 2]};
    const b = {x: [0]};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"[]x": [-2]});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("array changes", () => {
    const a = {x: [0, 1, 2]};
    const b = {x: [0, 3]};

    const diff = objDiff(a, b);

    expect(diff).toEqual({"[]x": [-1, [[1, 3]]]});
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("nested objects", () => {
    const a = {x: {fruit: "apple", color: "red"}};
    const b = {x: {fruit: "potato", kind: "mashed"}};

    const diff = objDiff(a, b);

    expect(diff).toEqual({
      "@x": {"=fruit": "potato", "+kind": "mashed", "-color": 0},
    });
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("objects nested in arrays", () => {
    const a = {
      shapes: {
        square: {
          segments: [{type: "free", points: [0, 1]}],
        },
      },
    };
    const b = {
      shapes: {
        square: {
          segments: [{type: "free", points: [0, 1, 2, 3]}],
        },
      },
    };

    const diff = objDiff(a, b);
    expect(diff).toEqual({
      "@shapes": {
        "@square": {
          "[]segments": [
            0,
            [
              [
                "@0",
                {
                  "[]points": [2, [], 2, 3],
                },
              ],
            ],
          ],
        },
      },
    });
    expect(applyDiff(a, diff)).toEqual(b);
  });

  test("kitchen sink", () => {
    const a = {
      x: 1,
      y: 2,
      z: 3,
      arr: [1, 2, 3],
      obj: {fruit: "apple", color: "red"},
    };
    const b = {
      x: 3,
      z: 3,
      w: 4,
      arr: [1, 5, 4, "x", "y"],
      obj: {fruit: "potato", kind: "mashed"},
    };

    const diff = objDiff(a, b);

    expect(diff).toEqual({
      "=x": 3,
      "-y": 0,
      "+w": 4,
      "[]arr": [
        2,
        [
          [1, 5],
          [2, 4],
        ],
        "x",
        "y",
      ],
      "@obj": {
        "=fruit": "potato",
        "+kind": "mashed",
        "-color": 0,
      },
    });
    expect(applyDiff(a, diff)).toEqual(b);
  });
});

describe("nested", () => {});
