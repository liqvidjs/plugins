import {replay} from "@liqvid/utils/animation";
import {between} from "@liqvid/utils/misc";
import {length, ReplayData} from "@liqvid/utils/replay-data";
import type {Playback} from "@lqv/playback";

/** Alignment string shortcut */
export type AlignmentString =
  "top left" | "top center" | "top right" |
  "center left" | "center" | "center center" | "center right" |
  "bottom left" | "bottom center" | "bottom right";

/**
 * Move an image along a recorder cursor path.
 */
export function cursorReplay(opts: {
  /**
   * Alignment point of image. Given by a pair [x, y] with `0 <= x, y <= 1`,
   * corresponding to the point (100x%, 100y%) of the way along the image. Also accepts
   * aliases "center" for [0.5, 0.5], "top right" for [0, 1], etc.
   * @default "center"
   * @returns An unsubscription function.
   */
  align?: AlignmentString | [x: number, y: number];

  /** Cursor data to replay. */
  data: ReplayData<[number, number]>;

  /** {@link Playback} to sync with. */
  playback: Playback;

  /**
   * When the cursor should first appear.
   * @default 0
   */
  start?: number;

  /**
   * When the cursor should disappear.
   * @default `start` + total duration of `data`
   */
  end?: number;

  /** Element to sync with */
  target: HTMLElement;
}): () => void {
  const {
    align = "center",
    data,
    target,
    start = 0,
    end = start + length(data),
    playback
  } = opts;
  const [alignX, alignY] = (typeof align === "string") ? parseAlignment(align) : align;

  // styles
  target.style.pointerEvents = "none";
  target.style.position = "absolute";

  // prevent FoUC
  const {hidden} = target;
  // if (between(start, playback.currentTime, end)) {
  //   target.hidden = true;
  // }

  /* measure image */
  let height: number, width: number;

  /* remeasure function */
  function remeasure(): void {
    const rect = target.getBoundingClientRect();
    height = rect.height;
    width = rect.width;
  }

  // resize observer
  const observer = new ResizeObserver(() => {
    remeasure();
    update(playback.currentTime);
  });
  observer.observe(target);

  // initialize height and width
  remeasure();
  
  /* remeasure image in case not loaded yet. Both of these calls are necessary due to possible switching of image */
  target.addEventListener("load", () => {
    // need to unhide and display:block to measure
    const {display} = target.style;
    target.hidden = false;
    target.style.display = "block";

    remeasure();

    target.style.display = display;
    target.hidden = hidden;
  });

  const update = replay({
    data,
    start,
    end,
    active: ([x, y]) => {
      Object.assign(target.style, {
        opacity: 1,
        left: `calc(${x}% - ${width * alignX}px)`,
        top: `calc(${y}% - ${height * alignY}px)`
      });
    },
    inactive: () => {
      target.style.opacity = "0";
    },
    compressed: true
  });

  const unsubscribeFromPlayback = subscribe(playback, update);

  return function unsubscribe() {
    unsubscribeFromPlayback();
    observer.unobserve(target);
  };
}

/**
 * Parse human-friendly alignment strings into percentage pairs.
 * @param align Alignment string like "top"
 */
function parseAlignment(align: AlignmentString): [number, number] {
  let x = 0, y = 0;

  if (align === "center") {
    return [0.5, 0.5];
  }

  const parts = align.split(" ");
  switch (parts[0]) {
    case "top":
      y = 0;
      break;
    case "center":
      y = 0.5;
      break;
    case "bottom":
      y = 1;
      break;
  }

  switch (parts[1]) {
    case "left":
      x = 0;
      break;
    case "center":
      x = 0.5;
      break;
    case "right":
      x = 1;
      break;
  }

  return [x, y];
}


/**
  * Synchronize with playback.
  * @param playback {@link Playback} to synchronize with.
  * @param update Callback function.
 */
 function subscribe(playback: Playback, update: (t: number) => void): () => void {
  // subscribe
  playback.on("seek", update);
  playback.on("timeupdate", update);

  update(playback.currentTime);

  // return unsubscription
  return () => {
    playback.off("seek", update);
    playback.off("timeupdate", update);
  };
}
