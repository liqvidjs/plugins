import "../src/codebooth.css";
import "../src/style.css";
import "../src/syntax.css";
import "./static.css";

import {python} from "@codemirror/lang-python";
import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, CodeBooth, Console, EditorPanel, Replay} from "@lqv/codebooth";
import {Bridge} from "@lqv/remotion";
import {Audio, Sequence, staticFile} from "remotion";

import {durationInFrames} from "../src/metadata";

// Chromium doesn't support mp4. If you're using actual Chrome,
// you may be able to use audio.mp4 instead.
// https://www.remotion.dev/docs/media-playback-error#codec-not-supported-by-chromium
import audio from "../public/audio.webm";
import {PythonRun} from "@lqv/codebooth/python";

const recordingData = fetch(staticFile("recordings.json")).then(res => res.json());

export const Demo: React.FC = () => {
	return (
		<div style={{flex: 1, backgroundColor: "white"}}>
			<Audio src={audio} />
			<Bridge>
				{/**
				 * we don't use {@link ReplaySequence} here because the code recording
				 * is shorter than the audio recording, and we want it to stay visible
				 * after the typing has stopped
				 */}
				<Sequence durationInFrames={durationInFrames} from={0} name="Coding">
					<CodeBooth>
						<EditorPanel filename="untitled.py">
							<Replay
								extensions={[python(), basicSetup, syntaxHighlighting(classHighlighter)]}
								replay={recordingData}
							/>
						</EditorPanel>
						<PythonRun />
						<Console />
					</CodeBooth>
				</Sequence>
			</Bridge>
		</div>
	);
};
