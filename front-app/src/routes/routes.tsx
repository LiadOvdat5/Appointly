import App from "../App.tsx";
import UIShowcase from "../pages/UIShowcase.tsx";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

// Pages
import LoginPage from "../pages/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import SelectionPage from "../pages/SelectionPage.tsx";
import BusinessOwnerLandingPage from "../pages/BusinessOwnerLandingPage.tsx";
import CustomerLandingPage from "../pages/CustomerLandingPage.tsx";
import { SearchPage } from "../pages/SearchPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SelectionPage /> },
      { path: "business-owner", element: <BusinessOwnerLandingPage /> },
      { path: "customer", element: <CustomerLandingPage /> },
      { path: "ui-showcase", element: <UIShowcase /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "not-found", element: <NotFoundPage /> },
      { path: "search", element: <SearchPage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
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
