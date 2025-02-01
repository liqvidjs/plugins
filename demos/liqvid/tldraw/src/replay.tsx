import { Playback, Player } from "liqvid";
import { TldrawReplay } from "./plugin/react";
import recording from "./recording.json";

const playback = new Playback({ duration: 60000 });

export function Replay() {
  return (
    <Player playback={playback}>
      {/* <SetRecordingTarget/> */}
      <div
        data-affords="click"
        style={{
          position: "absolute",
          inset: 0,
          height: "var(--lv-canvas-height)",
        }}
      >
        <TldrawReplay replay={recording} />
      </div>
    </Player>
  );
}
