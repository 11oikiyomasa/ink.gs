import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

function AppBootstrap() {
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    let active = true;
    import("./legacy-controller.js").catch((error) => {
      console.error("ink.gs controller failed to load:", error);
      if (active) setBootError(error);
    });
    return () => { active = false; };
  }, []);

  return (
    <>
      <App />
      {bootError ? (
        <div role="alert" className="react-boot-error">
          ink.gs could not initialize its interaction layer. Refresh the page to retry.
        </div>
      ) : null}
    </>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<AppBootstrap />);
} else {
  import("./legacy-controller.js");
}
