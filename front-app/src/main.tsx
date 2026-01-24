import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// React Router Dom
import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";

// Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

import { AuthBootstrap } from "./api/authBootstrap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </Provider>
  </StrictMode>,
);
