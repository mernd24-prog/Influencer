import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, endpoints, unwrap } from "../api";
import BrandLogo from "../components/BrandLogo";

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };
const normalizeInviteCode = (value = "") => {
  const trimmed = value.trim();
  try {
    return new URL(trimmed).searchParams.get("invite") || trimmed;
  } catch {
    return trimmed;
  }
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [inviteCode, setInviteCode] = useState(searchParams.get("invite") || "");
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const readQrImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      if (!("BarcodeDetector" in window)) {
        throw new Error("QR image reading is not supported by this browser. Scan the QR with your camera or paste the invitation link.");
      }
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(await createImageBitmap(file));
      const value = codes[0]?.rawValue;
      if (!value) throw new Error("No QR code was found in that image.");
      setInviteCode(normalizeInviteCode(value));
      setInvite(null);
    } catch (scanError) {
      setError(scanError.message || "Unable to read the QR image.");
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    const normalizedCode = normalizeInviteCode(inviteCode);
    if (!normalizedCode) return;
    let active = true;
    api.get(endpoints.registrationInvite(normalizedCode), { globalLoader: true })
      .then((response) => { if (active) setInvite(unwrap(response)); })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "This invitation is invalid or has been disabled.");
      });
    return () => { active = false; };
  }, [inviteCode]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = unwrap(await api.post(endpoints.register, { ...form, inviteCode: normalizeInviteCode(inviteCode) }));
      setSuccess(result?.message || "Registration submitted. Wait for Admin approval before logging in.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to submit registration.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass = "h-11 w-full rounded-lg border border-[#d9dbe3] bg-[#fcfcfd] px-3 text-sm outline-none focus:border-[#dca719] focus:ring-4 focus:ring-[#dca719]/10";

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8">
      <form onSubmit={submit} className="mx-auto w-full max-w-2xl rounded-2xl border border-[#e7e2d7] bg-white p-7 shadow-[0_18px_55px_rgba(31,27,95,0.10)]">
        <BrandLogo className="mb-6" />
        <h1 className="m-0 text-2xl font-bold text-[#211b62]">Brand Associate registration</h1>
        <p className="mt-2 text-sm text-[#6f7280]">Your account will be linked to the inviting partner and sent to Admin for approval.</p>

        <label className="mt-5 block text-xs font-semibold text-[#34313c]">Invitation code or scanned QR link</label>
        <input className={`${inputClass} mt-2`} value={inviteCode} onChange={(event) => { setInviteCode(event.target.value); setInvite(null); setError(""); }} required />
        <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#d9dbe3] px-3 py-2 text-xs font-semibold text-[#211b62] hover:bg-[#fffaf0]">
          Upload QR image
          <input className="hidden" type="file" accept="image/*" onChange={readQrImage} />
        </label>
        {invite?.parent && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Invited by <strong>{invite.parent.displayName}</strong>
            {invite.invitation?.nativeDeepLink && (
              <a className="ml-3 inline-flex font-semibold text-[#211b62] underline" href={invite.invitation.nativeDeepLink}>
                Open in app
              </a>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["firstName", "First name", "text"], ["lastName", "Last name", "text"],
            ["email", "Email", "email"], ["phone", "Phone", "tel"],
          ].map(([name, label, type]) => (
            <label key={name} className="text-xs font-semibold text-[#34313c]">
              {label}{name !== "lastName" && " *"}
              <input className={`${inputClass} mt-2`} name={name} type={type} value={form[name]} required={name !== "lastName"} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} />
            </label>
          ))}
          <label className="text-xs font-semibold text-[#34313c] sm:col-span-2">
            Password *
            <input className={`${inputClass} mt-2`} type="password" minLength={8} maxLength={64} value={form.password} required onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}
        {!success && <button className="mt-6 h-12 w-full rounded-xl border-0 bg-[#c28a13] font-semibold text-white disabled:opacity-60" disabled={busy || !invite} type="submit">{busy ? "Submitting..." : "Submit for Admin approval"}</button>}
        <p className="mt-5 text-center text-xs text-[#6f7280]"><Link to="/login" className="font-semibold text-[#211b62]">Back to login</Link></p>
      </form>
    </main>
  );
}
