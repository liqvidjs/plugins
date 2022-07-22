import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

function importBuildTarget() { 
  if (process.env.RECORD_ENV === "record") { 
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
    </StrictMode>
  );
});
