import type {Playback, PlaybackEvents} from "@lqv/playback";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

/** The actual `YT` object, not just what's exposed by {@link YT} */
interface ActualYT {
  loaded: number;
}

/**
 * Run callback once YouTube Iframe API is ready.
 * @param cb Callback to run.
 */
export function YouTubeAPIReady<T>(cb: () => T): T {
  if ((YT as unknown as ActualYT).loaded === 1) {
    return cb();
  }

  const old = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (old) {
      old();
    }
    cb();
  };
}

/** 
 * Sync a a YouTube video with playback.
 * @param playback 
 * @param player 
 * @returns An unsubscription function.
 */
export function syncYouTube({disablePointer = false, playback, player}: {
  /**
   * Disable pointer events when video is playing.s
   * @default false
   */
  disablePointer?: boolean;

  /** Playback to sync with. */
  playback: Playback;

  /** YouTube player to sync with. */
  player: YT.Player;
}): () => void {
  // unsubscriptions
  const unsubs: (() => void)[] = [];

  // we will disable click events on the iframe when it is playing
  const iframe = player.getIframe();

  /* sync with playback */
  // event handlers
  const events: Partial<Record<keyof PlaybackEvents, () => void>> = {
    pause: () => {
      if (disablePointer) player.pauseVideo();
      iframe.style.removeProperty("pointer-events");
    },
    play: () => {
      if (disablePointer) iframe.style.pointerEvents = "none";
      player.playVideo();
    },
    ratechange: () => player.setPlaybackRate(playback.playbackRate),
    seek: () => player.seekTo(playback.currentTime / 1000, true),
    seeked: () => {
      !playback.paused && player.playVideo();
    },
    seeking: () => player.pauseVideo(),
    volumechange: () => {
      playback.muted ? player.mute() : player.unMute();
      player.setVolume(100 * playback.volume);
    }
  };

  // subscribe/unsubscribe
  for (const key of Object.keys(events) as (keyof PlaybackEvents)[]) {
    playback.on(key, events[key]);
    unsubs.push(() => playback.off(key, events[key]));
  }

  /* initial sync */
  playback.muted ? player.mute() : player.unMute();
  player.setPlaybackRate(playback.playbackRate);
  player.setVolume(100 * playback.volume);

  /* destroy player on unmount */
  unsubs.push(() => player.destroy());

  /* return unsubscription function */
  return () => {
    for (const unsub of unsubs) {
      unsub();
    }
    unsubs.length = 0;
  };
}
