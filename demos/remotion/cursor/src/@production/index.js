import {Cursor} from "@lqv/cursor/react";
import {Bridge} from "@lqv/remotion";
import {Player} from "@remotion/player";
import {Targets} from "../content";
import {duration, fps} from "../metadata";
import "../style.css";

const recordingData = fetch("./recordings.json").then(res => res.json());

function App() {
  return (
    <Player
      component={Content}
      durationInFrames={Math.ceil(fps * duration)}
      compositionWidth={window.innerWidth}
      compositionHeight={window.innerHeight}
      fps={fps}
      style={{
        width: "100%"
      }}
      controls
    />
  );
}

export default App;

function Content() {
  return (
    <Bridge>
      <Targets>
        <Cursor align="top left" data={recordingData} src="./cursor.svg" />
      </Targets>
    </Bridge>
  );
}
