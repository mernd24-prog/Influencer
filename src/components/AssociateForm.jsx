import { useState } from "react";
import { X } from "lucide-react";

import {
  api,
  endpoints,
  unwrap,
} from "../api";
import { associateSchema, getZodFieldErrors } from "../validation/schemas";

export default function AssociateForm({
  onClose,
  onCreated,
}) {
  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      code: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [created, setCreated] =
    useState(null);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: "" }));
    }
    if (error) setError("");
  };

  const validate = () => {
    const result = associateSchema.safeParse(form);
    setFieldErrors(result.success ? {} : getZodFieldErrors(result.error));
    return result;
  };

  const submit = async (
    event
  ) => {
    event.preventDefault();

    const validation = validate();
    if (!validation.success) return;

    setSaving(true);
    setError("");

    try {
      const payload =
        Object.fromEntries(
          Object.entries(validation.data)
            .filter(([, value]) => value.length)
        );

      setCreated(
        unwrap(
          await api.post(
            endpoints.createBrandAssociate,
            payload
          )
        )
      );
    } catch (requestError) {
      setError(
        requestError?.response
          ?.data?.message ||
          "Unable to create brand associate."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="m-0 text-[17px] font-semibold text-[#211b62]">
              Add Brand Associate
            </h2>

            <span className="mt-1 block text-[11px] leading-5 text-gray-500">
              Create login access under
              your growth-partner account
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {created ? (
          /* Success State */

          <div className="p-6">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="m-0 text-[16px] font-semibold text-emerald-700">
                Brand Associate Created
              </h3>

              <p className="mt-2 text-[12px] leading-5 text-emerald-600">
                Share these temporary
                credentials securely. The
                associate can update their
                profile after login.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <span className="text-[11px] font-medium uppercase text-gray-400">
                  Email
                </span>

                <strong className="mt-1.5 block text-[12px] font-semibold text-gray-700">
                  {form.email}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <span className="text-[11px] font-medium uppercase text-gray-400">
                  Temporary Password
                </span>

                <strong className="mt-1.5 block text-[12px] font-semibold text-gray-700">
                  {created.temporaryPassword ||
                    "Sent/configured by the system"}
                </strong>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onCreated}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#dca719] px-5 text-[12px] font-semibold text-white transition hover:bg-[#c79715]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */

          <form
            className="p-5"
            onSubmit={submit}
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First Name *" error={fieldErrors.firstName}>
                <input
                  name="firstName"
                  value={
                    form.firstName
                  }
                  onChange={update}
                  maxLength={50}
                  autoComplete="given-name"
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  className={getInputClass(fieldErrors.firstName)}
                />
              </FormField>

              <FormField label="Last Name" error={fieldErrors.lastName}>
                <input
                  name="lastName"
                  value={
                    form.lastName
                  }
                  onChange={update}
                  maxLength={50}
                  autoComplete="family-name"
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  className={getInputClass(fieldErrors.lastName)}
                />
              </FormField>

              <FormField label="Email Address *" error={fieldErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  maxLength={254}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={getInputClass(fieldErrors.email)}
                />
              </FormField>

              <FormField label="Phone Number" error={fieldErrors.phone}>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  maxLength={16}
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  className={getInputClass(fieldErrors.phone)}
                />
              </FormField>

              <FormField
                label="Referral Code (optional)"
                error={fieldErrors.code}
                wide
              >
                <input
                  name="code"
                  value={form.code}
                  onChange={update}
                  placeholder="Automatically generated if empty"
                  maxLength={30}
                  autoCapitalize="characters"
                  aria-invalid={Boolean(fieldErrors.code)}
                  className={getInputClass(fieldErrors.code)}
                />
              </FormField>
            </div>

            {/* Error */}

            {error && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-[12px] font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}

            <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-md border border-gray-200 bg-white px-5 text-[12px] font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-md bg-[#dca719] px-5 text-[12px] font-semibold text-white transition hover:bg-[#c79715] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Creating…"
                  : "Create Associate"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* Common input styling */

const inputClass =
  "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#7770c8] focus:ring-2 focus:ring-[#7770c8]/10";

const getInputClass = (error) => error
  ? `${inputClass} border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-100`
  : inputClass;

function FormField({
  label,
  error,
  wide = false,
  children,
}) {
  return (
    <label
      className={`grid gap-1.5 ${
        wide
          ? "sm:col-span-2"
          : ""
      }`}
    >
      <span className="text-[11px] font-medium text-gray-600">
        {label}
      </span>

      {children}

      <span
        className={`min-h-[14px] text-[10px] font-medium leading-[14px] ${
          error ? "text-red-500" : "invisible"
        }`}
        role={error ? "alert" : undefined}
        aria-hidden={!error}
      >
        {error || "No error"}
      </span>
    </label>
  );
}
