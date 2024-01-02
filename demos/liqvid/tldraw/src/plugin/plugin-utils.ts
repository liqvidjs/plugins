import type {MediaElement} from "@lqv/playback";
import {ReplayData} from "liqvid";

export type Unsubscribe = () => void;

export type ReplayPluginProps<Data, Props> = Props & {
  /** Data to replay */
  data: ReplayData<Data>;

  /** {@link MediaElement} to sync with. */
  playback: MediaElement;

  /**
   * When replay should begin
   * @default 0
   */
  start?: number;

  /**
   * When replay should end
   * @default `start` + total duration of `data`
   */
  end?: number;
};

/**
 * Synchronize with playback.
 * @param playback {@link MediaElement} to synchronize with.
 * @param update Callback function.
 */
export function subscribe(
  playback: MediaElement,
  update: (t: number) => void,
): () => void {
  const callback = (): void => update(playback.currentTime);

  // subscribe
  playback.addEventListener("seeking", callback);
  playback.addEventListener("timeupdate", callback);

  callback();

  // return unsubscription
  return () => {
    playback.removeEventListener("seeking", callback);
    playback.removeEventListener("timeupdate", callback);
  };
}
