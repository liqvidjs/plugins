import {loadJSON} from "@liqvid/utils/json";
import {HTMLReplay} from "@lqv/codebooth/html";
import type {cmReplay} from "@lqv/codemirror";
import {files} from "../files";

declare module "@liqvid/utils/json" {
  interface GetJSONMap {
    code: Parameters<typeof cmReplay>[0]["data"];
  }
}

export function UI() {
  return (
    <HTMLReplay files={files} replay={loadJSON("code")}/>
  );
}
