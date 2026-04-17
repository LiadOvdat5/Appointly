import "./languages/i18n";
import { useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { useRouteHeadingFocus } from "./hooks/useRouteHeadingFocus";
import { DemoDisclaimer } from "./components/DemoDisclaimer";

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === "true";

function App() {
  useRouteHeadingFocus();

  useEffect(() => {
    // TODO: Turn on the following line
    // i18n.changeLanguage(navigator.language);
  }, []);

  return (
    <>
      <AppShell />
      {IS_DEMO && <DemoDisclaimer />}
    </>
  );
}

export default App;
