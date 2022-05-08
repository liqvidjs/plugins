import {loadJSON} from "@liqvid/utils/json";
import {PythonReplay} from "@lqv/codebooth/python";
import type {cmReplay} from "@lqv/codemirror";

declare module "@liqvid/utils/json" {
  interface GetJSONMap {
    code: Parameters<typeof cmReplay>[0]["data"];
  }
}

export function UI() {
  return (
    <PythonReplay replay={loadJSON("code")}/>
  );
}
