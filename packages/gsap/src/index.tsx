import type {Playback} from "@lqv/playback";
import {PlaybackContext} from "@lqv/playback/react";
import {EventEmitter} from "events";
import type {gsap} from "gsap";
import React, {useRef} from "react";

// GSAP already provides this, but as a global type,
// which causes TS to complain about private names
type GSAPTimeline = ReturnType<typeof gsap.timeline>;

// /** Wrapper component for using Liqvid plugins in GSAP. */
export const Bridge: React.FC<React.PropsWithChildren<{
  timeline: GSAPTimeline;
}>> = (props) => {
  const playback = useRef<Playback>();
  if (!playback.current) {
    playback.current = new GSAPPlayback(props.timeline) as unknown as Playback;
  }

  return (
    <PlaybackContext.Provider value={playback.current}>
      {props.children}
    </PlaybackContext.Provider>
  );
};

class GSAPPlayback extends EventEmitter {
  currentTime = 0;
  paused = false;
  muted = false;
  playbackRate = 1;
  seeking = false;
  volume = 1;

  constructor(
    /** GSAP {@link https://greensock.com/docs/v3/GSAP/Timeline Timeline} to sync with. */
    public tl: GSAPTimeline
  ) {
    super();

    // sync with GSAP
    const onUpdate = this.tl.eventCallback("onUpdate");
    this.tl.eventCallback("onUpdate", () => {
      const time = this.tl.time() * 1000;
      this.currentTime = time;
      this.emit("timeupdate", time);
      if (onUpdate) {
        onUpdate();
      }
    });
  }

  get duration() {
    return this.tl.duration() * 1000;
  }

  pause(): void {
    this.tl.pause();
  }

  play(): void {
    this.tl.play();
  }

  seek(t: number): void {
    this.tl.seek(t / 1000);
  }

  stop(): void {
    throw new Error("Method not implemented.");
  }
}
