import {useME} from "@lqv/playback/react";
import {useEffect, useRef} from "react";

/**
 * <audio> element synced with MediaElement.
 */
export function Audio(props: React.PropsWithChildren<React.AudioHTMLAttributes<HTMLAudioElement>>): JSX.Element {
  const audio = useRef<HTMLAudioElement>();
  const playback = useME();

  useEffect(() => {
    function play() {
      audio.current?.play();
    }

    function pause() {
      audio.current?.pause();
    }

    function syncTime() {
      (audio.current as HTMLAudioElement).currentTime = playback.currentTime;
    }

    playback.addEventListener("pause", pause);
    playback.addEventListener("play", play);
    playback.addEventListener("seeking", syncTime);

    return () => {
      playback.removeEventListener("pause", pause);
      playback.removeEventListener("play", play);
      playback.removeEventListener("seeking", syncTime);
    }
  }, []);

  return <audio ref={audio} {...props}/>;
}