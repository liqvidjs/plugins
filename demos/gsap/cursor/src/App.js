import "./App.css";
import {gsap} from "gsap";
import {Cursor} from "@lqv/cursor/react";
import {Bridge} from "./bridge";
import {useCallback, useEffect, useState} from "react";

/** Timeline that we will use to control everything. */
const tl = gsap.timeline({duration: 10, paused: true});
const recordingData = fetch("./recordings.json").then(res => res.json());
window.gsap = gsap;

function App() {
  return (
    <div className="App">
        <span id="watch">Look, you can point at things</span>
        <svg id="targets" viewBox="-5 -2.5 10 5">
          <circle cx="-4" cy="2" r="0.03" fill="red" />
          <circle cx="-2" cy="-2" r="0.03" fill="blue" />
          <circle cx="0" cy="2" r="0.03" fill="green" />
          <circle cx="2" cy="-2" r="0.03" fill="purple" />
          <circle cx="4" cy="2" r="0.03" fill="pink" />
        </svg>
        <Bridge timeline={tl}>
          <Cursor data={recordingData} src="./cursor.svg" />
        </Bridge>
        <ScrubberBar timeline={tl} />
    </div>
  );
}

function ScrubberBar(props) {
  const tl = props.timeline;

  const [value, setValue] = useState(0);

  useEffect(() => {
    const onUpdate = tl.eventCallback("onUpdate");
    tl.eventCallback("onUpdate", () => {
      setValue(tl.time());
      if (onUpdate) {
        onUpdate();
      }
    });
  }, [tl]);
  
  const onChange = useCallback((e) => {
    const time = parseFloat(e.currentTarget.value);
    tl.seek(time, false);
    setValue(time);
  }, [tl]);

  /** Play timeline. */
  const play = useCallback(() => tl.play(null, false), [tl]);

  /** Pause timeline. */
  const pause = useCallback(() => tl.pause(), [tl]);

  return (
    <div id="scrubber">
      <button aria-label="Play" title="Play" onClick={play}>▶</button>
      <button aria-label="Pause" title="Pause" onClick={pause}>⏸</button>
      <input onChange={onChange} type="range" min="0" max={tl.duration()} step="any" value={value}/>
    </div>
  );
}

export default App;
