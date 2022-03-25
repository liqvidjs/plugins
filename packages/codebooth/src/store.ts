import {EditorView} from "@codemirror/view";
import {createContext, useContext} from "react";
import create, {GetState, SetState, StoreApi, Mutate} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";

/** CodeBooth store state. */
export interface State {
  /**
   * Name of active group.
   */
  activeGroup: string;

  /** Group of files/editors. */
  groups: Record<string, {
    /** Name of active file. */
    activeFile: string;

    /** Files contained in this editor group. */
    files: {
      /** Whether the buffer can be edited by the viewer. */
      editable: boolean;

      /** File name. */
      filename: string;

      /** Reference to CodeMirror {@link EditorView} */
      view: EditorView;
    }[];
  }>;

  /** Get active files */
  getActiveFiles(): Record<string, string>;

  /** Console logs */
  messages: {
    classNames: string[];
    text: string;
  }[];

  /** Used to broadcast run events. */
  run: number;
}

export const createStore = (state: Partial<State> = {}) => create<
  State,
  SetState<State>,
  GetState<State>,
  Mutate<StoreApi<State>, [["zustand/subscribeWithSelector", never]]>
>(subscribeWithSelector((set, get) => ({
  // default values
  activeGroup: undefined,
  groups: {},
  getActiveFiles() {
    const {activeGroup, editors} = get();
    const files: Record<string, string> = {};
    for (const key in editors) {
      if (key.startsWith(`${activeGroup}:`)) {
        const filename = key.slice(`${activeGroup}:`.length);
        files[filename] = editors[key].state.doc.toString();
      }
    }
    return files;
  },
  messages: [],
  run: 0,
  ...state
})));

export type Store = ReturnType<typeof createStore>;

export const BoothStore = createContext<ReturnType<typeof createStore>>(null);

export function useBoothStore() {
  return useContext(BoothStore);
}

