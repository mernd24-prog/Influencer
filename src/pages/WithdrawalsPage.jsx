import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Send,
  UploadCloud,
  WalletCards,
} from "lucide-react";

import { api, endpoints, unwrap } from "../api";
import PageHeader from "../components/PageHeader";

const number = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const money = (value) => `₹${number(value)}`;

const words = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const date = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const payoutStatusLabel = (status) =>
  ({
    pending: "Pending Admin Review",
    approved: "Approved — Awaiting Transfer",
    processing: "Transfer In Progress",
    paid: "Paid",
    rejected: "Rejected",
    failed: "Transfer Failed",
    cancelled: "Cancelled",
  })[status] || words(status);

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold";

  if (["paid", "approved"].includes(value)) {
    return `${base} bg-emerald-50 text-emerald-700`;
  }

  if (["pending", "processing"].includes(value)) {
    return `${base} bg-amber-50 text-amber-700`;
  }

  if (["rejected", "failed", "cancelled"].includes(value)) {
    return `${base} bg-red-50 text-red-600`;
  }

  return `${base} bg-gray-100 text-gray-600`;
};

export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState({});
  const [profile, setProfile] = useState({});
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    amount: "",
    destination: "saved_upi",
    upiId: "",
    payoutQrUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        walletResponse,
        listResponse,
        profileResponse,
      ] = await Promise.all([
        api.get(endpoints.wallet),

        api.get(endpoints.withdrawals, {
          params: {
            page: 1,
            limit: 50,
          },
        }),

        api.get(endpoints.profile),
      ]);

      setWallet(
        unwrap(walletResponse) || {}
      );

      setRows(
        unwrap(listResponse) || []
      );

      setProfile(
        unwrap(profileResponse) || {}
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load wallet and payouts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const estimatedTransfer = useMemo(() => {
    const amount = Number(form.amount || 0);
    const coinValue = Number(wallet.coinValue || 1);

    return amount * coinValue;
  }, [form.amount, wallet.coinValue]);

  const availableCoins = Math.max(
    Number(wallet.availableForWithdrawal || 0),
    0
  );

  const configuredMinimum = Math.max(
    Number(wallet.minimumWithdrawalRequirement || 0),
    0
  );

  const minimumWithdrawal =
    configuredMinimum > 0
      ? configuredMinimum
      : 0.01;

  const configuredMaximum = Math.max(
    Number(wallet.maximumWithdrawalCoins || 0),
    0
  );

  const maximumWithdrawal =
    configuredMaximum > 0
      ? Math.min(
          availableCoins,
          configuredMaximum
        )
      : availableCoins;

  const withdrawalAvailable =
    Boolean(wallet.canWithdraw) &&
    maximumWithdrawal >= minimumWithdrawal;

  const savedPayout =
    profile?.details?.payout || {};

  const savedBankReady = Boolean(
    savedPayout.accountNumber &&
      savedPayout.ifscCode
  );

  const savedUpiReady = Boolean(
    savedPayout.upiId
  );

  const maskedAccount =
    savedPayout.accountNumber
      ? `•••• ${String(
          savedPayout.accountNumber
        ).slice(-4)}`
      : "Not configured";

  useEffect(() => {
    setForm((current) => {
      if (
        current.destination === "saved_upi" &&
        !savedUpiReady
      ) {
        return {
          ...current,
          destination: savedBankReady
            ? "saved_bank"
            : "one_time_upi",
        };
      }

      if (
        current.destination === "saved_bank" &&
        !savedBankReady
      ) {
        return {
          ...current,
          destination: savedUpiReady
            ? "saved_upi"
            : "one_time_upi",
        };
      }

      return current;
    });
  }, [savedBankReady, savedUpiReady]);

  const uploadQr = async (event) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Upload a JPG, PNG, or WebP QR image."
      );

      return;
    }

    const data = new FormData();

    data.append("file", file);

    data.append(
      "module",
      "REFERRAL_PAYOUT_QR"
    );

    data.append(
      "type",
      "payout-qr"
    );

    try {
      setUploadingQr(true);
      setError("");

      const uploaded = unwrap(
        await api.post(
          endpoints.uploadImage,
          data
        )
      );

      const payoutQrUrl =
        uploaded?.imageURL ||
        uploaded?.url ||
        uploaded?.image?.url;

      if (!payoutQrUrl) {
        throw new Error(
          "Upload response did not include a URL"
        );
      }

      setForm((current) => ({
        ...current,
        payoutQrUrl,
      }));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to upload QR image."
      );
    } finally {
      setUploadingQr(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const requestedAmount = Number(
      form.amount
    );

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      setError(
        "Enter a valid withdrawal amount greater than zero."
      );

      return;
    }

    if (
      requestedAmount <
      minimumWithdrawal
    ) {
      setError(
        `Minimum withdrawal is ${number(
          minimumWithdrawal
        )} coins.`
      );

      return;
    }

    if (
      requestedAmount >
      maximumWithdrawal
    ) {
      setError(
        `You can withdraw up to ${number(
          maximumWithdrawal
        )} coins.`
      );

      return;
    }

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(
        String(form.amount).trim()
      )
    ) {
      setError(
        "Withdrawal amount can have at most 2 decimal places."
      );

      return;
    }

    setSaving(true);

    try {
      const destinationMap = {
        saved_bank: {
          payoutMethod: "bank",
          destinationSource:
            "saved_profile",
        },

        saved_upi: {
          payoutMethod: "upi",
          destinationSource:
            "saved_profile",
        },

        one_time_upi: {
          payoutMethod: "upi",
          destinationSource:
            "one_time",
          upiId: form.upiId,
        },

        upi_qr: {
          payoutMethod: "upi_qr",
          destinationSource:
            "one_time",
          upiId: form.upiId,
          payoutQrUrl:
            form.payoutQrUrl,
        },
      };

      const created = unwrap(
        await api.post(
          endpoints.withdrawals,
          {
            amount: requestedAmount,

            ...destinationMap[
              form.destination
            ],
          }
        )
      );

      setMessage(
        `Request submitted. Admin will manually transfer ${money(
          created?.currencyAmount ??
            estimatedTransfer
        )} after approval.`
      );

      setForm((current) => ({
        ...current,
        amount: "",
      }));

      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to submit payout request."
      );
    } finally {
      setSaving(false);
    }
  };

  const showPaidAt = rows.some(
    (row) => row.paidAt
  );

  const showReference = rows.some(
    (row) =>
      row.transactionReference
  );

  const showAdminNote = rows.some(
    (row) => row.adminNote
  );

  const visibleColumnCount =
    5 +
    Number(showPaidAt) +
    Number(showReference) +
    Number(showAdminNote);

  return (
    <>
      {/* Page Header */}

      <PageHeader
        title="Wallet & Payouts"
        subtitle="Track earned coins and request a manual bank or UPI payout from Admin."
        loading={loading}
        onRefresh={load}
      />

      {/* Wallet Summary */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Locked",
            wallet.lockedCoins,
            "Waiting for fulfilment and return window",
          ],
          [
            "Available",
            wallet.availableCoins,
            "Can be requested now",
          ],
          [
            "In Payout Process",
            wallet.reservedCoins,
            "Requested or approved; waiting for transfer",
          ],
          [
            "Paid",
            wallet.withdrawnCoins,
            "Successfully transferred",
          ],
        ].map(
          ([title, value, note]) => (
            <article
              key={title}
              className="relative overflow-hidden rounded-xl border border-[#eadfce] border-l-[3px] border-l-[#dca719] bg-white p-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
            >
              <div className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center rounded-bl-xl bg-[#fff4d9] text-[#dca719]">
                <WalletCards size={18} />
              </div>

              <span className="block max-w-[75%] text-[11px] font-semibold text-gray-600">
                {title} Coins
              </span>

              <strong className="mt-2 block text-[20px] font-bold leading-tight text-[#211b62]">
                {number(value)}
              </strong>

              <small className="mt-2 block max-w-[90%] text-[11px] leading-5 text-gray-400">
                {note}
              </small>
            </article>
          )
        )}
      </div>

      {/* Payout Request */}

      <section className="mb-5 overflow-hidden rounded-xl border border-[#eadfce] bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-[#fffdf8] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff2cd] text-[#dca719]">
            <WalletCards size={17} />
          </div>

          <div>
            <h2 className="text-[15px] font-semibold text-[#211b62]">
              Request Manual Payout
            </h2>

            <p className="mt-1 text-[11px] text-gray-500">
              Submit a request using your saved bank, UPI, another UPI ID, or QR.
            </p>
          </div>
        </div>

        {!withdrawalAvailable ? (
          <div className="p-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5">
              <strong className="text-[13px] font-semibold text-amber-700">
                {availableCoins <= 0
                  ? "No coins available to withdraw"
                  : "Minimum withdrawal not reached"}
              </strong>

              <p className="mt-2 text-[11px] leading-5 text-amber-600">
                {availableCoins <= 0
                  ? "Coins become available after eligible orders are fulfilled and the return window ends."
                  : `You currently have ${number(
                      availableCoins
                    )} available coins. The minimum payout is ${number(
                      minimumWithdrawal
                    )} coins.`}
              </p>

              {error && (
                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Payout Flow */}

            <div className="border-b border-gray-100 bg-gray-50/40 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
                <span className="rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                  Available coins
                </span>

                <ArrowRight size={14} />

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                  Request submitted
                </span>

                <ArrowRight size={14} />

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                  Admin approves
                </span>

                <ArrowRight size={14} />

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                  Transfer & mark paid
                </span>
              </div>
            </div>

            {/* Form */}

            <form
              onSubmit={submit}
              className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2"
            >
              <Field label="Coins to withdraw *">
                <input
                  type="number"
                  min={
                    withdrawalAvailable
                      ? minimumWithdrawal
                      : undefined
                  }
                  max={
                    withdrawalAvailable
                      ? maximumWithdrawal
                      : undefined
                  }
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount:
                        event.target.value,
                    })
                  }
                  disabled={
                    !withdrawalAvailable
                  }
                  required
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10"
                />
              </Field>

              <Field label="Transfer destination *">
                <select
                  value={
                    form.destination
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,

                      destination:
                        event.target.value,

                      upiId: "",

                      payoutQrUrl: "",
                    })
                  }
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10"
                >
                  <option
                    value="saved_upi"
                    disabled={
                      !savedUpiReady
                    }
                  >
                    Saved UPI
                    {savedUpiReady
                      ? ` — ${savedPayout.upiId}`
                      : " — not configured"}
                  </option>

                  <option
                    value="saved_bank"
                    disabled={
                      !savedBankReady
                    }
                  >
                    Saved bank
                    {savedBankReady
                      ? ` — ${maskedAccount}`
                      : " — not configured"}
                  </option>

                  <option value="one_time_upi">
                    Use another UPI ID
                  </option>

                  <option value="upi_qr">
                    Use UPI QR
                  </option>
                </select>
              </Field>

              {/* Saved Bank */}

              {form.destination ===
                "saved_bank" && (
                <InfoBox
                  label="Saved bank account"
                  title={`${
                    savedPayout.bankName ||
                    "Bank"
                  } · ${maskedAccount}`}
                  note={`${
                    savedPayout.accountHolderName ||
                    "Account holder not provided"
                  } · IFSC ${
                    savedPayout.ifscCode
                  }`}
                />
              )}

              {/* Saved UPI */}

              {form.destination ===
                "saved_upi" && (
                <InfoBox
                  label="Saved UPI"
                  title={
                    savedPayout.upiId ||
                    "Not configured"
                  }
                  note={
                    savedPayout.accountHolderName ||
                    "Profile payout method"
                  }
                />
              )}

              {/* One Time UPI */}

              {[
                "one_time_upi",
                "upi_qr",
              ].includes(
                form.destination
              ) && (
                <Field
                  label="UPI ID *"
                  wide
                >
                  <input
                    value={form.upiId}
                    onChange={(event) =>
                      setForm({
                        ...form,

                        upiId:
                          event.target
                            .value,
                      })
                    }
                    placeholder="name@bank"
                    required
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 transition hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10"
                  />
                </Field>
              )}

              {/* QR Upload */}

              {form.destination ===
                "upi_qr" && (
                <div className="md:col-span-2">
                  <span className="mb-1.5 block text-[11px] font-medium text-gray-600">
                    UPI QR image *
                  </span>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-600 transition hover:border-[#dca719]/50 hover:bg-[#fffaf0]">
                      <UploadCloud
                        size={14}
                      />

                      {uploadingQr
                        ? "Uploading…"
                        : form.payoutQrUrl
                          ? "Replace QR"
                          : "Upload QR"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={
                          uploadingQr
                        }
                        onChange={
                          uploadQr
                        }
                      />
                    </label>

                    {form.payoutQrUrl && (
                      <a
                        href={
                          form.payoutQrUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="ml-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#211b62] transition hover:text-[#dca719]"
                      >
                        <ExternalLink
                          size={12}
                        />

                        View uploaded QR
                      </a>
                    )}

                    <small className="mt-3 block text-[11px] leading-5 text-gray-400">
                      The UPI ID is also required so Admin can verify the QR destination.
                    </small>
                  </div>
                </div>
              )}

              {/* Estimated Transfer */}

              <div className="md:col-span-2 rounded-xl border border-[#eadfce] bg-[#fffaf0] p-4">
                <span className="text-[11px] font-medium uppercase text-gray-500">
                  Estimated manual transfer
                </span>

                <strong className="mt-2 block text-[22px] font-bold text-[#211b62]">
                  {money(
                    estimatedTransfer
                  )}
                </strong>

                <small className="mt-1 block text-[11px] leading-5 text-gray-500">
                  {number(
                    form.amount
                  )}{" "}
                  coins ×{" "}
                  {money(
                    wallet.coinValue ||
                      1
                  )}{" "}
                  per coin. Final amount is snapshotted when requested.
                </small>
              </div>

              {/* Error */}

              {error && (
                <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}

              {message && (
                <div className="md:col-span-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-medium text-emerald-700">
                  {message}
                </div>
              )}

              {/* Submit */}

              <div className="md:col-span-2 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingQr ||
                    !withdrawalAvailable ||
                    (form.destination ===
                      "upi_qr" &&
                      !form.payoutQrUrl)
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#dca719] px-5 text-[11px] font-semibold text-white transition hover:bg-[#c79715] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} />

                  {saving
                    ? "Submitting…"
                    : "Submit Payout Request"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      {/* Payout History */}

      <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#211b62]">
            Payout History
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            Approval reserves the coins. Paid Coins update only after Admin transfers the
            money and records the UTR.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap border-collapse">
            <thead>
              <tr>
                {[
                  "Requested Coins",
                  "Transfer Amount",
                  "Transfer To",
                  "Status",
                  "Requested",
                ].map((label) => (
                  <th
                    key={label}
                    className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {label}
                  </th>
                ))}

                {showPaidAt && (
                  <th className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Paid
                  </th>
                )}

                {showReference && (
                  <th className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    UTR
                  </th>
                )}

                <th className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Proof
                </th>

                {showAdminNote && (
                  <th className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Admin Note
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={
                      row.id ||
                      row._id
                    }
                    className="border-t border-gray-100 transition hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-700">
                      {number(
                        row.coinAmount ??
                          row.amount
                      )}
                    </td>

                    <td className="px-4 py-3 text-[12px] font-medium text-gray-700">
                      {money(
                        row.currencyAmount ??
                          Number(
                            (row.coinAmount ??
                              row.amount) ||
                              0
                          ) *
                            Number(
                              row.coinValue ||
                                1
                            )
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <strong className="block text-[12px] font-semibold text-gray-700">
                        {words(
                          row.payoutMethod
                        )}
                      </strong>

                      <small className="mt-1 block text-[11px] text-gray-400">
                        {row
                          .destinationSnapshot
                          ?.accountNumberLast4
                          ? `Account •••• ${row.destinationSnapshot.accountNumberLast4}`
                          : row
                              .destinationSnapshot
                              ?.upiId ||
                            row.upiId ||
                            row.bankAccountId ||
                            "Manual"}
                      </small>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={getStatusClass(
                          row.status
                        )}
                      >
                        {payoutStatusLabel(
                          row.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[12px] text-gray-500">
                      {date(
                        row.requestedAt ||
                          row.createdAt
                      )}
                    </td>

                    {showPaidAt && (
                      <td className="px-4 py-3 text-[12px] text-gray-500">
                        {date(
                          row.paidAt
                        )}
                      </td>
                    )}

                    {showReference && (
                      <td className="px-4 py-3 text-[12px] text-gray-600">
                        {row.transactionReference ||
                          "—"}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      {row.paymentProofUrl ? (
                        <a
                          href={
                            row.paymentProofUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          title="View Admin payment proof"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#211b62] transition hover:bg-gray-50"
                        >
                          <ExternalLink
                            size={14}
                          />
                        </a>
                      ) : (
                        <span className="text-[12px] text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {showAdminNote && (
                      <td className="max-w-[220px] overflow-hidden text-ellipsis px-4 py-3 text-[12px] text-gray-500">
                        {row.adminNote ||
                          "—"}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      visibleColumnCount +
                      1
                    }
                    className="h-[160px] text-center text-[12px] font-medium text-gray-400"
                  >
                    No payout requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  children,
  wide = false,
}) {
  return (
    <label
      className={`grid gap-1.5 ${
        wide
          ? "md:col-span-2"
          : ""
      }`}
    >
      <span className="text-[11px] font-medium text-gray-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function InfoBox({
  label,
  title,
  note,
}) {
  return (
    <div className="md:col-span-2 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <span className="text-[11px] font-medium uppercase text-gray-500">
        {label}
      </span>

      <strong className="mt-1.5 block text-[13px] font-semibold text-gray-700">
        {title}
      </strong>

      <small className="mt-1 block text-[11px] leading-5 text-gray-400">
        {note}
      </small>
    </div>
  );
}