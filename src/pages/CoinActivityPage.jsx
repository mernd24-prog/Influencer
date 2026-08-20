import PageHeader from "../components/PageHeader";
import ResourceFilters from "../components/ResourceFilters";
import ResourceTable from "../components/ResourceTable";

import useResourceList from "../hooks/useResourceList";

import {
  RESOURCE_COLUMNS,
} from "../data/appData";

export default function CoinActivityPage() {
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

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    load,
  } = useResourceList("earnings");

  const pagination =
    meta.pagination || {};

  return (
    <>
      <PageHeader
        title="Coin Activity"
        subtitle="Every coin credit, hold, release, withdrawal and reversal in one place."
        loading={loading}
        onRefresh={load}
      />

      {/* Coin Activity Table */}

      <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white shadow-[0_1px_3px_rgba(31,27,95,0.04)]">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#211b62]">
            Coin Transaction History
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            View and track all coin transactions linked to your referral activity.
          </p>
        </div>

        <ResourceFilters
          type="earnings"
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
            RESOURCE_COLUMNS.earnings
          }
          rows={filteredRows}
          pageTitle="Coin Activity"
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