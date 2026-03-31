import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Alert } from "../components/UI/Alert";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import { setSession } from "../redux/authSlice";
import { getUser, updateUser } from "../api/user";

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectUser);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (!authUser?.id) return;
    getUser(authUser.id)
      .then((profile) => {
        setName(profile.name);
        setEmail(profile.email);
      })
      .catch(() => setLoadError(t("profile.error.loadFailed")));
  }, [authUser?.id, t]);

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) errors.name = t("profile.error.nameRequired");
    if (!email.trim()) errors.email = t("profile.error.emailRequired");

    const changingPassword = newPassword || currentPassword || confirmPassword;
    if (changingPassword) {
      if (!currentPassword) errors.currentPassword = t("profile.error.currentPasswordRequired");
      if (!newPassword) errors.newPassword = t("profile.error.newPasswordRequired");
      if (newPassword && newPassword.length < 6)
        errors.newPassword = t("profile.error.passwordTooShort");
      if (newPassword !== confirmPassword)
        errors.confirmPassword = t("profile.error.passwordMismatch");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!authUser?.id) return;

    setSaving(true);
    try {
      const payload: Parameters<typeof updateUser>[1] = {
        name,
        email,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const updated = await updateUser(authUser.id, payload);

      // Reflect name change in Redux session
      dispatch(
        setSession({
          user: { id: updated.id, name: updated.name, role: updated.role },
          expiresAt: Date.now() + 60 * 60 * 1000, // keep existing expiry; server manages the cookie
        }),
      );

      // Clear password fields after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSaveSuccess(t("profile.success.updated"));
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      if (axiosErr.response) {
        setSaveError(axiosErr.response.data?.error ?? t("profile.error.saveFailed"));
      } else {
        setSaveError(t("profile.error.networkError"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      <main className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full py-10">
        <div className="pb-6">
          <H1>{t("profile.myProfile")}</H1>
          <Paragraph>{t("profile.subtitle")}</Paragraph>
        </div>

        {loadError && (
          <Alert variant="error" className="mb-4">
            {loadError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert variant="success" className="mb-4">
            {saveSuccess}
          </Alert>
        )}

        {saveError && (
          <Alert variant="error" className="mb-4">
            {saveError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <Input
            label={t("profile.nameLabel")}
            id="name"
            type="text"
            placeholder={t("profile.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />

          {/* Email */}
          <Input
            label={t("profile.emailLabel")}
            id="email"
            type="email"
            placeholder={t("profile.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />

          {/* Password change section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              {t("profile.changePassword")}{" "}
              <span className="font-normal text-slate-400">{t("profile.changePasswordOptional")}</span>
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label={t("profile.currentPasswordLabel")}
                id="currentPassword"
                type="password"
                placeholder={t("profile.currentPasswordPlaceholder")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={fieldErrors.currentPassword}
              />

              <Input
                label={t("profile.newPasswordLabel")}
                id="newPassword"
                type="password"
                placeholder={t("profile.newPasswordPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={fieldErrors.newPassword}
              />

              <Input
                label={t("profile.confirmPasswordLabel")}
                id="confirmPassword"
                type="password"
                placeholder={t("profile.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
              />
            </div>
          </div>

          <Button type="submit" isLoading={saving}>
            {t("profile.saveChanges")}
          </Button>
        </form>
      </main>
    </div>
  );
}
