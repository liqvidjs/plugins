import {AudioRecording, RecordingControl, VideoRecording} from "@liqvid/recording";
import {CursorRecording} from "@lqv/cursor/recording";
import {Playback, Player, usePlayer} from "liqvid";
import {useEffect} from "react";
import * as ReactDOM from "react-dom";
import {Words} from "../words";

const controls = [<RecordingControl plugins={[AudioRecording, CursorRecording, VideoRecording]} />];

const playback = new Playback({duration: 10000});

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <SetRecordingTarget/>
      <Words/>
    </Player>
  );
}

ReactDOM.render(<Lesson />, document.querySelector("main"));

function SetRecordingTarget() {
  const player = usePlayer();

  useEffect(() => {
    CursorRecording.recorder.target = player.canvas;
  }, []);

  return null;
}
