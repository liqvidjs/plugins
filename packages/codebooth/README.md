# @lqv/codebooth

This is a Liqvid-compatible plugin for recording and playing interactive coding tutorials. It is based on `@lqv/codemirror`.

## Exports

### `<Button>`

Div to hold buttons.

### `<Clear>`

Button for clearing the output/console.

### `<Console>`

Console for displaying log messages.

### `<FileTabs>`

File selector component.

### `<Preview>`

Preview of HTML document.

### `<Resize>`

Component for adjusting the vertical editor/console split.

### `<Run>`

Button for running the code.

### `useBoothStore()`

## Presets

### HTML

Import with `@lqv/codebooth/html`. Exports:

* `<HTMLDemo>`  
  For HTML demos not requiring replay functionality.
  
* `<HTMLRecord>`  
  For recording HTML content.
  
* `<HTMLReplay>`  
  For replaying HTML content.

### Node

Import with `@lqv/codebooth/node`. Exports:

* `<NodeDemo>`  
  For Node demos not requiring replay functionality.
  
* `<NodeRecord>`  
  For recording Node content.
  
* `<NodeReplay>`  
  For replaying Node content.

### Python

Import with `@lqv/codebooth/python`. Exports:

* `<PythonDemo>`  
  For Python demos not requiring replay functionality.
  
* `<PythonRecord>`  
  For recording Python content.
  
* `<PythonReplay>`  
  For replaying Python content.
