import {AudioRecording, RecordingControl, VideoRecording} from "@liqvid/recording";
import {CodeRecording} from "@lqv/codemirror/recording";
import {Playback, Player} from "liqvid";
import * as ReactDOM from "react-dom";
import {UI} from "./ui";

const controls = [<RecordingControl plugins={[AudioRecording, CodeRecording, VideoRecording]} />];

const playback = new Playback({duration: 30000}); // doesn't matter what duration we use when recording

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <UI />
    </Player>
  );
}

ReactDOM.render(<Lesson />, document.querySelector("main"));
