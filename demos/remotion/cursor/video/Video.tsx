import {Composition} from "remotion";
import {duration, fps} from "../src/metadata";
import {Demo} from "./Demo";

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				id="Demo"
				component={Demo}
				durationInFrames={Math.ceil(fps * duration)}
				fps={fps}
				width={1920}
				height={1200}
			/>
		</>
	);
};
