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

export function makeReplayPlugin<Datum, State, Action, Props>({
  apply,
  blankState,
  commit,
  decompress,
  invert,
  merge,
}: {
  /** Apply an action to a state. */
  apply: (state: State, action: Action) => State;

  /**
   * Get a default state. This is not the _initial_ state:
   * that will be computed by applying duration-0 actions
   * at the beginning of the recording to this. */
  blankState: () => State;

  /** Commit an action. */
  commit: (action: Action, props: Props, world: World) => void;

  /** Decompress an action. */
  decompress: (data: Datum) => Action;

  /** Invert an action with respect to a state. */
  invert: (state: State, action: Action) => Action;

  /** Merge two actions. */
  merge: (...actions: Action[]) => Action;
}): (options: ReplayPluginProps<Datum, Props>) => Unsubscribe {
  return ({data, playback, start = 0, ..._props}) => {
    /** Array of times that events happen */
    const times = data.reduce(
      (acc, [duration]) => acc.concat((acc.at(-1) ?? 0) + duration),
      [] as number[],
    );

    /** Uncompressed actions */
    const actions: Action[] = data.map(([_, event]) => decompress(event));

    let state = blankState();
    const props = _props as unknown as Props;

    if (false) {
      /** Initialization events */
      const initEvents: InitialDatum[] = [];

      /** Index of first non-initialization datum */
      let firstEventIndex = 0;
      for (; firstEventIndex < data.length; ++firstEventIndex) {
        const [time, event] = data[firstEventIndex];
        if (time !== 0) {
          break;
        }
        initEvents.push(event as unknown as InitialDatum);
      }
    }
    // const events = data.slice(firstEventIndex);

    /** Array of inverse operations */
    const inverses: Action[] = [];
    for (const action of actions) {
      inverses.push(invert(state, action));
      state = apply(state, action);
    }

    /* main logic */
    // let index = firstEventIndex;
    let index = 0;
    let lastTime = 0;

    const update = (): void => {
      const t = playback.currentTime;
      const progress = (t - start) * 1000;

      // if (progress <= 0) {
      //   console.log("initializing");
      //   initialize?.(initEvents, props);
      //   index = firstEventIndex;
      //   lastTime = t;
      //   return;
      // }
      const actionsToApply: Action[] = [];

      // forward
      if (lastTime <= t && index < times.length) {
        let i = index;
        for (; i < data.length && times[i] <= progress; ++i) {
          actionsToApply.push(actions[i]);
        }
        index = i;
      } else if (t < lastTime && 0 < index) {
        // backward
        let i = index - 1;
        for (; 0 <= i && progress < times[i]; --i) {
          actionsToApply.push(inverses[i]);
        }
        index = i + 1;
      }

      if (actionsToApply.length > 0) {
        const action = merge(...actionsToApply);
        state = apply(state, action);
        commit(action, props);
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
