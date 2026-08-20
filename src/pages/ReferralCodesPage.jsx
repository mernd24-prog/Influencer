import {
  Check,
  CircleDollarSign,
  Copy,
  MousePointerClick,
  Share2,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
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
    limit,
    setLimit,

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
    const copied = await copyText(code);
    if (!copied) return;

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

    const copied = await copyText(text);
    if (!copied) return;

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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <InfoBox
                label="Status"
                icon={ShieldCheck}
                tone="emerald"
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
                icon={MousePointerClick}
                value={formatNumber(
                  singleCode.usageCount
                )}
              />

              <InfoBox
                label="Orders"
                icon={ShoppingBag}
                tone="indigo"
                value={formatNumber(
                  singleCode
                    .totalOrdersFromCode
                )}
              />

              <InfoBox
                label="Referral Sales"
                icon={CircleDollarSign}
                tone="gold"
                value={formatMoney(
                  singleCode
                    .totalSalesAmount
                )}
              />

              <InfoBox
                label="Coins Earned"
                icon={CircleDollarSign}
                tone="gold"
                value={formatNumber(
                  singleCode
                    .totalCoinsEarned
                )}
              />
            </div>
          </div>
        </section>
      ) : (
        <SectionCard>
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
            pageSize={limit}
            setPageSize={setLimit}
            loading={loading}
            error={error}
            onRetry={load}
          />
        </SectionCard>
      )}
    </>
  );
}

function InfoBox({
  label,
  value,
  icon: Icon,
  tone = "navy",
}) {
  const tones = {
    navy: "bg-[#f1efff] text-[#211b62]",
    indigo: "bg-indigo-50 text-indigo-600",
    gold: "bg-[#fff4d9] text-[#c48c0c]",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="group relative min-h-[128px] overflow-hidden rounded-xl border border-[#e8e4da] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#dca719]/40 hover:shadow-[0_8px_20px_rgba(31,27,95,0.06)]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={17} strokeWidth={1.9} />
      </div>
      <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400">
        {label}
      </span>
      <strong className="mt-1.5 block text-[18px] font-semibold leading-tight text-[#211b62]">
        {value}
      </strong>
      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#dca719] transition-transform duration-200 group-hover:scale-x-100" />
    </div>
  );
}
