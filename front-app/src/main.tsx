import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { initDarkMode } from "./hooks/useDarkMode";
import { initA11yPrefs } from "./hooks/useA11yPrefs";

// Apply saved/system preferences before first paint to prevent flash
initDarkMode();
initA11yPrefs();

// React Router Dom
import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";

// Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

import { AuthBootstrap } from "./api/authBootstrap";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
