import {AudioRecording, RecordingControl} from "@liqvid/recording";
import {PythonRecord} from "@lqv/codebooth/python";
import {CodeRecording} from "@lqv/codemirror/recording";
import {Playback, Player} from "liqvid";
import {createRoot} from "react-dom/client";

const playback = new Playback({duration: 10000});
const controls = [<RecordingControl plugins={[AudioRecording, CodeRecording]} />];

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <PythonRecord />
    </Player>
  );
}

createRoot(document.querySelector("main")).render(<Lesson />);
