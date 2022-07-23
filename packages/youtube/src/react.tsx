import {usePlayback} from "@lqv/playback/react";
import {forwardRef, useEffect, useRef} from "react";
import {syncYouTube, YouTubeAPIReady} from "./index";

/**
 * Embed a YouTube video synced with playback. Forwards a ref to the {@link YT.Player} object.
 */
export const YouTube = forwardRef<YT.Player, Pick<YT.PlayerOptions, "playerVars" | "videoId"> & {
  /**
   * Time in **seconds** this video should start playing.
   * @default 0
   */
  start?: number;
}>(function YouTube(props, playerRef) {
  const playback = usePlayback();
  const div = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    // unsubscriptions
    const unsubs: (() => void)[] = [];

    YouTubeAPIReady(() => {
      // create YT player
      const player = new YT.Player(div.current, {
        events: {
          onReady: () => {
            unsubs.push(syncYouTube({disablePointer: true, playback, player}));
          }
        },
        playerVars: {
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          origin: location.origin,
          playsinline: 1,
          rel: 0,
          ...(props.playerVars || {})
        },
        videoId: props.videoId
      });

      // ref
      if (typeof playerRef === "function") {
        playerRef(player);
      } else if ("current" in playerRef) {
        playerRef.current = player;
      }
    });

    // unsubscribe
    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
    };
  }, [props.videoId]);

  return (
    <div ref={div} />
  );
});
