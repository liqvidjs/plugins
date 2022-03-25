import {autocompletion, completionKeymap} from "@codemirror/autocomplete";
import {closeBrackets, closeBracketsKeymap} from "@codemirror/closebrackets";
import {defaultKeymap, indentWithTab} from "@codemirror/commands";
import {commentKeymap} from "@codemirror/comment";
import {foldGutter, foldKeymap} from "@codemirror/fold";
import {highlightActiveLineGutter, lineNumbers} from "@codemirror/gutter";
import {defaultHighlightStyle} from "@codemirror/highlight";
import {history, historyKeymap} from "@codemirror/history";
import {indentOnInput} from "@codemirror/language";
import {lintKeymap} from "@codemirror/lint";
import {bracketMatching} from "@codemirror/matchbrackets";
import {rectangularSelection} from "@codemirror/rectangular-selection";
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search";
import {Compartment, EditorState, Extension} from "@codemirror/state";
import {drawSelection, dropCursor, highlightSpecialChars, keymap} from "@codemirror/view";

export const basicSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  // highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    indentWithTab,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap
  ])
];

export const recording = new Compartment;
export const shortcuts = new Compartment;
