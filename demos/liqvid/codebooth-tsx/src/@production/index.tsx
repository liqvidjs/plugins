import {Audio, Playback, Player} from "liqvid";
import * as ReactDOM from "react-dom";
import {UI} from "./ui";

const playback = new Playback({duration: 100.86 * 1000});
console.log("asdf")

function Lesson() {
  const thumbs = {
    path: "./thumbs/%s.jpeg"
  };

  return (
    <Player playback={playback} thumbs={thumbs}>
      <Audio>
        <source src="./audio.mp4" type="audio/mp4" />
        <source src="./audio.webm" type="audio/webm" />
      </Audio>
      <UI />
    </Player>
  );
}

ReactDOM.render(<Lesson />, document.querySelector("main"));
