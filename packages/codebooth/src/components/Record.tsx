import {keymap} from "@codemirror/view";
import {passThrough} from "@lqv/codemirror/extensions";
import {CodeRecording} from "@lqv/codemirror/recording";
import {useKeymap} from "@liqvid/keymap/react";
import {useEffect, useMemo} from "react";
import {recording} from "../extensions";
import {useBoothStore} from "../store";
import {Editor} from "./Editor";

/** Recording editor. */
export const Record: React.FC<{
  /**
   * Special key sequences to include in recording.
   * @default {"Mod-Enter": run, "Mod-K": "clear", "Mod-L": "clear"}
   */
  captureKeys?: Record<string, string>;

  /**
   * Key sequences to pass through to {@link Keymap}.
   * @default ["Mod-Alt-2", "Mod-Alt-3", "Mod-Alt-4"]
  */
  passKeys?: string[];
} & React.ComponentProps<typeof Editor>> = (props) => {
  const {
    captureKeys = {
      "Mod-Enter": "run",
      "Mod-K": "clear",
      "Mod-L": "clear"
    },
    extensions = [],
    group = "default",
    passKeys = ["Mod-Alt-2", "Mod-Alt-3", "Mod-Alt-4"],
    ...attrs
  } = props;

  const store = useBoothStore();
  const lqvKeymap = useKeymap();
  
  const newExtensions = useMemo(() => lqvKeymap ? [
    keymap.of(passThrough(lqvKeymap, passKeys)),
    ...extensions
  ] : [], [passKeys]);

  // attach recording extensions --- this has to be done this way because
  // the `shortcuts` Compartment will abort further handling of the sequence
  useEffect(() => {
    const {view} = store.getState().groups[group].files.find(file => file.filename === props.filename);
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
};
