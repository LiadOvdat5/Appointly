import App from "../App.tsx";
import UIShowcase from "../pages/UIShowcase.tsx";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

// Pages
import LoginPage from "../pages/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from "../pages/LandingPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "ui-showcase", element: <UIShowcase /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "not-found", element: <NotFoundPage /> },
      {
        path: "login",
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "register",
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
