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

  /** Group name for editor. You usually specify this on the parent {@link TabPanel} instead. */
  group?: string;
}) {
  const useStore = useBoothStore();
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    // get prefix (before we replace the DOM element)
    let prefix = "";
    if (ref.current.parentElement.getAttribute("role") === "tabpanel") {
      prefix = ref.current.parentElement.getAttribute("id").slice("panel-".length) + ":";
    }

    // create editor
    const view = new EditorView({
      state: EditorState.create({
        doc: props.content ?? "",
        extensions: [
          recording.of([]),
          shortcuts.of([]),
          ...(props.editable ? [EditorView.editable.of(false)] : []),
          ...(props.extensions ?? [])
        ]
      })
    });

    ref.current.replaceWith(view.dom);

    useStore.setState(prev => {
      const group = prev.groups[props.group] ?? {activeFile: props.filename, files: []};
      
      return {
        groups: {
          ...prev.groups,
          [props.group]: {
            activeFile: group.activeFile,
            files: [
              ...group.files,
              {
                editable: props.editable ?? true,
                filename: props.filename,
                view
              }
            ]
          }
        }
      };
    });
  }, []);

return (
  <div ref={ref} />
);
}
