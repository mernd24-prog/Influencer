import PageHeader from "../components/PageHeader";
import ResourceFilters from "../components/ResourceFilters";
import ResourceTable from "../components/ResourceTable";
import SummaryCard from "../components/SummaryCard";

import useResourceList from "../hooks/useResourceList";

import {
  RESOURCE_COLUMNS,
} from "../data/appData";

import {
  formatMoney,
  formatNumber,
} from "../utils/helper";

export default function ReferredOrdersPage({
  session,
}) {
  const resource = useResourceList(
    "orders",
    session?.influencerType === "parent"
      ? {
          scope: undefined,
        }
      : {}
  );

  const {
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

    scope,
    setScope,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    load,
  } = resource;

  const pagination =
    meta.pagination || {};

  const summary =
    meta.summary || {};

  const cards =
    session?.influencerType === "parent"
      ? [
          {
            title: "Total Orders",
            value: formatNumber(
              pagination.total
            ),
          },
          {
            title: "Order Value",
            value: formatMoney(
              summary.orderAmount
            ),
          },
          {
            title: "Your Coins",
            value: formatNumber(
              summary.yourEarnings
            ),
          },
          {
            title: "Associate Coins",
            value: formatNumber(
              summary.childEarnings
            ),
          },
        ]
      : [
          {
            title: "Total Orders",
            value: formatNumber(
              pagination.total
            ),
          },
          {
            title: "Order Value",
            value: formatMoney(
              summary.orderAmount
            ),
          },
          {
            title: "Your Coins",
            value: formatNumber(
              summary.yourEarnings
            ),
          },
        ];

  return (
    <>
      <PageHeader
        title="Referred Orders"
        subtitle="Orders attributed to your referral codes and the coins you earned."
        loading={loading}
        onRefresh={load}
      />

      {/* Summary Cards */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
          />
        ))}
      </div>

      {/* Orders Table */}

      <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white shadow-[0_1px_3px_rgba(31,27,95,0.04)]">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#211b62]">
            Referral Order Details
          </h2>

          <p className="mt-1 text-[11px] text-gray-500">
            Review orders generated through your referral codes and track earned coins.
          </p>
        </div>

        <ResourceFilters
          type="orders"
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          scope={scope}
          setScope={setScope}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          setPage={setPage}
          showScope={
            session?.influencerType === "parent"
          }
        />

        <ResourceTable
          columns={
            RESOURCE_COLUMNS.orders
          }
          rows={filteredRows}
          pageTitle="Referred Orders"
          pagination={pagination}
          page={page}
          setPage={setPage}
          loading={loading}
          error={error}
          onRetry={load}
        />
      </section>
    </>
  );
}