import {RecordingManager} from "@liqvid/recording";
import {CursorRecorder} from "@lqv/cursor/recording";
import {useCallback, useState} from "react";

type CursorData = ReturnType<CursorRecorder["finalizeRecording"]>;

const manager = new RecordingManager();
const recorder = new CursorRecorder();

export function RecordingControl() {
  const [active, setActive] = useState(false);
  const [data, setData] = useState<string>();

  const toggleRecording = useCallback(() => {
    if (active) {
      (manager.endRecording() as Promise<{cursor: CursorData}>).then(recordingData => {
        setData(JSON.stringify(recordingData.cursor));
      });
    } else {
      recorder.target = document.getElementById("targets")!;
      manager.beginRecording({cursor: recorder} as any);
    }
    setActive(!active);
  }, [active]);

  const label = active ? "Begin recording" : "End recording";

  return (
    <div className="recording">
      <p>
        <button aria-label={label} onClick={toggleRecording} title={label}>
          <svg viewBox="-2 -2 4 4">
            <circle fill={active ? "red" : "#aaa"} cx="0" cy="0" r="1" />
          </svg>
        </button>
        Press to start recording
      </p>
      {data && <>
        <p>Copy this into <code>recordings.json</code>:</p>
        <textarea readOnly value={data} />
      </>}
    </div>
  );
}
