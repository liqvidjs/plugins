import {length, ReplayData} from "@liqvid/utils/replay-data";
import type {MediaElement, MediaElementEventMap} from "@lqv/playback";
import {PlaybackContext, useME} from "@lqv/playback/react";
import React, {useEffect, useRef, useState} from "react";
import {Sequence, useCurrentFrame, useVideoConfig} from "remotion";

/** Wrapper component for using Liqvid plugins in Remotion. */
export const Bridge: React.FC<{
  children?: React.ReactNode;
}> = (props) => {
  const playback = useRef<MediaElement>();
  if (!playback.current) {
    playback.current = new RemotionPlayback();
  }

  return (
    <PlaybackContext.Provider value={playback.current}>
      <Sync />
      {props.children}
    </PlaybackContext.Provider>
  );
};

/** {@link Sequence} with `durationInFrames` set from replay data */
export function ReplaySequence<T>(
  props: React.PropsWithChildren<{
    /** Recording data, or a Promise loading it. */
    data: Promise<ReplayData<T>> | ReplayData<T>;
  }> &
    React.ComponentProps<typeof Sequence>
): ReturnType<typeof Sequence> {
  const {fps} = useVideoConfig();
  const {data, ...attrs} = props;

  const [duration, setDuration] = useState(() => {
    if (data instanceof Promise) {
      data.then((data) => setDuration(Math.ceil((length(data) / 1000) * fps)));
    } else {
      return Math.ceil((length(data) / 1000) * fps);
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
  const playback = useME() as RemotionPlayback;

  const frame = useCurrentFrame();

  useEffect(() => {
    const time = frame / fps;
    playback.currentTime = time;
    playback.emit("timeupdate");
  }, [frame]);

  return null;
}

/* This doesn't completely implement MediaElement over Remotion, just enough
to get the @lqv/* plugins working. It's not hard to do this properly, but it
depends a bit on whether we're in `@remotion/player` or just `remotion`. */
class RemotionPlayback implements MediaElement {
  currentTime = 0;
  duration = Infinity;
  paused = false;
  muted = false;
  playbackRate = 1;
  seeking = false;
  volume = 1;

  private __listeners: Partial<Record<keyof MediaElementEventMap, (() => unknown)[]>>;

  constructor() {
    this.__listeners = {};
  }

  addEventListener<K extends keyof MediaElementEventMap>(type: K, listener: () => unknown): void {
    if (!this.__listeners.hasOwnProperty(type)) {
      this.__listeners[type] = [];
    }
    this.__listeners[type].push(listener);
  }

  removeEventListener<K extends keyof MediaElementEventMap>(
    type: K,
    listener: () => unknown
  ): void {
    if (!this.__listeners[type]) {
      return;
    }
    const index = this.__listeners[type].indexOf(listener);
    if (index !== -1) {
      this.__listeners[type].splice(index, 1);
    }
  }

  emit<K extends keyof MediaElementEventMap>(type: K): void {
    if (!this.__listeners[type]) {
      return;
    }
    for (const listener of this.__listeners[type]) {
      listener();
    }
  }

  pause(): void {
    throw new Error("Method not implemented.");
  }
  play(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
