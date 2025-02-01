import "./Record.css";

import { AudioRecorder, RecordingManager } from "@liqvid/recording";
import { length } from "@liqvid/utils/replay-data";
import { CodeRecorder } from "@lqv/codemirror/recording";
import { useCallback, useEffect, useState } from "react";

type CodingData = ReturnType<CodeRecorder["finalizeRecording"]>;
type RecordingData = {
  audio: Blob;
  coding: CodingData;
};

const manager = new RecordingManager();
const audioRecorder = new AudioRecorder();
audioRecorder.requestRecording();
export const codeRecorder = new CodeRecorder();

export function RecordingControl() {
  const [active, setActive] = useState(false);
  const [data, setData] = useState<RecordingData>();

  /* prevent CRA reload when recording */
  useEffect(() => {
    if (!data) {
      return;
    }
    const warn = (e: BeforeUnloadEvent) =>
      (e.returnValue = "You have recording data");
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [data]);

  const toggleRecording = useCallback(() => {
    if (active) {
      (manager.endRecording() as Promise<RecordingData>).then(
        (recordingData) => {
          setData(recordingData);
        },
      );
    } else {
      manager.beginRecording({
        audio: audioRecorder,
        coding: codeRecorder,
      });
    }
    setActive(!active);
  }, [active]);

  return (
    <div className="lqv-recording">
      <h2>Recording</h2>
      <button aria-pressed={active} onClick={toggleRecording}>
        <svg aria-hidden="true" viewBox="-2 -2 4 4">
          <circle fill={active ? "red" : "#aaa"} cx="0" cy="0" r="1" />
        </svg>
        Record
      </button>
      {data && (
        <output>
          <p>
            Duration: <code>{length(data.coding) / 1000}</code>
          </p>
          <p>
            Save this as <code>public/audio.webm</code>:
            <a download="audio.webm" href={URL.createObjectURL(data.audio)}>
              Download Audio
            </a>
          </p>
          <p>
            Copy this into <code>public/recordings.json</code>:
          </p>
          <textarea readOnly value={JSON.stringify(data.coding)} />
        </output>
      )}
    </div>
  );
}
