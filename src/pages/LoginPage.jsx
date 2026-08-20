import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { api, endpoints, tokens, unwrap } from "../api";
import BrandLogo from "../components/BrandLogo";
import { getZodFieldErrors, loginSchema, PASSWORD_MAX_LENGTH } from "../validation/schemas";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const result = loginSchema.safeParse(form);
    setErrors(result.success ? {} : getZodFieldErrors(result.error));
    return result.success;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setBusy(true);

    try {
      const data = unwrap(
        await api.post(endpoints.login, {
          email: form.email.trim(),
          password: form.password,
        }),
      );

      tokens.set(data.tokens || data);

      await onLogin();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-8 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#211b62]/10 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-36 -right-28 h-[420px] w-[420px] rounded-full bg-[#dca719]/15 blur-[110px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[220px] w-[520px] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      {/* Main Login Wrapper */}
      <div className="relative z-10 w-full max-w-[470px]">
        {/* Brand */}

        {/* Heading */}
        {/* <div className="mb-7 text-center">
          <h1 className="m-0 text-[38px] font-bold leading-tight tracking-[-0.025em] text-[#211b62] sm:text-[40px]">
            Welcome back!
          </h1>

          <p className="mx-auto mt-3 max-w-[410px] text-[14px] leading-6 text-[#6f7280]">
            Sign in to access your influencer dashboard and manage your
            referral network.
          </p>
        </div> */}

        {/* Form Card */}
        <form
          onSubmit={submit}
          noValidate
          className="relative overflow-hidden rounded-2xl border border-[#e7e2d7] bg-white px-7 py-7 shadow-[0_18px_55px_rgba(31,27,95,0.10)] sm:px-9 sm:py-8"
        >
          {/* Small top accent */}
          <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-[#211b62] via-[#dca719] to-[#211b62]" />
          <BrandLogo
            className="mb-8 gap-1.5"
            logoClassName="text-[56px]"
            titleClassName="mt-1 text-[22px]"
            subtitleClassName="text-[9px] uppercase tracking-[0.22em]"
          />
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-[13px] font-semibold text-[#34313c]"
            >
              Email Address <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              />

              <input
                id="email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                autoFocus
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className={`h-[50px] w-full rounded-xl border bg-[#fcfcfd] pl-11 pr-4 text-[13px] text-[#292731] outline-none transition-all duration-200 placeholder:text-[#a5a8b3] ${
                  errors.email
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100/70"
                    : "border-[#d9dbe3] hover:border-[#c7c2b5] focus:border-[#dca719] focus:bg-white focus:ring-4 focus:ring-[#dca719]/10"
                }`}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[13px] font-semibold text-[#34313c]"
            >
              Password <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`h-[50px] w-full rounded-xl border bg-[#fcfcfd] pl-11 pr-12 text-[13px] text-[#292731] outline-none transition-all duration-200 placeholder:text-[#a5a8b3] ${
                  errors.password
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100/70"
                    : "border-[#d9dbe3] hover:border-[#c7c2b5] focus:border-[#dca719] focus:bg-white focus:ring-4 focus:ring-[#dca719]/10"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#9ca3af] transition hover:bg-[#211b62]/5 hover:text-[#211b62]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password ? (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.password}
              </p>
            ) : (
              <div className="mt-2 flex items-center justify-end">
                <div className="flex items-center gap-1 text-[10px] font-medium text-[#7c7465]">
                  <ShieldCheck size={12} className="text-[#c89318]" />
                  Secure login
                </div>
              </div>
            )}
          </div>

          {/* API Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
              {error}
            </div>
          )}

          {/* Info Card */}

          {/* Login Button */}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border-0 bg-[#c28a13] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(33,27,98,0.18)] transition-all duration-200 hover:-translate-y-0.5 h hover:shadow-[0_10px_24px_rgba(33,27,98,0.22)] focus:outline-none focus:ring-4 focus:ring-[#211b62]/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                Login
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-[#9ca3af]">
          <ShieldCheck size={12} />
          <span>Secure access to your SAM GLOBAL account</span>
        </div>
      </div>
    </main>
  );
}
