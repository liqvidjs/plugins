import { ChangeSet, type Text } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { ReplayData } from "@liqvid/utils/replay-data";
import type { MediaElement } from "@lqv/playback";

import { FakeSelection, type Range } from "./fake-selection";
import type { ScrollAction } from "./recording";

export { fakeSelection, FakeSelectionConfig } from "./fake-selection";

/** Possible replay commands. */
export type Action =
  | ScrollAction
  | string
  | [changes: ChangeSet, selection?: [number, number]];

/** Reserved command for specifying file. */
export const selectCmd = "file:";

/** Reserved string for specifying scroll actions. */
export const scrollCmd = "s";

/** Key for the default view (in single-file mode). */
export const defaultViewName = "default";

/**
 * Replay typing in CodeMirror.
 * @returns Unsubscription function.
 */
export function cmReplay({
  data,
  handle,
  playback,
  scrollBehavior,
  didScroll,
  shouldScroll = () => true,
  start,
  view,
}: Omit<
  Parameters<typeof cmReplayMultiple>[0],
  "handle" | "shouldScroll" | "views"
> & {
  /**
   * Function for handling special commands.
   * @param cmd Command to handle.
   * @param doc CodeMirror document.
   */
  handle?: (cmd: string, doc: Text) => void;

  /**
   * Callback that gets called when the replay scrolls to a new position.
   * You can use this to try to distinguish user scroll events from programmatic ones.
   */
  didScroll?: (scrollToOptions: ScrollToOptions) => void;

  /**
   * Callback for determining whether to replay scrolling. You can have this
   * return `false` to relinquish scrolling control back to the viewer.
   * By default, always returns `true`, i.e. scrolls are always replayed.
   */
  shouldScroll?: () => boolean;

  /** CodeMirror instance to sync with. */
  view: EditorView;
}): () => void {
  return cmReplayMultiple({
    data: [[0, selectCmd + defaultViewName], ...data],
    handle: (key, docs) => handle(key, docs.default),
    playback,
    scrollBehavior,
    didScroll: (_filename, scrollToOptions) => {
      didScroll?.(scrollToOptions);
    },
    shouldScroll,
    start,
    views: {
      [defaultViewName]: view,
    },
  });
}

/**
 * Replay typing to several CodeMirror instances in parallel.
 * @returns Unsubscription function.
 */
export function cmReplayMultiple({
  data,
  didScroll,
  handle,
  playback,
  scrollBehavior = "auto",
  shouldScroll = () => true,
  start = 0,
  views,
}: {
  /** Recording data to replay. */
  data: ReplayData<Action>;

  /**
   * Function for handling special commands.
   * @param cmd Command to handle.
   * @param docs CodeMirror documents.
   */
  handle?: (cmd: string, docs: Record<string, Text>) => void;

  /**
   * Scroll behavior to pass to {@link Element.scrollTo}.
   * @default "auto"
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * Callback that gets called when the replay scrolls to a new position.
   * You can use this to try to distinguish user scroll events from programmatic ones.
   */
  didScroll?: (filename: string, scrollToOptions: ScrollToOptions) => void;

  /**
   * Callback for determining whether to replay scrolling for a given file.
   * You can have this return `false` to relinquish scrolling control back
   * to the viewer.
   * By default, always returns `true`, i.e. scrolls are always replayed.
   */
  shouldScroll?: (filename: string) => boolean;

  /** Playback to sync with. */
  playback: MediaElement;

  /**
   * Time *in seconds* playback should start.
   * @default 0
   */
  start?: number;

  /** CodeMirror instances to sync with. */
  views: Record<string, EditorView>;
}): () => void {
  /** Current file being replayed into */
  let file: string = undefined;

  // validation
  if (
    !(
      data.length > 0 &&
      data[0][0] === 0 &&
      typeof data[0][1] === "string" &&
      data[0][1].startsWith(selectCmd)
    )
  ) {
    throw new Error("First command must have time 0 and select the file");
  }

  // we're going to mess with data, clone it
  data = JSON.parse(JSON.stringify(data));

  /* unpackage */
  // decompress times
  const times = data.map((_) => _[0]);

  for (let i = 1; i < times.length; ++i) times[i] += times[i - 1];

  // deserialize changesets
  for (const [, action] of data) {
    // changeset
    if (Array.isArray(action) && Array.isArray(action[0])) {
      action[0] = ChangeSet.fromJSON(action[0]);
    }
  }

  // for scrolling in legacy recordings
  const hasScroll: Record<keyof typeof views, boolean> = {};
  for (const key in views) {
    hasScroll[key] = false;
  }

  // initialize inverses
  const inverses: Record<keyof typeof views, (ChangeSet | [number, number])[]> =
    {};
  const lastScroll: Record<keyof typeof views, [number, number]> = {};
  for (const key in views) {
    inverses[key] = [];
    lastScroll[key] = [0, 0];
  }

  // compute inverses
  {
    const docs: Record<keyof typeof views, Text> = {};
    for (const key in views) {
      docs[key] = views[key].state.doc;
    }

    for (let i = 0; i < data.length; ++i) {
      const action = data[i][1];

      if (Array.isArray(action)) {
        if (action[0] instanceof ChangeSet) {
          // editor change
          inverses[file][i] = action[0].invert(docs[file]);
          docs[file] = action[0].apply(docs[file]);
        } else if (action[0] === scrollCmd) {
          // scroll
          hasScroll[file] = true;
          inverses[file][i] = lastScroll[file];
          lastScroll[file] = [action[1], action[2] ?? 0];
        }
      } else if (action.startsWith(selectCmd)) {
        file = action.slice(selectCmd.length);
      }
    }
  }

  /* main logic */
  let index = 0;
  let lastTime = 0;

  const repaint = (): void => {
    const t = playback.currentTime;
    const progress = (t - start) * 1000;

    const changes: Record<string, ChangeSet> = {};
    for (const key in views) {
      changes[key] = ChangeSet.empty(views[key].state.doc.length);
    }

    const selections: Record<string, Range> = {};

    // apply / revert changes
    if (lastTime <= t && index < data.length) {
      // forward
      let i = index;
      for (; i < data.length && times[i] <= progress; ++i) {
        const action = data[i][1];

        if (typeof action === "string") {
          if (action.startsWith(selectCmd)) {
            file = action.slice(selectCmd.length);
          }
          // handle action
          const docs: Record<string, Text> = {};
          for (const key in views) {
            docs[key] = changes[key].apply(views[key].state.doc);
          }
          handle(action, docs);
        } else {
          if (action[0] === scrollCmd) {
            if (shouldScroll(file)) {
              // scroll
              const [, y, x = 0] = action;
              const fontSize = getFontSize(views[file]);
              if (!Number.isNaN(fontSize)) {
                const scrollToOptions = {
                  left: x * fontSize,
                  top: y * fontSize,
                  behavior: scrollBehavior,
                };
                views[file].scrollDOM.scrollTo(scrollToOptions);
                didScroll?.(file, scrollToOptions);
              }
            }
          } else {
            // editor change
            changes[file] = changes[file].compose(action[0]);

            // handle selection
            if (action[1]) {
              const [anchor, head] = action[1];
              selections[file] = { anchor, head };
            }
          }
        }
      }
      index = i;
    } else if (t < lastTime && 0 < index) {
      // revert
      let i = index - 1;
      for (; 0 <= i && progress < times[i]; --i) {
        if (inverses[file][i]) {
          const inverse = inverses[file][i];
          // editor change
          if (inverse instanceof ChangeSet) {
            changes[file] = changes[file].compose(
              inverses[file][i] as ChangeSet,
            );
          }
          // scroll
          else if (inverses[file][i].length === 2) {
            if (shouldScroll(file)) {
              const [y, x] = inverses[file][i] as [number, number];
              const fontSize = getFontSize(views[file]);
              if (!Number.isNaN(fontSize)) {
                const scrollToOptions = {
                  left: x * fontSize,
                  top: y * fontSize,
                  behavior: scrollBehavior,
                };
                views[file].scrollDOM.scrollTo(scrollToOptions);
                didScroll?.(file, scrollToOptions);
              }
            }
          }
        } else if (data[i][1] === selectCmd + file) {
          // find file to replay into
          for (let j = i - 1; 0 <= j; --j) {
            const action = data[j][1];
            if (typeof action === "string" && action.startsWith(selectCmd)) {
              file = action.slice(selectCmd.length);

              // XXX figure out how to handle more general actions
              handle(action, {});
              break;
            }
          }
        }
      }
      index = i + 1;
    }

    for (const key in views) {
      const effects = selections[key]
        ? [FakeSelection.of(selections[key])]
        : undefined;
      const view = views[key];

      view.dispatch(
        view.state.update({
          changes: changes[key],
          effects,
        }),
      );

      // scrolling for legacy recordings
      const scrollIntoView = !hasScroll[key] && shouldScroll(key);

      if (scrollIntoView) {
        // get position of last change
        let pos: number;
        changes[key].iterChangedRanges((_fromA, _toA, _fromB, toB) => {
          pos = toB;
        });

        // changes can be empty
        if (pos === undefined) {
          return;
        }

        const { scrollDOM } = view;
        const rect = scrollDOM.getBoundingClientRect();

        // it isn't possible to measure things that are offscreen
        const line = view.state.doc.lineAt(pos);
        const wordTop = view.defaultLineHeight * (line.number - 1);

        if (wordTop < scrollDOM.scrollTop) {
          const scrollToOptions = {
            behavior: scrollBehavior,
            top: wordTop,
          };
          scrollDOM.scrollTo(scrollToOptions);
          didScroll?.(key, scrollToOptions);
        } else if (wordTop > scrollDOM.scrollTop + rect.height) {
          const scrollToOptions = {
            behavior: scrollBehavior,
            top: wordTop - rect.height + view.defaultLineHeight,
          };
          scrollDOM.scrollTo(scrollToOptions);
          didScroll?.(key, scrollToOptions);
        }
      }
    }

    lastTime = t;
  };

  /* subscribe */
  playback.addEventListener("seeking", repaint);
  playback.addEventListener("timeupdate", repaint);

  return () => {
    playback.removeEventListener("seeking", repaint);
    playback.removeEventListener("timeupdate", repaint);
  };
}

/** Get the fontSize of a view's scrollDOM. */
function getFontSize(view: EditorView): number {
  return Number.parseFloat(getComputedStyle(view.scrollDOM).fontSize);
}
