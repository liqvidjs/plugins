import {Audio, Playback, Player} from "liqvid";
import {render} from "react-dom";
import {UI} from "./ui";
import {MEDIA_URL} from "./media-url";

const playback = new Playback({duration: 220166});

function Lesson() {
  const thumbs = {
    frequency: 1,
    path: "./thumbs/%s.png"
  };

  return (
    <Player playback={playback} thumbs={thumbs}>
      <Audio>
        <source src={`${MEDIA_URL}/audio.mp4`} type="audio/mp4" />
        <source src={`${MEDIA_URL}/audio.webm`} type="audio/webm" />
      </Audio>
      <UI />
    </Player>
  );
}

render(<Lesson/>, document.querySelector("main"));
