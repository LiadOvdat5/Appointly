import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { H1, Paragraph } from "../components/UI/Typography";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Alert } from "../components/UI/Alert";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import { setSession } from "../redux/authSlice";
import { getUser, updateUser } from "../api/user";

export default function ProfilePage() {
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
      .catch(() => setLoadError("Failed to load profile. Please try again."));
  }, [authUser?.id]);

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";

    const changingPassword = newPassword || currentPassword || confirmPassword;
    if (changingPassword) {
      if (!currentPassword) errors.currentPassword = "Current password is required.";
      if (!newPassword) errors.newPassword = "New password is required.";
      if (newPassword && newPassword.length < 6)
        errors.newPassword = "Password must be at least 6 characters.";
      if (newPassword !== confirmPassword)
        errors.confirmPassword = "Passwords do not match.";
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

      setSaveSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      if (axiosErr.response) {
        setSaveError(axiosErr.response.data?.error ?? "Failed to save profile.");
      } else {
        setSaveError("Network error. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      <main className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full py-10">
        <div className="pb-6">
          <H1>My Profile</H1>
          <Paragraph>Update your name, email, or password.</Paragraph>
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
            label="Name"
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />

          {/* Email */}
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />

          {/* Password change section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Change Password{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={fieldErrors.currentPassword}
              />

              <Input
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={fieldErrors.newPassword}
              />

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
              />
            </div>
          </div>

          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </form>
      </main>
    </div>
  );
}
