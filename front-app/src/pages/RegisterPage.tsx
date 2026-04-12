import { useState } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { register, login, googleAuth } from "../api/auth";
import { Alert } from "../components/UI/Alert";
import { useAppDispatch } from "../redux/hooks";
import { setSession } from "../redux/authSlice";
import { Role } from "../constants/roles";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Google OAuth flow state
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  function toEpochMs(expiresAt: string) {
    const ms = new Date(expiresAt).getTime();
    return Number.isFinite(ms) ? ms : Date.now();
  }

  function redirectAfterAuth(role: number, businessId?: string) {
    if (role === Role.Admin) {
      navigate("/admin");
    } else if (role === Role.Partner && businessId) {
      navigate(`/staff-dashboard/${businessId}`);
    } else if (role === Role.Owner) {
      navigate("/onboarding");
    } else {
      navigate("/customer-dashboard");
    }
  }

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) errors.name = t("register.validation.nameRequired");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = t("register.validation.emailInvalid");
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errors.password = t("register.validation.passwordTooShort");
    if (password !== confirmPassword)
      errors.confirmPassword = t("register.validation.passwordMismatch");
    return errors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await register({ name, email, password });
      const session = await login({ email, password });

      dispatch(
        setSession({
          user: session.user,
          expiresAt: toEpochMs(session.expiresAt),
        }),
      );

      redirectAfterAuth(session.user.role, session.user.businessId);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string; title?: string }>;
      console.error("Registration error:", err);
      if (axiosErr.response) {
        setError(axiosErr.response.data?.error ?? t("register.error"));
      } else {
        setError(t("register.networkError"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Called when the user clicks Owner / Customer in the role-selection step
  const handleGoogleRoleSelect = async (selectedRole: number) => {
    if (!googleIdToken) return;
    setGoogleLoading(true);
    setError("");
    try {
      const session = await googleAuth({ idToken: googleIdToken, role: selectedRole });
      dispatch(
        setSession({
          user: session.user,
          expiresAt: toEpochMs(session.expiresAt),
        }),
      );
      redirectAfterAuth(session.user.role, session.user.businessId);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error ?? t("register.error"));
      setGoogleIdToken(null); // reset so user can retry
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        <div className="pt-4 pb-8 text-center">
          <H1>{t("register.title")}</H1>
          <Paragraph>{t("register.subtitle")}</Paragraph>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* ── Role-selection step (shown after Google popup resolves) ── */}
        {googleIdToken ? (
          <div className="flex flex-col gap-4">
            <Paragraph className="text-center font-medium">
              How will you use BizSlot?
            </Paragraph>
            <Button
              onClick={() => handleGoogleRoleSelect(Role.Owner)}
              isLoading={googleLoading}
            >
              I'm a Business Owner
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGoogleRoleSelect(Role.Client)}
              isLoading={googleLoading}
            >
              I'm a Customer
            </Button>
            <button
              className="text-sm text-slate-500 hover:text-slate-700 mt-2 underline"
              onClick={() => setGoogleIdToken(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label={t("register.name")}
                id="name"
                type="text"
                placeholder={t("register.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
              />

              <Input
                label={t("register.email")}
                id="email"
                type="email"
                placeholder={t("register.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
              />

              <Input
                label={t("register.password")}
                id="password"
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
              />

              <Input
                label={t("register.confirmPassword")}
                id="confirmPassword"
                type="password"
                placeholder={t("register.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
              />

              <Button type="submit" isLoading={loading}>
                {t("register.button")}
              </Button>
            </form>

            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <Paragraph className="bg-background-light dark:bg-background-dark px-2">
                  {t("register.orContinueWith")}
                </Paragraph>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    setError("");
                    setGoogleIdToken(credentialResponse.credential);
                  }
                }}
                onError={() => setError("Google sign-in failed. Please try again.")}
                text="signup_with"
                shape="rectangular"
                width="400"
              />
            </div>

            <div className="mt-8 py-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t("register.haveAccount")}{" "}
                <a
                  href="/login"
                  className="font-bold text-primary hover:text-blue-600 transition-colors"
                >
                  {t("register.signIn")}
                </a>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
