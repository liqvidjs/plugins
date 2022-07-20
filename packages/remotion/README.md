# @lqv/remotion

This package provides a compatibility layer for using [Liqvid plugins](https://liqvidjs.org/docs/plugins/recording) in [Remotion](https://www.remotion.dev/). It exports a `<Bridge>` component which is used to sync up `@lqv/*` plugins with Remotion.

## Installation

```bash
npm install @lqv/remotion
```

## Usage

```tsx
import {Cursor} from "@lqv/cursor/react";
import {Bridge} from "@lqv/remotion";
import {Player} from "@remotion/player";

function Component() {
  return (
    <Bridge>
      <Cursor data={/* ... */} src="./cursor.svg" />
    </Bridge>
  );
}

/* ... */

<Player component={Component}>/>
```

See the [demos](https://github.com/liqvidjs/plugins/tree/main/demos/remotion) for detailed examples.
