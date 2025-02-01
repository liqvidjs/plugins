import { Cursor } from "@lqv/cursor/react";
import { Bridge, ReplaySequence } from "@lqv/remotion";
import { staticFile } from "remotion";
import { Targets } from "../src/content";
import "../src/style.css";

const cursorImage = staticFile("cursor.svg");
const recordingData = fetch(staticFile("recordings.json")).then((res) =>
  res.json(),
);

export const Demo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: "white" }}>
      <Bridge>
        <Targets>
          <ReplaySequence data={recordingData} from={0}>
            <Cursor align="top left" data={recordingData} src={cursorImage} />
          </ReplaySequence>
        </Targets>
      </Bridge>
    </div>
  );
};
