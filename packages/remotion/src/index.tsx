import {length, ReplayData} from "@liqvid/utils/replay-data";
import type {Playback} from "@lqv/playback";
import {PlaybackContext, usePlayback} from "@lqv/playback/react";
import {EventEmitter} from "events";
import React, {useRef, useState} from "react";
import {Sequence, useCurrentFrame, useVideoConfig} from "remotion";

/** Wrapper component for using Liqvid plugins in Remotion. */
export const Bridge: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const playback = useRef<Playback>();
  if (!playback.current) {
    playback.current = new RemotionPlayback() as unknown as Playback;
  }

  return (
    <PlaybackContext.Provider value={playback.current}>
      <Sync />
      {props.children}
    </PlaybackContext.Provider>
  );
};

/** {@link Sequence} with `durationInFrames` set from replay data */
export function ReplaySequence<T>(props: React.PropsWithChildren<{
  /** Recording data, or a Promise loading it. */
  data: ReplayData<T> | Promise<ReplayData<T>>;
}> & React.ComponentProps<typeof Sequence>) {
  const {fps} = useVideoConfig();
  const {data, ...attrs} = props;

  const [duration, setDuration] = useState(() => {
    if (data instanceof Promise) {
      data.then(data => setDuration(Math.ceil(length(data) / 1000 * fps)));
    } else {
      return Math.ceil(length(data) / 1000 * fps);
    }
  });
  if (duration) {
    return <Sequence durationInFrames={duration} {...attrs} />;
  }
  return null;
}

/** Sync with Remotion playback. */
function Sync(): null {
  const {fps} = useVideoConfig();
  const playback = usePlayback() as unknown as RemotionPlayback;
  const frame = useCurrentFrame();

  const time = frame / fps * 1000;
  playback.currentTime = time;
  playback.emit("timeupdate", time);

  return null;
}

class RemotionPlayback extends EventEmitter {
  currentTime = 0;
  duration = Infinity;
  paused = false;
  muted = false;
  playbackRate = 1;
  seeking = false;
  volume = 1;

  pause(): void {
    throw new Error("Method not implemented.");
  }
  play(): void {
    throw new Error("Method not implemented.");
  }
  seek(): void {
    throw new Error("Method not implemented.");
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }
}
