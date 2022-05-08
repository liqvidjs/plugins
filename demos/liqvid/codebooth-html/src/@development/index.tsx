import {RecordingControl, VideoRecording} from "@liqvid/recording";
import {CodeRecording} from "@lqv/codemirror/recording";
import {Playback, Player} from "liqvid";
import * as ReactDOM from "react-dom";
import {UI} from "./ui";

const playback = new Playback({duration: 10000});
const controls = [<RecordingControl plugins={[CodeRecording, VideoRecording]} />];

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <UI />
    </Player>
  );
}

ReactDOM.render(<Lesson />, document.querySelector("main"));
