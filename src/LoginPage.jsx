import { useState } from "react";
import { api, endpoints, tokens, unwrap } from "./api";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = unwrap(await api.post(endpoints.login, form));
      tokens.set(data.tokens || data);
      await onLogin();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to sign in.");
    } finally { setBusy(false); }
  };
  return <main className="login-shell"><form className="login-card" onSubmit={submit}>
    <div className="brand">SAM GLOBAL</div><h1>Influencer sign in</h1>
    <p>Track codes, orders, earnings and your referral network.</p>
    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
    <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
    {error && <div className="error">{error}</div>}
    <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
  </form></main>;
}
