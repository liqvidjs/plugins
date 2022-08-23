import type {MediaElement} from "@lqv/playback";
import {PlaybackContext} from "@lqv/playback/react";
import type {gsap} from "gsap";
import {useRef} from "react";
import {EventEmitter} from "./EventEmitter";

// GSAP already provides this, but as a global type,
// which causes TS to complain about private names
type GSAPTimeline = ReturnType<typeof gsap.timeline>;

// /** Wrapper component for using Liqvid plugins in GSAP. */
export const Bridge: React.FC<
  React.PropsWithChildren<{
    timeline: GSAPTimeline;
  }>
> = (props) => {
  const playback = useRef<GSAPPlayback>();
  if (!playback.current || props.timeline !== playback.current.tl) {
    playback.current = new GSAPPlayback(props.timeline);
  }

  return (
    <PlaybackContext.Provider value={playback.current}>{props.children}</PlaybackContext.Provider>
  );
};

/** Fit GSAP to {@link MediaElement} interface. */
class GSAPPlayback extends EventEmitter implements MediaElement {
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
      this.emit("timeupdate");
      if (onUpdate) {
        onUpdate();
      }
    });
  }

  get currentTime(): number {
    return this.tl.time();
  }

  set currentTime(value: number) {
    this.tl.time(value, false);
    this.emit("seeking");
    this.emit("seeked");
  }

  get duration(): number {
    return this.tl.duration();
  }

  set duration(value: number) {
    throw new Error("Setting duration not implemented");
  }

  get paused(): boolean {
    return this.tl.paused();
  }

  set paused(value: boolean) {
    this.tl.paused(value);
  }

  pause(): void {
    this.tl.pause();
    this.emit("pause");
  }

  async play(): Promise<void> {
    this.tl.play(null, false);
    this.emit("play");
  }
}
