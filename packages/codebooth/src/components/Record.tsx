import {keymap} from "@codemirror/view";
import {passThrough} from "@lqv/codemirror/extensions";
import {CodeRecording} from "@lqv/codemirror/recording";
import {useKeymap} from "liqvid";
import {useEffect, useMemo} from "react";
import {recording} from "../extensions";
import {useBoothStore} from "../store";
import {Editor} from "./Editor";

/** Recording editor. */
export const Record: React.FC<{
  /**
   * Special key sequences to include in recording.
   * @default ["Mod-Enter", "Mod-L"]
   */
  captureKeys?: string[];

  /**
   * Key sequences to pass through to {@link Keymap}.
   * @default ["Mod-Alt-2", "Mod-Alt-3", "Mod-Alt-4"]
  */
  passKeys?: string[];
} & React.ComponentProps<typeof Editor>> = (props) => {
  const {
    captureKeys = ["Mod-Enter", "Mod-L"],
    extensions = [],
    passKeys = ["Mod-Alt-2", "Mod-Alt-3", "Mod-Alt-4"],
    ...attrs
  } = props;

  const useStore = useBoothStore();
  const lqvKeymap = useKeymap();

  const newExtensions = useMemo(() => [
    keymap.of(passThrough(lqvKeymap, passKeys)),
    ...(props.extensions ?? [])
  ], [passKeys]);

  // attach recording extensions --- this has to be done this way because
  // the `shortcuts` Compartment will abort further handling of the sequence
  useEffect(() => {
    const {view} = useStore.getState().groups[props.group].files.find(file => file.filename === props.filename);
    view.dispatch({
      effects: recording.reconfigure([
        recording.get(view.state),
        [CodeRecording.recorder.extension(captureKeys)]
      ])
    });
  }, []);

  return (
    <Editor content={props.content} extensions={newExtensions} {...attrs} />
  );
}
