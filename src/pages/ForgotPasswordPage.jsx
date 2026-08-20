import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, endpoints, unwrap } from "../api";
import BrandLogo from "../components/BrandLogo";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({ email: "", otp: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const patch = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setError(""); };

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setNotice("");
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid influencer email address.");
    try {
      setBusy(true);
      if (step === "email") {
        const data = unwrap(await api.post(endpoints.forgotPassword, { email }));
        setNotice(data?.message || "OTP sent to your registered email.");
        setStep("otp");
      } else if (step === "otp") {
        if (!/^\d{6}$/.test(form.otp)) throw new Error("Enter the complete 6-digit OTP.");
        await api.post(endpoints.verifyResetOtp, { email, otp: form.otp, purpose: "influencer_forgot_password" });
        setNotice("OTP verified. Create your new password.");
        setStep("password");
      } else {
        if (form.password.length < 8) throw new Error("Password must contain at least 8 characters.");
        if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
        await api.post(endpoints.resetPassword, { email, otp: form.otp, newPassword: form.password });
        setStep("done");
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || "Unable to complete password recovery.");
    } finally { setBusy(false); }
  };

  const resend = async () => {
    try { setBusy(true); await api.post(endpoints.forgotPassword, { email: form.email.trim().toLowerCase() }); setNotice("A new OTP was sent."); }
    catch (requestError) { setError(requestError?.response?.data?.message || "Unable to resend OTP."); }
    finally { setBusy(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-8">
    <div className="w-full max-w-[480px] rounded-2xl border border-[#e7e2d7] bg-white p-8 shadow-[0_18px_55px_rgba(31,27,95,0.10)]">
      <BrandLogo className="mb-7" logoClassName="text-[50px]" />
      {step === "done" ? <div className="text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={48} /><h1 className="mt-4 text-2xl font-bold text-[#211b62]">Password updated</h1><p className="mt-2 text-sm text-gray-500">Sign in with your new influencer password.</p><button onClick={() => navigate("/login")} className="mt-6 h-12 w-full rounded-xl bg-[#c28a13] font-semibold text-white">Return to login</button></div> : <form onSubmit={submit}>
        <h1 className="text-2xl font-bold text-[#211b62]">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-500">{step === "email" ? "We’ll send a verification OTP to your registered email." : step === "otp" ? `Enter the OTP sent to ${form.email}.` : "Choose a secure new password for your account."}</p>
        <div className="mt-6 space-y-4">
          {step === "email" && <label className="block text-sm font-semibold text-gray-700">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-3.5 text-gray-400" size={18} /><input autoFocus type="email" value={form.email} onChange={(e) => patch("email", e.target.value)} className="h-12 w-full rounded-xl border border-gray-300 pl-10 pr-3 outline-none focus:border-[#c28a13]" /></div></label>}
          {step === "otp" && <label className="block text-sm font-semibold text-gray-700">6-digit OTP<input autoFocus inputMode="numeric" maxLength={6} value={form.otp} onChange={(e) => patch("otp", e.target.value.replace(/\D/g, ""))} className="mt-2 h-12 w-full rounded-xl border border-gray-300 px-3 text-center text-xl tracking-[0.5em] outline-none focus:border-[#c28a13]" /></label>}
          {step === "password" && <><label className="block text-sm font-semibold text-gray-700">New password<div className="relative mt-2"><KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} /><input autoFocus type="password" minLength={8} maxLength={64} value={form.password} onChange={(e) => patch("password", e.target.value)} className="h-12 w-full rounded-xl border border-gray-300 pl-10 pr-3 outline-none focus:border-[#c28a13]" /></div></label><label className="block text-sm font-semibold text-gray-700">Confirm password<input type="password" minLength={8} maxLength={64} value={form.confirmPassword} onChange={(e) => patch("confirmPassword", e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-300 px-3 outline-none focus:border-[#c28a13]" /></label></>}
        </div>
        {notice && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">{notice}</div>}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        <button disabled={busy} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c28a13] font-semibold text-white disabled:opacity-60">{busy ? "Please wait…" : step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Reset password"}<ArrowRight size={17} /></button>
        {step === "otp" && <button type="button" disabled={busy} onClick={resend} className="mt-3 w-full text-xs font-semibold text-[#211b62]">Resend OTP</button>}
        <Link to="/login" className="mt-5 flex items-center justify-center gap-1 text-xs font-semibold text-gray-500"><ArrowLeft size={14} /> Back to login</Link>
      </form>}
    </div>
  </main>;
}
