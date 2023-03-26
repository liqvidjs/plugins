import {EditorState, Extension} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {useEffect, useRef} from "react";
import {recording, shortcuts} from "../extensions";
import {useBoothStore} from "../store";

/** CodeMirror editor. */
export function Editor(props: {
  /** Initial content for editor. */
  content?: string;

  /**
   * Whether the editor is editable or not.
   * @default true
   */
  editable?: boolean;

  /** CodeMirror {@link Extension}s to use in the editor. */
  extensions?: Extension[];

  /** Filename for the file being edited. */
  filename?: string;

  /**
   * Group name for editor. You usually specify this on the parent {@link EditorGroup} instead.
   * @default "default"
   */
  group?: string;
}) {
  const {editable = true, group: groupId = "default"} = props;
  const store = useBoothStore();

  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    // be idempotent
    const state = store.getState();
    if (state.groups[groupId]?.files.some((file) => file.filename === props.filename)) {
      return;
    }

    // create editor
    const view = new EditorView({
      state: EditorState.create({
        doc: props.content ?? "",
        extensions: [
          recording.of([]),
          shortcuts.of([]),
          ...(editable ? [] : [EditorView.editable.of(false)]),
          ...(props.extensions ?? []),
        ],
      }),
    });

    ref.current.replaceWith(view.dom);

    // insert into state
    store.setState((prev) => {
      const group = prev.groups[groupId] ?? {
        activeFile: props.filename,
        files: [],
      };

      return {
        activeGroup: prev.activeGroup || groupId,
        groups: {
          ...prev.groups,
          [groupId]: {
            activeFile: group.activeFile,
            files: [
              ...group.files,
              {
                editable,
                filename: props.filename,
                view,
              },
            ],
          },
        },
      };
    });
  }, []);

  return <div ref={ref} />;
}
