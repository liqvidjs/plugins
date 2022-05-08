import {RecordingControl, VideoRecording} from "@liqvid/recording";
import {PythonRecord} from "@lqv/codebooth/python";
import {CodeRecording} from "@lqv/codemirror/recording";
import {Playback, Player} from "liqvid";
import * as ReactDOM from "react-dom";

const playback = new Playback({duration: 10000});
const controls = [<RecordingControl plugins={[CodeRecording, VideoRecording]} />];

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <PythonRecord/>
    </Player>
  );
}

ReactDOM.render(<Lesson />, document.querySelector("main"));
