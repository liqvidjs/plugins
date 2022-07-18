# @lqv/gsap

This package provides a compatibility layer for using [Liqvid plugins](https://liqvidjs.org/docs/plugins/recording) with [GSAP](https://greensock.com/gsap/). It exports a `<Bridge>` component which is used to sync up `@lqv/*` plugins with a GSAP [`Timeline`](https://greensock.com/docs/v3/GSAP/Timeline). This package should not be confused with [`@liqvid/gsap`](https://www.npmjs.com/package/@liqvid/gsap), which is for syncing GSAP animations up to Liqvid's timeline.

## Installation

```bash
npm install @lqv/gsap
```

## Usage

```tsx
import {Cursor} from "@lqv/cursor/react";
import {Bridge} from "@lqv/gsap";
import {gsap} from "gsap";

const tl = gsap.timeline({duration: 10, paused: true});

<Bridge timeline={tl}>
  <Cursor data={/* ... */} src="./cursor.svg" />
</Bridge>
```

See the [demos](https://github.com/liqvidjs/plugins/tree/main/demos/gsap) for more detailed examples.
