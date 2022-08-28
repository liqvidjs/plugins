import "./ScrubberBar.css";

import {useForceUpdate} from "@liqvid/utils/react";
import {useCallback, useEffect, useRef, useState} from "react";

export const ScrubberBar: React.FC<{
  timeline: GSAPTimeline;
}> = (props) => {
  const tl = props.timeline;
  const input = useRef<HTMLInputElement>(null);

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

  // fullscreen
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }, []);

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    document.addEventListener("fullscreenchange", forceUpdate);

    return () => {
      document.removeEventListener("fullscreenchange", forceUpdate);
    }
  }, []);

  /** Play timeline. */
  const play = useCallback(() => tl.play(null, false), [tl]);

  /** Pause timeline. */
  const pause = useCallback(() => tl.pause(), [tl]);

  return (
    <div id="scrubber">
      <button aria-label="Play" title="Play" onClick={play}>▶</button>
      <button aria-label="Pause" title="Pause" onClick={pause}>⏸</button>
      <input
        onChange={onChange} ref={input}
        type="range" min="0" max={tl.duration()} step="any" value={value} />
      <button
        aria-label="Fullscreen"
        title={document.fullscreenElement ? "Exit full screen" : "Full screen"}
        onClick={toggleFullscreen}
        >{document.fullscreenElement ? unFullscreenIcon : fullscreenIcon}</button>
    </div>
  );
};

const fullscreenIcon = <svg viewBox="0 0 36 36"><path fill="black" d="M 10 16 h 2 v -4 h 4 v -2 h -6 v 6 z"></path><path fill="black" d="M 20 10 v 2 h 4 v 4 h 2 v -6 h -6 z"></path><path fill="black" d="M 24 24 h -4 v 2 h 6 v -6 h -2 v 4 z"></path><path fill="black" d="M 12 20 h -2 v 6 h 6 v -2 h -4 v -4 z"></path></svg>;
const unFullscreenIcon = <svg viewBox="0 0 36 36"><path fill="black" d="M 14 14 h -4 v 2 h 6 v -6 h -2 v 4 z"></path><path fill="black" d="M 22 14 v -4 h -2 v 6 h 6 v -2 h -4 z"></path><path fill="black" d="M 20 26 h 2 v -4 h 4 v -2 h -6 v 6 z"></path><path fill="black" d="M 10 22 h 4 v 4 h 2 v -6 h -6 v 2 z"></path></svg>;
