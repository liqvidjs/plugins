import {AudioRecording, RecordingControl} from "@liqvid/recording";
import {CursorRecording} from "@lqv/cursor/recording";
import {Playback, Player, usePlayer} from "liqvid";
import {useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Words} from "../words";

const controls = [<RecordingControl plugins={[AudioRecording, CursorRecording]} />];

const playback = new Playback({duration: 10000});

function Lesson() {
  return (
    <Player controls={controls} playback={playback}>
      <SetRecordingTarget/>
      <Words/>
    </Player>
  );
}

createRoot(document.querySelector("main")).render(<Lesson />);

function SetRecordingTarget() {
  const player = usePlayer();

  useEffect(() => {
    CursorRecording.recorder.target = player.canvas;
  }, []);

  return null;
}
