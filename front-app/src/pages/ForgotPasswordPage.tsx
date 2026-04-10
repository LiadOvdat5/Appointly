import { useState } from "react";
import { AxiosError } from "axios";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Alert } from "../components/UI/Alert";
import { forgotPassword } from "../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        <div className="pt-4 pb-8 text-center">
          <H1>Forgot Password</H1>
          <Paragraph>Enter your email and we'll send you a reset link.</Paragraph>
        </div>

        {submitted ? (
          <Alert variant="success">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" isLoading={loading}>
                Send reset link
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
