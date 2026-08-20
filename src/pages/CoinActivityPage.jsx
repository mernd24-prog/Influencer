import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
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
    limit,
    setLimit,

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

      <SectionCard
        title="Coin Transaction History"
        subtitle="View and track all coin transactions linked to your referral activity."
      >
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
          pageSize={limit}
          setPageSize={setLimit}
          loading={loading}
          error={error}
          onRetry={load}
        />
      </SectionCard>
    </>
  );
}
