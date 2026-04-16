import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Alert } from "../components/UI/Alert";
import { resetPassword } from "../api/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  // Token is missing — link is broken
  if (!token) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
        <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full pt-16">
          <Alert variant="error">
            This reset link is invalid or missing a token.{" "}
            <a href="/forgot-password" className="font-semibold underline">
              Request a new one
            </a>
            .
          </Alert>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setError("");

    if (newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setFieldError("Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, and a digit.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const msg = axiosErr.response?.data?.error ?? "Something went wrong. Please try again.";
      // Expired / invalid token — offer a link back
      const isExpired =
        msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid");
      setError(isExpired ? "__expired__" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        <div className="pt-4 pb-8 text-center">
          <H1>Set a new password</H1>
          <Paragraph>Choose a strong password for your Appointly account.</Paragraph>
        </div>

        {success && (
          <Alert variant="success">
            Password updated — you can now log in. Redirecting…
          </Alert>
        )}

        {!success && error === "__expired__" && (
          <Alert variant="error">
            This link has expired or is invalid.{" "}
            <a href="/forgot-password" className="font-semibold underline">
              Please request a new one
            </a>
            .
          </Alert>
        )}

        {!success && error !== "__expired__" && (
          <>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="New password"
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div>
                <Input
                  label="Confirm password"
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {fieldError && (
                  <p className="mt-1 text-sm text-red-500">{fieldError}</p>
                )}
              </div>
              <Button type="submit" isLoading={loading}>
                Update password
              </Button>
            </form>
          </>
        )}

        <div className="mt-8 py-8 text-center">
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:text-blue-600 transition-colors"
          >
            Back to login
          </a>
        </div>
      </main>
    </div>
  );
}
