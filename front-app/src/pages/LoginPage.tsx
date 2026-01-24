import { useState } from "react";
import { AxiosError } from "axios";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { login } from "../api/auth";
import { Alert } from "../components/UI/Alert";
import { useAppDispatch } from "../redux/hooks";
import { setSession } from "../redux/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  function toEpochMs(expiresAt: string) {
    const ms = new Date(expiresAt).getTime();
    return Number.isFinite(ms) ? ms : Date.now();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Login attempt:", { email, password });
    try {
      const session = await login({ email, password });

      //store JWT
      dispatch(
        setSession({
          user: session.user,
          expiresAt: toEpochMs(session.expiresAt),
        }),
      );

      setError("");

      // TODO: redirect to dashboard
      // navigate("/dashboard");
    } catch (err: unknown) {
      // Axios error handling
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        // Backend responded with 4xx / 5xx
        setError(error.response.data?.error ?? "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        {/* Header Text */}
        <div className="pt-4 pb-8 text-center">
          <H1>Welcome Back</H1>
          <Paragraph>Sign in to manage your appointments.</Paragraph>
        </div>
        {} {/* Error Message */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}
        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}

          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Field */}

          <div>
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            ></Input>

            <div className="flex justify-end mt-1">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Primary Action */}
          <Button type="submit" isLoading={loading}>
            Sign In
          </Button>
        </form>
        {/* Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <Paragraph className="bg-background-light dark:bg-background-dark px-2">
              Or continue with
            </Paragraph>
          </div>
        </div>
        {/* Social Actions */}
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => {
            return console.log("Google login");
          }}
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            ></path>
          </svg>
          Google
        </Button>
        {/* Footer */}
        <div className="mt-auto py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-bold text-primary hover:text-blue-600 transition-colors"
            >
              Register
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
