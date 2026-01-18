import App from "../App.tsx";
import UIShowcase from "../pages/UIShowcase.tsx";
import { createBrowserRouter } from "react-router-dom";

// Pages
import LoginPage from "../pages/LoginPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "ui-showcase", element: <UIShowcase /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
]);

export default router;
