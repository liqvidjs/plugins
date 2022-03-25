import {Extension, Text} from "@codemirror/state";
import {drawSelection, ViewPlugin} from "@codemirror/view";
import {cmReplay, fakeSelection} from "@lqv/codemirror";
import {usePlayback} from "liqvid";
import {useCallback, useMemo} from "react";
import {Store, useBoothStore} from "../store";
import {Editor} from "./Editor";

type ReplayParams = Parameters<typeof cmReplay>[0];

/**
 * Editor to replay recorded coding.
 */
export function Replay(props: {
  /**
   * Callback to handle special key sequences.
   * @param useStore The CodeBooth store.
   * @param key The key sequence that was pressed.
   * @param doc The CodeMirror document.
   */
  handle?: (useStore: Store, key: string, doc: Text) => void;

  /** Coding data to replay. */
  replay: ReplayParams["data"];

  /**
   * Time to start replaying.
   * @default 0
   */
  start?: number;
} & React.ComponentProps<typeof Editor>) {
  const useStore = useBoothStore();
  const playback = usePlayback();

  const {extensions = [], handle, replay, start, ...attrs} = props;

  const __handle = useCallback((key: string, doc: Text) => {
    if (handle) {
      handle(useStore, key, doc);
    }
  }, [handle]);

  const __extensions: Extension[] = useMemo(() => [
    ViewPlugin.define(fakeSelection(drawSelection())),
    ViewPlugin.define(view => {
      cmReplay({
        data: replay,
        handle: __handle,
        playback: playback,
        start: start ?? 0,
        view
      });
      return {};
    }),
    ...(extensions ?? [])
  ], [extensions, replay, start]);

  return <Editor editable={false} extensions={__extensions} {...attrs}/>;
}
