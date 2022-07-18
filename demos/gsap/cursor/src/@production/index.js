import {Cursor} from "@lqv/cursor/react";
import {Bridge} from "@lqv/gsap";
import {gsap} from "gsap";
import "../App.css";
import {Targets} from "../shared";
import {ScrubberBar} from "./ScrubberBar";

/** Timeline that we will use to control everything. */
const tl = gsap.timeline({duration: 10.608, paused: true});
const recordingData = fetch("./recordings.json").then(res => res.json());

function App() {
  return (
    <div className="App">
      <Targets>
        <Bridge timeline={tl}>
          <Cursor align="top left" data={recordingData} src="./cursor.svg" />
        </Bridge>
      </Targets>
      <ScrubberBar timeline={tl} />
    </div>
  );
}

export default App;
