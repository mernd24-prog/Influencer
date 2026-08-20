import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  LockKeyhole,
  MapPin,
  UploadCloud,
  UserRound,
} from "lucide-react";

import { api, endpoints, unwrap } from "../api";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { ProfileSkeleton } from "../components/PageSkeletons";
import ThemedSelect from "../components/ThemedSelect";
import { getFirstZodError, profileSchema } from "../validation/schemas";

const empty = {
  firstName: "",
  lastName: "",
  phone: "",
  avatarUrl: "",
  dateOfBirth: "",
  gender: "",

  address: {
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  },

  documents: {
    panCardUrl: "",
    aadhaarCardUrl: "",
    cancelledChequeUrl: "",
  },

  payout: {
    method: "bank",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  },
};

const merge = (profile = {}) => ({
  ...empty,
  ...(profile.user?.profile || {}),

  phone: profile.user?.mobile || "",

  dateOfBirth:
    profile.details?.dateOfBirth?.slice?.(0, 10) || "",

  gender: profile.details?.gender || "",

  address: {
    ...empty.address,
    ...profile.details?.address,
  },

  documents: {
    ...empty.documents,
    ...profile.details?.documents,
  },

  payout: {
    ...empty.payout,
    ...profile.details?.payout,
  },
});

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  const base =
    "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize";

  if (
    [
      "approved",
      "verified",
      "completed",
      "active",
      "submitted",
    ].includes(value)
  ) {
    return `${base} bg-emerald-50 text-emerald-700`;
  }

  if (
    [
      "pending",
      "under_review",
      "in_review",
      "not submitted",
      "not_submitted",
    ].includes(value)
  ) {
    return `${base} bg-amber-50 text-amber-700`;
  }

  if (
    [
      "rejected",
      "failed",
      "inactive",
    ].includes(value)
  ) {
    return `${base} bg-red-50 text-red-600`;
  }

  return `${base} bg-gray-100 text-gray-600`;
};

const formatStatus = (value) =>
  String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ProfilePage({ session }) {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(empty);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const next = unwrap(
        await api.get(endpoints.profile)
      );

      setRecord(next);
      setForm(merge(next));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setGroup = (group, key, value) => {
    setForm((current) => ({
      ...current,

      [group]: {
        ...current[group],
        [key]: value,
      },
    }));
  };

  const uploadFile = async (
    key,
    file,
    { image = false } = {}
  ) => {
    if (!file) return;

    setUploading(key);
    setError("");
    setMessage("");

    try {
      const body = new FormData();

      body.append("file", file);
      body.append(
        "module",
        "influencer-kyc"
      );

      body.append(
        image
          ? "imageType"
          : "documentKey",
        key
      );

      const uploaded = unwrap(
        await api.post(
          image
            ? endpoints.uploadImage
            : endpoints.uploadDocument,
          body
        )
      );

      const url =
        uploaded?.url ||
        uploaded?.imageURL ||
        uploaded?.documentURL ||
        uploaded?.image?.url ||
        uploaded?.document?.url;

      if (!url) {
        throw new Error(
          "Upload response did not contain a file URL"
        );
      }

      const payload = image
        ? {
            avatarUrl: url,
          }
        : {
            documents: {
              [key]: url,
            },
          };

      const next = unwrap(
        await api.patch(
          endpoints.profile,
          payload
        )
      );

      setRecord(next);
      setForm(merge(next));

      setMessage(
        `${
          image
            ? "Profile photo"
            : "KYC document"
        } uploaded and saved successfully.`
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to upload file."
      );
    } finally {
      setUploading("");
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    const validation = profileSchema.safeParse(form);
    if (!validation.success) {
      setError(getFirstZodError(validation.error));
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const next = unwrap(
        await api.patch(
          endpoints.profile,
          validation.data
        )
      );

      setRecord(next);
      setForm(merge(next));

      setMessage(
        "Profile submitted successfully. KYC and payout changes may require Admin approval."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      {/* Page Header */}

      <PageHeader
        title="My Profile"
        subtitle="Complete your Referral Partner account and payout information."
        loading={loading}
        onRefresh={load}
      />

      {/* Verification Status */}

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <article className="relative overflow-hidden rounded-xl border border-[#eadfce] border-l-[3px] border-l-[#dca719] bg-white p-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-gray-700">
                KYC Verification
              </span>

              <div className="mt-2">
                <span
                  className={statusClass(
                    record?.kycStatus
                  )}
                >
                  {formatStatus(
                    record?.kycStatus
                  )}
                </span>
              </div>

              <small className="mt-2 block text-[11px] leading-5 text-gray-400">
                Required before withdrawing coins
              </small>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff4d9] text-[#dca719]">
              <FileCheck2 size={19} />
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-xl border border-[#eadfce] border-l-[3px] border-l-[#211b62] bg-white p-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-gray-700">
                Payout Details
              </span>

              <div className="mt-2">
                <span
                  className={statusClass(
                    record?.payoutProfile?.status
                  )}
                >
                  {formatStatus(
                    record?.payoutProfile?.status ||
                      "not submitted"
                  )}
                </span>
              </div>

              <small className="mt-2 block text-[11px] leading-5 text-gray-400">
                {record?.payoutProfile
                  ?.bankOrUpiConfigured
                  ? "Bank or UPI details configured"
                  : "Add bank or UPI details below"}
              </small>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eeeefe] text-[#211b62]">
              <CreditCard size={19} />
            </div>
          </div>
        </article>
      </div>

      {/* Account Identity */}

      <SectionCard
        className="mb-5"
        title="Account Identity"
        subtitle="These details are managed by Admin and cannot be edited."
        headerClassName="bg-[#fffdf8]"
        icon={
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1efff] text-[#211b62]">
            <LockKeyhole size={16} />
          </div>
        }
      >
        <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
          <IdentityItem
            label="Referral Code"
            value={
              record?.primaryCode?.code ||
              "Not assigned"
            }
          />

          <IdentityItem
            label="Login Email"
            value={
              record?.user?.email ||
              "—"
            }
          />
        </div>
      </SectionCard>

      {/* Profile Form */}

      <form
        className="space-y-4"
        onSubmit={submit}
      >
        <FormSection
          icon={<UserRound size={16} />}
          title="Basic Information"
          subtitle="Your personal account details"
        >
          <Field
            label="First Name"
            value={form.firstName}
            onChange={(value) =>
              set("firstName", value)
            }
            required
          />

          <Field
            label="Last Name"
            value={form.lastName}
            onChange={(value) =>
              set("lastName", value)
            }
          />

          <Field
            label="Phone Number"
            value={form.phone}
            onChange={(value) =>
              set("phone", value)
            }
            required
          />

          <Field
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(value) =>
              set("dateOfBirth", value)
            }
          />

          <Select
            label="Gender"
            value={form.gender}
            onChange={(value) =>
              set("gender", value)
            }
            options={[
              "",
              "male",
              "female",
              "other",
              "prefer_not_to_say",
            ]}
          />

          <UploadField
            label="Profile Picture"
            kind="image"
            wide
            value={form.avatarUrl}
            accept="image/jpeg,image/png,image/webp,image/gif"
            uploading={
              uploading === "avatarUrl"
            }
            onFile={(file) =>
              uploadFile(
                "avatarUrl",
                file,
                {
                  image: true,
                }
              )
            }
          />
        </FormSection>

        {/* Address */}

        <FormSection
          icon={<MapPin size={16} />}
          title="Address Details"
          subtitle="Your current residential address"
        >
          <Field
            label="Address Line 1"
            value={form.address.line1}
            onChange={(value) =>
              setGroup(
                "address",
                "line1",
                value
              )
            }
            wide
          />

          <Field
            label="Address Line 2"
            value={form.address.line2}
            onChange={(value) =>
              setGroup(
                "address",
                "line2",
                value
              )
            }
          />

          <Field
            label="Country"
            value={form.address.country}
            onChange={(value) =>
              setGroup(
                "address",
                "country",
                value
              )
            }
          />

          <Field
            label="State"
            value={form.address.state}
            onChange={(value) =>
              setGroup(
                "address",
                "state",
                value
              )
            }
          />

          <Field
            label="City"
            value={form.address.city}
            onChange={(value) =>
              setGroup(
                "address",
                "city",
                value
              )
            }
          />

          <Field
            label="PIN / Zip Code"
            value={
              form.address.postalCode
            }
            onChange={(value) =>
              setGroup(
                "address",
                "postalCode",
                value
              )
            }
          />
        </FormSection>

        {/* KYC */}

        <FormSection
          icon={<FileText size={16} />}
          title="KYC Documents"
          subtitle="Upload the required verification documents"
        >
          <UploadField
            label="PAN Card"
            value={
              form.documents.panCardUrl
            }
            uploading={
              uploading ===
              "panCardUrl"
            }
            onFile={(file) =>
              uploadFile(
                "panCardUrl",
                file
              )
            }
          />

          <UploadField
            label="Aadhaar Card"
            value={
              form.documents
                .aadhaarCardUrl
            }
            uploading={
              uploading ===
              "aadhaarCardUrl"
            }
            onFile={(file) =>
              uploadFile(
                "aadhaarCardUrl",
                file
              )
            }
          />

          <UploadField
            label="Cancelled Cheque"
            value={
              form.documents
                .cancelledChequeUrl
            }
            uploading={
              uploading ===
              "cancelledChequeUrl"
            }
            onFile={(file) =>
              uploadFile(
                "cancelledChequeUrl",
                file
              )
            }
          />
        </FormSection>

        {/* Payout */}

        <FormSection
          icon={<CreditCard size={16} />}
          title="Payout Information"
          subtitle="Add the account where you want to receive payouts"
        >
          <Select
            label="Payout Method"
            value={form.payout.method}
            onChange={(value) =>
              setGroup(
                "payout",
                "method",
                value
              )
            }
            options={[
              "bank",
              "upi",
            ]}
          />

          <Field
            label="Account Holder Name"
            value={
              form.payout
                .accountHolderName
            }
            onChange={(value) =>
              setGroup(
                "payout",
                "accountHolderName",
                value
              )
            }
          />

          {form.payout.method ===
          "bank" ? (
            <>
              <Field
                label="Bank Name"
                value={
                  form.payout.bankName
                }
                onChange={(value) =>
                  setGroup(
                    "payout",
                    "bankName",
                    value
                  )
                }
              />

              <Field
                label="Account Number"
                value={
                  form.payout
                    .accountNumber
                }
                onChange={(value) =>
                  setGroup(
                    "payout",
                    "accountNumber",
                    value
                  )
                }
              />

              <Field
                label="IFSC Code"
                value={
                  form.payout.ifscCode
                }
                onChange={(value) =>
                  setGroup(
                    "payout",
                    "ifscCode",
                    value
                  )
                }
              />
            </>
          ) : (
            <Field
              label="UPI ID"
              value={
                form.payout.upiId
              }
              onChange={(value) =>
                setGroup(
                  "payout",
                  "upiId",
                  value
                )
              }
            />
          )}
        </FormSection>

        {/* Messages */}

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-700">
            {message}
          </div>
        )}

        {/* Actions */}

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-[#eadfce] bg-white/95 px-5 py-4 shadow-[0_-4px_18px_rgba(31,27,95,0.05)] backdrop-blur">
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel Changes
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              Boolean(uploading)
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#dca719] px-5 text-[11px] font-semibold text-white transition hover:bg-[#c79715] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={15} />

            {saving
              ? "Saving…"
              : "Save Profile"}
          </button>
        </div>
      </form>
    </>
  );
}

function IdentityItem({
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f5f3ff] text-[#211b62]">
        <LockKeyhole size={14} />
      </div>

      <div className="min-w-0">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>

        <strong
          className="mt-1 block truncate text-[12px] font-semibold text-gray-700"
          title={value}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

function FormSection({
  icon,
  title,
  subtitle,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white shadow-[0_1px_3px_rgba(31,27,95,0.04)]">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-[#fffdf8] px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1efff] text-[#211b62]">
          {icon}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-[#211b62]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-5 text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  wide = false,
  desktopWide = false,
}) {
  return (
    <label
      className={`grid min-w-0 gap-1.5 ${
        wide
          ? "md:col-span-2 xl:col-span-2"
          : desktopWide
            ? "xl:col-span-2"
          : ""
      }`}
    >
      <span className="text-[11px] font-medium text-gray-600">
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        required={required}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-[11px] font-medium text-gray-600">
        {label}
      </span>

      <ThemedSelect
        value={value || ""}
        ariaLabel={label}
        onChange={onChange}
        className="h-10 rounded-lg border-gray-200 text-[12px] capitalize"
        options={options.map((option) => ({
          value: option,
          label: option ? option.replaceAll("_", " ") : "Select",
        }))}
      />
    </label>
  );
}

function UploadField({
  label,
  value,
  onFile,
  uploading,
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  kind = "document",
  wide = false,
}) {
  const isImage = kind === "image";

  return (
    <div
      className={`grid min-w-0 grid-rows-[auto_120px_20px] gap-1.5 ${
        wide ? "md:col-span-2 xl:col-span-3" : ""
      }`}
    >
      <span className="text-[11px] font-medium text-gray-600">
        {label}
      </span>

      <label
        className={`group relative flex h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-4 text-center transition ${
          value
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-gray-300 bg-gray-50/50 hover:border-[#dca719] hover:bg-[#fffaf0]"
        } ${
          uploading
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            onFile(file);

            event.target.value = "";
          }}
        />

        <div
          className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${
            value
              ? "bg-emerald-100 text-emerald-600"
              : "bg-[#fff2cd] text-[#dca719]"
          }`}
        >
          {value ? (
            <FileCheck2 size={19} />
          ) : (
            <UploadCloud size={19} />
          )}
        </div>

        <strong className="text-[12px] font-semibold text-gray-700">
          {uploading
            ? "Uploading to cloud…"
            : value
              ? `${isImage ? "Image" : "Document"} uploaded`
              : `Choose ${isImage ? "image" : "file"} to upload`}
        </strong>

        <small className="mt-1 text-[11px] text-gray-400">
          {value
            ? "Click to replace"
            : isImage
              ? "JPG, PNG, WEBP or GIF"
              : "PDF, JPG, PNG or WEBP"}
        </small>
      </label>

      <div className="flex h-5 items-center">
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-[11px] font-medium text-[#211b62] hover:text-[#dca719]"
        >
          <ExternalLink size={12} />

          View uploaded {isImage ? "image" : "file"}
        </a>
      )}
      </div>
    </div>
  );
}
