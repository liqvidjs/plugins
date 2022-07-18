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
    </div>
  );
};
