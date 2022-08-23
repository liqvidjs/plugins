# Liqvid plugin suite

This is a monorepo for a suite of plugins for recording interactive videos. While these were built for [Liqvid](https://liqvidjs.org/), they are compatible with other animation libraries.

The easiest way to get started is to clone one of the demos.

## Demos

<table>
  <thead>
    <tr>
      <th>Plugin / Library</th>
      <th scope="col">Liqvid</th>
      <th scope="col">Remotion</th>
      <th scope="col">GSAP</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Cursor</th>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/liqvid/cursor">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/remotion/cursor">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/gsap/cursor">Demo</a>
      </td>
    </tr>
    <tr>
      <th>Code (HTML)</th>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/liqvid/codebooth-html">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/remotion/codebooth-html">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/gsap/codebooth-html">Demo</a>
      </td>
    </tr>
    <tr>
      <th>Code (Python)</th>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/liqvid/codebooth-python">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/remotion/codebooth-python">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/gsap/codebooth-python">Demo</a>
      </td>
      </td>
    </tr>
    <tr>
      <th>Code (TSX)</th>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/liqvid/codebooth-tsx">Demo</a>
      </td>
      <td>
        <a href="https://github.com/liqvidjs/plugins/tree/main/demos/remotion/codebooth-tsx">Demo</a>
      </td>
      <td>
        -
      </td>
    </tr>
  </tbody>
</table>

## Packages

### Recording plugins
* [`@lqv/cursor`](https://github.com/liqvidjs/plugins/tree/main/packages/cursor)  
  Plugin for recording cursor motion.

* [`@lqv/codebooth`](https://github.com/liqvidjs/plugins/tree/main/packages/codebooth)  
  Plugin for recording and replaying code tutorials. It is based on `@lqv/codemirror`.

* [`@lqv/codemirror`](https://github.com/liqvidjs/plugins/tree/main/packages/codemirror)  
  Low-level plugin for recording and replaying typing into a [CodeMirror](https://codemirror.net/6/docs/ref/) editor.

### Compatibility
* [`@lqv/gsap`](https://github.com/liqvidjs/plugins/tree/main/packages/gsap)  
  Provides a compatibility layer for using the plugins in [GSAP](https://greensock.com/gsap/).

* [`@lqv/playback`](https://github.com/liqvidjs/plugins/tree/main/packages/playback)  
  Interface that all other `@lqv/*` plugins rely on. I have proposed this for standardization: [(Synthetic)MediaElement proposal](https://github.com/whatwg/dom/issues/1098).

* [`@lqv/remotion`](https://github.com/liqvidjs/plugins/tree/main/packages/remotion)  
  Provides a compatibility layer for using the plugins in [Remotion](https://www.remotion.dev/).
