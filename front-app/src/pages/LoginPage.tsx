import { useState, useRef, useEffect } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { login, googleAuth } from "../api/auth";
import { Alert } from "../components/UI/Alert";
import { useAppDispatch } from "../redux/hooks";
import { setSession } from "../redux/authSlice";
import { Role } from "../constants/roles";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleWrapperRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(400);

  useEffect(() => {
    const el = googleWrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setGoogleButtonWidth(el.offsetWidth));
    observer.observe(el);
    setGoogleButtonWidth(el.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function toEpochMs(expiresAt: string) {
    const ms = new Date(expiresAt).getTime();
    return Number.isFinite(ms) ? ms : Date.now();
  }

  function redirectAfterAuth(role: number, businessId?: string) {
    if (role === Role.Admin) {
      navigate("/admin");
    } else if (role === Role.Partner) {
      navigate(businessId ? "/" : "/customer-dashboard");
    } else if (role === Role.Owner) {
      navigate("/dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login({ email, password });

      dispatch(
        setSession({
          user: session.user,
          expiresAt: toEpochMs(session.expiresAt),
        }),
      );

      redirectAfterAuth(session.user.role, session.user.businessId);
    } catch (err: unknown) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      if (error.response) {
        setError(error.response.data?.error ?? t("login.error"));
      } else {
        setError(t("login.networkError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      // No role needed for login — backend finds existing user by GoogleId/email
      const session = await googleAuth({ idToken });
      dispatch(
        setSession({
          user: session.user,
          expiresAt: toEpochMs(session.expiresAt),
        }),
      );
      redirectAfterAuth(session.user.role, session.user.businessId);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error ?? t("login.error"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        {/* Header Text */}
        <div className="pt-4 pb-8 text-center">
          <H1>{t("login.title")}</H1>
          <Paragraph>{t("login.subtitle")}</Paragraph>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label={t("login.email")}
            id="email"
            type="email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <Input
              label={t("login.password")}
              id="password"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end mt-1">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <Button type="submit" isLoading={loading}>
            {t("login.button")}
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

        {/* Google Sign-In */}
        {googleLoading ? (
          <div className="flex justify-center">
            <Paragraph>Signing in with Google...</Paragraph>
          </div>
        ) : (
          <div ref={googleWrapperRef} className="w-full">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleSuccess(credentialResponse.credential);
                }
              }}
              onError={() => setError("Google sign-in failed. Please try again.")}
              text="signin_with"
              shape="rectangular"
              width={String(googleButtonWidth)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t("login.noAccount")}{" "}
            <a
              href="/register"
              className="font-bold text-primary hover:text-blue-600 transition-colors"
            >
              {t("login.signUp")}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
