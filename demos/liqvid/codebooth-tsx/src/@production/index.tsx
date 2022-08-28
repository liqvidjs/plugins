import {Audio, Playback, Player} from "liqvid";
import {createRoot} from "react-dom/client";
import {MEDIA_URL} from "./media-url";
import {UI} from "./ui";

const playback = new Playback({duration: 100.86 * 1000});

function Lesson() {
  const thumbs: React.ComponentProps<typeof Player>["thumbs"] = {
    frequency: 1,
    highlights: [
      {time: 34000, title: "Seconds counter"},
      {time: 65000, title: "Adding a button"}
    ],
    path: `${MEDIA_URL}/thumbs/%s.png`
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

createRoot(document.querySelector("main")).render(<Lesson />);
