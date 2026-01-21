import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        {/* Header Text */}
        <div className="pt-4 pb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
            Sign in to manage your appointments.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-normal text-slate-900 dark:text-slate-100"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 h-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-normal text-slate-900 dark:text-slate-100"
            >
              Password
            </label>
            <div className="relative flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent border-none px-4 h-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "24px" }}
                >
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
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
          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary h-12 px-5 text-base font-bold text-white shadow-sm hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
            <span className="sr-only">Sign in with Google</span>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg
              className="h-5 w-5 text-current"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.6 0 2.72.16 3.94 1.7a3.8 3.8 0 0 0-2.3 3.36c-.05 2.92 2.62 4.02 2.72 4.08-.2.72-.48 1.44-.83 2.13-.6 1.19-1.33 2.45-2.18 2.19zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
            </svg>
            <span className="sr-only">Sign in with Apple</span>
            Apple
          </button>
        </div>

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
};

export default RegisterPage;
