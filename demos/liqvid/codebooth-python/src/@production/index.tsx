import {Playback, Player} from "liqvid";
import {render} from "react-dom";
import {UI} from "./ui";

const playback = new Playback({duration: 347900});

function Lesson() {
  const thumbs = {
    frequency: 1,
    path: "./thumbs/%s.png"
  };

  return (
    <Player playback={playback} thumbs={thumbs}>
      <UI />
    </Player>
  );
}

render(<Lesson/>, document.querySelector("main"));
