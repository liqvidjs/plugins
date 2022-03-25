import {useEffect, useRef} from "react";
import {State, useBoothStore} from "../store";

/** Preview of HTML document */
export function Preview() {
  const useStore = useBoothStore();

  /** <iframe> containing preview document */
  const iframe = useRef<HTMLIFrameElement>();

  /* initial render */
  useEffect(() => {
    return;
    /* re-render */
    function render() {
      const {openFiles} = useStore.getState();
      const indexHtml = openFiles.find(file => file.filename === "index.html");
      if (!indexHtml) {
        return;
      }
      iframe.current.srcdoc = transform(indexHtml.content, openFiles);
    }

    // initial render
    render();

    const {openFiles} = useStore.getState();

    /* subscriptions */
    const desubs: (() => void)[] = [];

    for (const file of openFiles) {
      if (file.type === "css") {
        // "livereload" for CSS changes
        desubs.push(useStore.subscribe(content => {
          iframe.current.contentWindow.postMessage({
            type: "update-css",
            filename: file.filename,
            content
          }, "*");
        }, state => state.openFiles.find(_ => _.filename === file.filename).content));
      } else {
        desubs.push(useStore.subscribe(render, state => state.openFiles.find(_ => _.filename === file.filename).content));
      }
    }

    return () => {
      for (const desub of desubs) {
        desub();
      }
      desubs.length = 0;
    };
  }, []);

  return (
    <iframe className="lqv-preview" ref={iframe} sandbox="allow-scripts"/>
  );
}

/**
 * Inlines scripts and stylesheets in HTML code
 * @param html HTML code to transform
 * @param openFiles Array of files to choose from
 * @returns Transformed html code
 */
function transform(html: string, openFiles: State["openFiles"]) {
  // transform <script>s
  html = html.replace(/<script\s*src=(['"])([^\1]+?\.js)\1\s*><\/script>/gi, (match, q, src) => {
    const script = openFiles.find(file => file.filename === src);
    if (script) {
      return "<script>" + script.content + "</script>";
    }
    return match;
  });

  // transform <link>s
  html = html.replace(/<link([^>]+?)>/gi, (match, attrs) => {
    const $_ = attrs.match(/href=(['"])([^\1]+?\.css)\1/);
    if ($_) {
      const href = $_[2];
      const style = openFiles.find(file => file.filename === href);
      if (style) {
        return `<style data-filename="${href}">` + style.content + "</style>";
      }
      return match;
    }
    return match;
  });

  // magic scripts
  html = html.replace("<head>", "<head>" + magicScripts);

  // return
  return html;
}

/** Iframe client code for development magic */
const magicScripts = String.raw`<script>
/* update CSS without reloading */
window.addEventListener("message", ({data}) => {
  if (data.type === "update-css") {
    document.querySelector("style[data-filename='" + data.filename + "']").textContent = data.content;
  }
});

/* intercept console.log */
{
  const log = console.log;
  console.log = function(...args) {
    window.parent.postMessage({
      type: "console.log",
      content: args.map(arg => {
        if (typeof arg === "object") {
          return JSON.stringify(arg);
        }
        return arg.toString();
      }).join("\n")
    }, "*");
    log(...args);
  }

  const clear = console.clear;
  console.clear = function() {
    window.parent.postMessage({
      type: "console.clear"
    }, "*");
    clear();
  }
}
</script>`;
