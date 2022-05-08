import {Extension, Text} from "@codemirror/state";
import {drawSelection, EditorView, ViewPlugin} from "@codemirror/view";
import {cmReplay, cmReplayMultiple, fakeSelection, selectCmd} from "@lqv/codemirror";
import {usePlayback} from "@lqv/playback/react";
import {useCallback, useEffect, useMemo} from "react";
import {Store, useBoothStore} from "../store";
import {Editor} from "./Editor";

type CodeData = Parameters<typeof cmReplay>[0]["data"];
type EventEmitter = Parameters<typeof cmReplay>[0]["playback"];

/**
 * Editor to replay recorded coding.
 */
export function Replay(props: {
  /**
   * Callback to handle special commands.
   * @param useStore The CodeBooth store.
   * @param cmd The command to handle.
   * @param doc The CodeMirror document.
   */
  handle?: (useStore: Store, cmd: string, doc: Text) => void;

  /** Coding data to replay. */
  replay?: CodeData | Promise<CodeData>;

  /**
   * Time to start replaying.
   * @default 0
   */
  start?: number;
} & React.ComponentProps<typeof Editor>) {
  const store = useBoothStore();
  const playback = usePlayback();

  const {extensions = [], handle, replay, start = 0, ...attrs} = props;

  const __handle = useCallback((cmd: string, doc: Text) => {
    if (cmd === "run") {
      // run command
      store.setState(state => ({run: state.run + 1}));
    } else if (cmd === "clear") {
      // clear console
      store.setState(() => ({messages: []}));
    }
    // userspace handler
    if (props.handle) {
      props.handle(store, cmd, doc);
    }
  }, [handle]);

  const __extensions: Extension[] = useMemo(() => [
    ViewPlugin.define(fakeSelection(drawSelection() as Extension[])),
    ViewPlugin.define(view => {
      if (replay) {
        if (replay instanceof Promise) {
          replay.then(data => cmReplay({data, handle: __handle, playback: playback as unknown as EventEmitter, start, view}));
        } else {
          cmReplay({data: replay, handle: __handle, playback: playback as unknown as EventEmitter, start, view});
        }
      }
      return {};
    }),
    ...extensions
  ], [extensions, replay, start]);

  return <Editor editable={false} extensions={__extensions} {...attrs} />;
}

/**
 * Replay coding to multiple editors.
 */
export const ReplayMultiple: React.FC<{
  /** Editor group to replay. */
  group?: string;

  /**
   * Callback to handle special commands.
   * @param store The CodeBooth store.
   * @param cmd The command to handle.
   * @param docs CodeMirror documents.
   */
  handle?: (store: Store, cmd: string, docs: Record<string, Text>) => void;

  /**
   * Coding data to replay.
   */
  replay: CodeData | Promise<CodeData>;

  /**
   * Time to start replaying.
   * @default 0
   */
  start?: number;
}> = (props) => {
  const playback = usePlayback();
  const store = useBoothStore();
  const {start = 0} = props;

  /* Handle callback */
  const handle = useCallback((cmd: string, docs: Record<string, Text>) => {
    // file selection change
    if (cmd.startsWith(selectCmd)) {
      store.setState(state => ({
        groups: {
          ...state.groups,
          [props.group]: {
            ...state.groups[props.group],
            activeFile: cmd.slice(selectCmd.length)
          }
        }
      }));
    } else if (cmd === "run") {
      // run command
      store.setState(state => ({run: state.run + 1}));
    } else if (cmd === "clear") {
      // clear console
      store.setState(() => ({messages: []}));
    }
    // userspace handler
    if (props.handle) {
      props.handle(store, cmd, docs);
    }
  }, [props.handle]);

  useEffect(() => {
    const state = store.getState();

    const views: Record<string, EditorView> = {};
    for (const file of state.groups[props.group].files) {
      views[file.filename] = file.view;
    }

    if (props.replay instanceof Promise) {
      props.replay.then(data =>
        cmReplayMultiple({data, handle, playback: playback as unknown as EventEmitter, start, views})
      );
    } else {
      cmReplayMultiple({data: props.replay, handle, playback: playback as unknown as EventEmitter, start, views});
    }
  }, []);
  return null;
};
