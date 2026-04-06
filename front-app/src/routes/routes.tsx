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
import ServiceSelectionPage from "../pages/ServiceSelectionPage.tsx";
import CustomerDashboardPage from "../pages/CustomerDashboardPage.tsx";
import CustomerDashboardOverviewPage from "../pages/CustomerDashboardOverviewPage.tsx";
import BusinessSchedulePage from "../pages/BusinessSchedulePage.tsx";
import PublicBusinessPage from "../pages/PublicBusinessPage.tsx";
import ScheduleEditorPage from "../pages/ScheduleEditorPage.tsx";
import BookingPage from "../pages/BookingPage.tsx";
import StaffPage from "../pages/StaffPage.tsx";
import ServiceEditPage from "../pages/ServiceEditPage.tsx";
import StaffDashboardPage from "../pages/StaffDashboardPage.tsx";
import InvitationsPage from "../pages/InvitationsPage.tsx";
import BusinessReviewsPage from "../pages/BusinessReviewsPage.tsx";
import BusinessNotificationSettingsPage from "../pages/BusinessNotificationSettingsPage.tsx";
import AdminCategoryRequestsPage from "../pages/AdminCategoryRequestsPage.tsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.tsx";
import { AdminRoute } from "./AdminRoute.tsx";
import { AdminLayout } from "../components/admin/AdminLayout.tsx";

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
      { path: "business/:slug", element: <PublicBusinessPage /> },
      {
        path: "book/:businessSlug/:serviceId",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <BookingPage />
          </ProtectedRoute>
        ),
      },
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
        path: "dashboard/:businessSlug",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/:businessSlug/services",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ServiceSelectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/:businessSlug/services/:serviceId/edit",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ServiceEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/:businessSlug/staff",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/:businessSlug/reviews",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <BusinessReviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/:businessSlug/notifications",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <BusinessNotificationSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "staff-dashboard/:businessId",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <StaffDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "staff-dashboard/:businessId/services",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <StaffDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "staff-dashboard/:businessId/appointments",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <StaffDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "invitations",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <InvitationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "customer-dashboard",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <CustomerDashboardOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/customer",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <CustomerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "business/:slug/schedule",
        element: (
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <BusinessSchedulePage />
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
        path: "admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "categories", element: <AdminCategoryRequestsPage /> },
        ],
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
