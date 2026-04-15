import "./languages/i18n";
import { useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { useRouteHeadingFocus } from "./hooks/useRouteHeadingFocus";

function App() {
  useRouteHeadingFocus();

  useEffect(() => {
    // TODO: Turn on the following line
    // i18n.changeLanguage(navigator.language);
  }, []);

  return <AppShell />;
}

export default App;
