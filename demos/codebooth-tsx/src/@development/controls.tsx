import {AudioRecording, RecordingControl, VideoRecording} from "@liqvid/recording";
import {CodeRecording} from "@lqv/codemirror/recording";

export default [<RecordingControl plugins={[AudioRecording, CodeRecording, VideoRecording]}/>];
