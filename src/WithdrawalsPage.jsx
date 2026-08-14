import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, RefreshCw, Send, UploadCloud, WalletCards } from "lucide-react";
import { api, endpoints, unwrap } from "./api";

const number = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0));
const money = (value) => `₹${number(value)}`;
const words = (value) => String(value || "—").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const date = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const payoutStatusLabel = (status) => ({
  pending: "Pending Admin Review",
  approved: "Approved — Awaiting Transfer",
  processing: "Transfer In Progress",
  paid: "Paid",
  rejected: "Rejected",
  failed: "Transfer Failed",
  cancelled: "Cancelled",
}[status] || words(status));

export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState({});
  const [profile, setProfile] = useState({});
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ amount: "", destination: "saved_upi", upiId: "", payoutQrUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [walletResponse, listResponse, profileResponse] = await Promise.all([
        api.get(endpoints.wallet),
        api.get(endpoints.withdrawals, { params: { page: 1, limit: 50 } }),
        api.get(endpoints.profile),
      ]);
      setWallet(unwrap(walletResponse) || {});
      setRows(unwrap(listResponse) || []);
      setProfile(unwrap(profileResponse) || {});
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load wallet and payouts.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const estimatedTransfer = useMemo(() => {
    const amount = Number(form.amount || 0);
    const coinValue = Number(wallet.coinValue || 1);
    return amount * coinValue;
  }, [form.amount, wallet.coinValue]);

  const availableCoins = Math.max(Number(wallet.availableForWithdrawal || 0), 0);
  const configuredMinimum = Math.max(Number(wallet.minimumWithdrawalRequirement || 0), 0);
  const minimumWithdrawal = configuredMinimum > 0 ? configuredMinimum : 0.01;
  const configuredMaximum = Math.max(Number(wallet.maximumWithdrawalCoins || 0), 0);
  const maximumWithdrawal = configuredMaximum > 0
    ? Math.min(availableCoins, configuredMaximum)
    : availableCoins;
  const withdrawalAvailable = Boolean(wallet.canWithdraw) && maximumWithdrawal >= minimumWithdrawal;

  const savedPayout = profile?.details?.payout || {};
  const savedBankReady = Boolean(savedPayout.accountNumber && savedPayout.ifscCode);
  const savedUpiReady = Boolean(savedPayout.upiId);
  const maskedAccount = savedPayout.accountNumber ? `•••• ${String(savedPayout.accountNumber).slice(-4)}` : "Not configured";

  useEffect(() => {
    setForm((current) => {
      if (current.destination === "saved_upi" && !savedUpiReady) {
        return { ...current, destination: savedBankReady ? "saved_bank" : "one_time_upi" };
      }
      if (current.destination === "saved_bank" && !savedBankReady) {
        return { ...current, destination: savedUpiReady ? "saved_upi" : "one_time_upi" };
      }
      return current;
    });
  }, [savedBankReady, savedUpiReady]);

  const uploadQr = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Upload a JPG, PNG, or WebP QR image.");
      return;
    }
    const data = new FormData();
    data.append("file", file);
    data.append("module", "REFERRAL_PAYOUT_QR");
    data.append("type", "payout-qr");
    try {
      setUploadingQr(true); setError("");
      const uploaded = unwrap(await api.post(endpoints.uploadImage, data));
      const payoutQrUrl = uploaded?.imageURL || uploaded?.url || uploaded?.image?.url;
      if (!payoutQrUrl) throw new Error("Upload response did not include a URL");
      setForm((current) => ({ ...current, payoutQrUrl }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || "Unable to upload QR image.");
    } finally { setUploadingQr(false); }
  };

  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    const requestedAmount = Number(form.amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      setError("Enter a valid withdrawal amount greater than zero.");
      return;
    }
    if (requestedAmount < minimumWithdrawal) {
      setError(`Minimum withdrawal is ${number(minimumWithdrawal)} coins.`);
      return;
    }
    if (requestedAmount > maximumWithdrawal) {
      setError(`You can withdraw up to ${number(maximumWithdrawal)} coins.`);
      return;
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(String(form.amount).trim())) {
      setError("Withdrawal amount can have at most 2 decimal places.");
      return;
    }
    setSaving(true);
    try {
      const destinationMap = {
        saved_bank: { payoutMethod: "bank", destinationSource: "saved_profile" },
        saved_upi: { payoutMethod: "upi", destinationSource: "saved_profile" },
        one_time_upi: { payoutMethod: "upi", destinationSource: "one_time", upiId: form.upiId },
        upi_qr: { payoutMethod: "upi_qr", destinationSource: "one_time", upiId: form.upiId, payoutQrUrl: form.payoutQrUrl },
      };
      const created = unwrap(await api.post(endpoints.withdrawals, {
        amount: requestedAmount,
        ...destinationMap[form.destination],
      }));
      setMessage(`Request submitted. Admin will manually transfer ${money(created?.currencyAmount ?? estimatedTransfer)} after approval.`);
      setForm((current) => ({ ...current, amount: "" }));
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to submit payout request.");
    } finally { setSaving(false); }
  };

  const showPaidAt = rows.some((row) => row.paidAt);
  const showReference = rows.some((row) => row.transactionReference);
  const showAdminNote = rows.some((row) => row.adminNote);
  const visibleColumnCount = 5 + Number(showPaidAt) + Number(showReference) + Number(showAdminNote);

  return <>
    <div className="page-heading"><div><h1>Wallet & Payouts</h1><p>Track earned coins and request a manual bank or UPI payout from Admin.</p></div><button className="button secondary" onClick={load}><RefreshCw size={15} className={loading ? "spin" : ""}/>Refresh</button></div>

    <div className="withdrawal-summary">
      {[
        ["Locked", wallet.lockedCoins, "Waiting for fulfilment and return window"],
        ["Available", wallet.availableCoins, "Can be requested now"],
        ["In Payout Process", wallet.reservedCoins, "Requested or approved; waiting for transfer"],
        ["Paid", wallet.withdrawnCoins, "Successfully transferred"],
      ].map(([title, value, note]) => <div key={title}><span>{title} Coins</span><strong>{number(value)}</strong><small>{note}</small></div>)}
    </div>

    <section className="profile-form withdrawal-form">
      <div className="form-section-title"><b><WalletCards size={17}/></b><h2>Request Manual Payout</h2><span/></div>
      {!withdrawalAvailable ? <div className="withdrawal-unavailable"><strong>{availableCoins <= 0 ? "No coins available to withdraw" : "Minimum withdrawal not reached"}</strong><p>{availableCoins <= 0 ? "Coins become available after eligible orders are fulfilled and the return window ends." : `You currently have ${number(availableCoins)} available coins. The minimum payout is ${number(minimumWithdrawal)} coins.`}</p>{error && <div className="form-message error-state">{error}</div>}</div> : <>
      <div className="payout-flow"><span>Available coins</span><ArrowRight size={15}/><span>Request submitted</span><ArrowRight size={15}/><span>Admin approves</span><ArrowRight size={15}/><span>Admin transfers &amp; marks paid</span></div>
      <form className="form-grid" onSubmit={submit}>
        <label className="field"><span>Coins to withdraw *</span><input type="number" min={withdrawalAvailable ? minimumWithdrawal : undefined} max={withdrawalAvailable ? maximumWithdrawal : undefined} step="0.01" value={form.amount} onChange={(event)=>setForm({...form, amount:event.target.value})} disabled={!withdrawalAvailable} required/>{!withdrawalAvailable && <small>{availableCoins <= 0 ? "No coins are currently available to withdraw." : `Minimum withdrawal is ${number(minimumWithdrawal)} coins; ${number(availableCoins)} available.`}</small>}</label>
        <label className="field"><span>Transfer destination *</span><select value={form.destination} onChange={(event)=>setForm({...form, destination:event.target.value, upiId:"", payoutQrUrl:""})}><option value="saved_upi" disabled={!savedUpiReady}>Saved UPI{savedUpiReady ? ` — ${savedPayout.upiId}` : " — not configured"}</option><option value="saved_bank" disabled={!savedBankReady}>Saved bank{savedBankReady ? ` — ${maskedAccount}` : " — not configured"}</option><option value="one_time_upi">Use another UPI ID</option><option value="upi_qr">Use UPI QR</option></select></label>
        {form.destination === "saved_bank" && <div className="field wide payout-estimate"><span>Saved bank account</span><strong>{savedPayout.bankName || "Bank"} · {maskedAccount}</strong><small>{savedPayout.accountHolderName || "Account holder not provided"} · IFSC {savedPayout.ifscCode}</small></div>}
        {form.destination === "saved_upi" && <div className="field wide payout-estimate"><span>Saved UPI</span><strong>{savedPayout.upiId || "Not configured"}</strong><small>{savedPayout.accountHolderName || "Profile payout method"}</small></div>}
        {["one_time_upi", "upi_qr"].includes(form.destination) && <label className="field wide"><span>UPI ID *</span><input value={form.upiId} onChange={(event)=>setForm({...form, upiId:event.target.value})} placeholder="name@bank" required/></label>}
        {form.destination === "upi_qr" && <div className="field wide payout-estimate"><span>UPI QR image *</span><label className="button secondary"><UploadCloud size={15}/>{uploadingQr ? "Uploading…" : form.payoutQrUrl ? "Replace QR" : "Upload QR"}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploadingQr} onChange={uploadQr}/></label>{form.payoutQrUrl && <a href={form.payoutQrUrl} target="_blank" rel="noreferrer">View uploaded QR</a>}<small>The UPI ID is also required so Admin can verify the QR destination.</small></div>}
        <div className="wide payout-estimate"><span>Estimated manual transfer</span><strong>{money(estimatedTransfer)}</strong><small>{number(form.amount)} coins × {money(wallet.coinValue || 1)} per coin. Final amount is snapshotted when requested.</small></div>
        {error && <div className="form-message error-state wide">{error}</div>}
        {message && <div className="form-message success-state wide">{message}</div>}
        <div className="wide"><button className="button gold" disabled={saving || uploadingQr || !withdrawalAvailable || (form.destination === "upi_qr" && !form.payoutQrUrl)}><Send size={15}/>{saving ? "Submitting…" : "Submit Payout Request"}</button></div>
      </form>
      </>}
    </section>

    <section className="table-card spaced-card"><div className="table-toolbar"><div><h2>Payout History</h2><span>Approval reserves the coins. Paid Coins update only after Admin transfers the money and records the UTR.</span></div></div><div className="table-scroll"><table><thead><tr><th>Requested Coins</th><th>Transfer Amount</th><th>Transfer To</th><th>Status</th><th>Requested</th>{showPaidAt && <th>Paid</th>}{showReference && <th>UTR</th>}<th>Proof</th>{showAdminNote && <th>Admin Note</th>}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id || row._id}><td>{number(row.coinAmount ?? row.amount)}</td><td>{money(row.currencyAmount ?? Number((row.coinAmount ?? row.amount) || 0) * Number(row.coinValue || 1))}</td><td><strong>{words(row.payoutMethod)}</strong><small className="block">{row.destinationSnapshot?.accountNumberLast4 ? `Account •••• ${row.destinationSnapshot.accountNumberLast4}` : row.destinationSnapshot?.upiId || row.upiId || row.bankAccountId || "Manual"}</small></td><td><span className={`status-pill ${row.status}`}>{payoutStatusLabel(row.status)}</span></td><td>{date(row.requestedAt || row.createdAt)}</td>{showPaidAt && <td>{date(row.paidAt)}</td>}{showReference && <td>{row.transactionReference || "—"}</td>}<td>{row.paymentProofUrl ? <a className="icon-action" href={row.paymentProofUrl} target="_blank" rel="noreferrer" title="View Admin payment proof"><ExternalLink size={15}/></a> : "—"}</td>{showAdminNote && <td>{row.adminNote || "—"}</td>}</tr>) : <tr><td colSpan={visibleColumnCount + 1} className="empty-cell">No payout requests yet</td></tr>}</tbody></table></div></section>
  </>;
}
