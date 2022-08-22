import {createRoot} from "react-dom/client";

function importBuildTarget() {
  if (process.env.REACT_APP_MODE === "record") {
    return import("./@development/index.js");
  } else {
    return import("./@production/index.js");
  }
}

const root = createRoot(document.getElementById("root")!);
importBuildTarget().then(({default: App}) => {
  root.render(<App />);
});
