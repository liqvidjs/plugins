import type {MediaElement} from "@lqv/playback";
import type {ReplayData} from "liqvid";

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
};

export function makeReplayPlugin<Datum, Props>({
  commit,
  computeInverses,
}: {
  commit: (event: Datum, props: Props) => void;
  computeInverses: (data: ReplayData<Datum>) => Datum[];
}): (options: ReplayPluginProps<Datum, Props>) => Unsubscribe {
  return ({data, playback, start = 0, ...props}) => {
    /** Array of times that events happen */
    const times = data.reduce(
      (acc, [duration]) => acc.concat((acc.at(-1) ?? 0) + duration),
      [] as number[],
    );

    /** Array of inverse operations */
    const inverses = computeInverses(data);

    /* main logic */
    let index = 0;
    let lastTime = 0;

    const update = (): void => {
      const t = playback.currentTime;
      const progress = (t - start) * 1000;

      // forward
      if (lastTime <= t && index < times.length) {
        let i = index;
        for (; i < data.length && times[i] <= progress; ++i) {
          commit(data[i][1], props as Props);
        }
        index = i;
      } else if (t < lastTime && 0 < index) {
        // backward
        let i = index - 1;
        for (; 0 <= i && progress < times[i]; --i) {
          commit(inverses[i], props as Props);
        }
        index = i + 1;
      }

      lastTime = t;
    };

    return subscribe(playback, update);
  };
}

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
