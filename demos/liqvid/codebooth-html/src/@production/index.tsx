import {Playback, Player} from "liqvid";
import {render} from "react-dom";
// import {Face, FaceControl} from "./Face";
import {UI} from "./ui";

const playback = new Playback({duration: 347900});

function Lesson() {
  const thumbs = {
    frequency: 1,
    path: "./thumbs/%s.png"
  };

  return (
    <Player controls={[/*<FaceControl />*/]} playback={playback} thumbs={thumbs}>
      {/* <Face>
        <source src="./video.mp4" type="video/mp4" />
        <source src="./video.webm" type="video/webm" />
      </Face> */}
      <UI />
    </Player>
  );
}

render(<Lesson/>, document.querySelector("main"));
