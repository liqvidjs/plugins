import type {KeyBinding} from "@codemirror/view";
import {Keymap} from "@liqvid/keymap";

/**
 * Handle key sequences in `seqs` even if key capture is suspended.
 * @param keymap {@link Keymap} to handle key sequences.
 * @param seqs Key sequences to handle.
*/
export function passThrough(keymap: Keymap, seqs: string[] = []): KeyBinding[] {
  return seqs.map(key => {
    const can = cm2lv(key);

    // argh
    const fake = new KeyboardEvent("keydown");

    return {
      key,
      run: () => {
        const handlers = keymap.getHandlers(can);
        for (const cb of handlers) {
          cb(fake);
        }
        return false;
      }
    } as KeyBinding;
  });
}

/**
Convert CodeMirror key sequences to Liqvid format.
**/
const mac = navigator.platform === "MacIntel";
function cm2lv(seq: string) {
  seq = seq.replace("Mod", mac ? "Meta" : "Ctrl");
  seq = seq.replace(/-/g, "+");
  return Keymap.normalize(seq);
}
