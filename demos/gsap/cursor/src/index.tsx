import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

function importBuildTarget() {
  if (process.env.REACT_APP_MODE === "record") {
    return import("./@development/index.js");
  } else {
    return import("./@production/index.js");
  }
}

const root = createRoot(document.getElementById("root")!);
importBuildTarget().then(({ default: App }) => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
