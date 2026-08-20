import {
  Check,
  Copy,
  Share2,
} from "lucide-react";

import {
  useState,
} from "react";

import PageHeader from "../components/PageHeader";
import ResourceFilters from "../components/ResourceFilters";
import ResourceTable from "../components/ResourceTable";

import useResourceList from "../hooks/useResourceList";

import {
  RESOURCE_COLUMNS,
} from "../data/appData";

import {
  copyText,
  formatLabel,
  formatMoney,
  formatNumber,
  getStatusClass,
} from "../utils/helper";

export default function ReferralCodesPage() {
  const [copiedCode, setCopiedCode] =
    useState("");

  const resource =
    useResourceList("codes");

  const {
    rows,
    filteredRows,
    meta,
    loading,
    error,

    search,
    setSearch,

    page,
    setPage,

    status,
    setStatus,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    load,
  } = resource;

  const singleCode =
    rows.length === 1
      ? rows[0]
      : null;

  const copyCode = async (code) => {
    await copyText(code);

    setCopiedCode(code);

    window.setTimeout(
      () => setCopiedCode(""),
      1800
    );
  };

  const shareCode = async (row) => {
    const text =
      row?.share?.shareText ||
      `Use my referral code ${row?.code}`;

    if (navigator.share) {
      await navigator.share({
        title: "My referral code",
        text,
      });

      return;
    }

    await copyText(text);

    setCopiedCode(row?.code);

    window.setTimeout(
      () => setCopiedCode(""),
      1800
    );
  };

  return (
    <>
      <PageHeader
        title="My Referral Codes"
        subtitle="Share these codes and track the orders, sales and coins each code generates."
        loading={loading}
        onRefresh={load}
      />

      {!loading &&
      !error &&
      singleCode ? (
        <section className="mb-5 overflow-hidden rounded-xl border border-[#eadfce] bg-white">
          <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_2fr]">
            <div className="rounded-lg bg-[#fff8e9] p-5">
              <span className="text-[11px] font-medium uppercase text-gray-500">
                Your referral code
              </span>

              <strong className="mt-2 block text-[28px] font-bold tracking-[0.12em] text-[#211b62]">
                {singleCode.code}
              </strong>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      singleCode.code
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#dca719] px-4 text-[11px] font-semibold text-white transition hover:bg-[#c79715]"
                >
                  {copiedCode ===
                  singleCode.code ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}

                  {copiedCode ===
                  singleCode.code
                    ? "Copied"
                    : "Copy Code"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    shareCode(
                      singleCode
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Share2 size={15} />

                  Share
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-gray-500">
                Share this referral code
                with customers to track
                referred orders, sales,
                and earned coins.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <InfoBox
                label="Status"
                value={
                  <span
                    className={getStatusClass(
                      singleCode.status
                    )}
                  >
                    {formatLabel(
                      singleCode.status
                    )}
                  </span>
                }
              />

              <InfoBox
                label="Code Uses"
                value={formatNumber(
                  singleCode.usageCount
                )}
              />

              <InfoBox
                label="Orders"
                value={formatNumber(
                  singleCode
                    .totalOrdersFromCode
                )}
              />

              <InfoBox
                label="Referral Sales"
                value={formatMoney(
                  singleCode
                    .totalSalesAmount
                )}
              />

              <InfoBox
                label="Coins Earned"
                value={formatNumber(
                  singleCode
                    .totalCoinsEarned
                )}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white">
          <ResourceFilters
            type="codes"
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            setPage={setPage}
          />

          <ResourceTable
            columns={
              RESOURCE_COLUMNS.codes
            }
            rows={filteredRows}
            pageTitle="Referral Codes"
            pagination={
              meta.pagination || {}
            }
            page={page}
            setPage={setPage}
            loading={loading}
            error={error}
            onRetry={load}
          />
        </section>
      )}
    </>
  );
}

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <span className="text-[11px] font-medium uppercase text-gray-500">
        {label}
      </span>

      <strong className="mt-2 block text-[16px] font-semibold text-gray-800">
        {value}
      </strong>
    </div>
  );
}