import "../src/codebooth.css";
import "../src/style.css";
import "../src/syntax.css";
import "./static.css";

import {syntaxHighlighting} from "@codemirror/language";
import {classHighlighter} from "@lezer/highlight";
import {basicSetup, CodeBooth, Console, EditorGroup, EditorPanel, FileTabs, Replay, ReplayMultiple} from "@lqv/codebooth";
import {extensionFromFilename, HTMLPreview} from "@lqv/codebooth/html";
import {Bridge, ReplaySequence} from "@lqv/remotion";
import {Audio, Sequence, staticFile} from "remotion";

import {Popup} from "../src/components/Popup";
import {files} from "../src/files";

import audio from "../public/audio.mp4";
import {durationInFrames} from "../src/metadata";
const recordingData = fetch(staticFile("recordings.json")).then(res => res.json());

export const Demo: React.FC = () => {
	return (
		<div style={{flex: 1, backgroundColor: "white"}}>
			<Bridge>
				<Audio src={audio} />
				{/**
				 * we don't use {@link ReplaySequence} here because the code recording
				 * is shorter than the audio recording, and we want it to stay visible
				 * after the typing has stopped
				 */}
				<Sequence durationInFrames={durationInFrames} from={0} name="Coding">
					<CodeBooth>
						<section className="lqv-sidebar">
							<h2>Files</h2>
							<FileTabs />
						</section>

						<EditorGroup id="replay">
							{Object.keys(files).map((filename) => (
								<EditorPanel filename={filename} key={filename}>
									<Replay
										content={files[filename]}
										extensions={[
											basicSetup,
											extensionFromFilename(filename),
											syntaxHighlighting(classHighlighter)
										]}
									/>
								</EditorPanel>
							))}
							<ReplayMultiple replay={recordingData} start={0} />
						</EditorGroup>
						<Popup title="Preview">
							<HTMLPreview />
						</Popup>
						<Console />
					</CodeBooth>
				</Sequence>
			</Bridge>
		</div>
	);
};
