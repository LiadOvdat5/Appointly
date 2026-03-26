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
import OnboardingPage from "../pages/OnboardingPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import PublicBusinessPage from "../pages/PublicBusinessPage.tsx";
import ScheduleEditorPage from "../pages/ScheduleEditorPage.tsx";

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
      { path: "business/:businessId", element: <PublicBusinessPage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "onboarding",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedule/:businessId/:serviceId",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ScheduleEditorPage />
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
