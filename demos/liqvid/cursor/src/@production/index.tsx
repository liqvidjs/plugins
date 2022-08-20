import {getJSON, loadAllJSON} from "@liqvid/utils/json";
import {Cursor} from "@lqv/cursor/react";
import {Playback, Player} from "liqvid";
import {useCallback, useState} from "react";
import {createRoot} from "react-dom/client";

import {Words} from "../words";

const playback = new Playback({duration: 15000});

// might use a static assets host
const MEDIA_URL = ".";

declare module "@liqvid/utils/json" {
  interface GetJSONMap {
    cursor: React.ComponentProps<typeof Cursor>["data"];
  }
}

const alignments = {
  crosshair: "center",
  pointer: "top left"
};

const srcs = {
  crosshair: "crosshair.png",
  pointer: "cursor.svg"
};

function Lesson() {
  const [cursor, setCursor] = useState("crosshair");
  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCursor(e.currentTarget.value);
  }, []);

  const thumbs = {
    frequency: 1,
    path: "./thumbs/%s.png"
  };

  return (
    <Player playback={playback} thumbs={thumbs}>
      <Cursor align={alignments[cursor]} data={getJSON("cursor")} src={`${MEDIA_URL}/${srcs[cursor]}`} start={0} end={15000} />
      <select onChange={onChange} value={cursor}>
        <option value="crosshair">Crosshair</option>
        <option value="pointer">Pointer</option>
      </select>
      <Words />
    </Player>
  );
}

loadAllJSON().then(() => void createRoot(document.querySelector("main")).render(<Lesson />));
