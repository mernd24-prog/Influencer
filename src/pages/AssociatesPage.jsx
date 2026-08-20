import { useState } from "react";

import PageHeader from "../components/PageHeader";
import ResourceFilters from "../components/ResourceFilters";
import ResourceTable from "../components/ResourceTable";
import SummaryCard from "../components/SummaryCard";

import AssociateDetailModal from "../components/AssociateDetailModal";
import AssociateForm from "../components/AssociateForm";

import useResourceList from "../hooks/useResourceList";

import {
  RESOURCE_COLUMNS,
} from "../data/appData";

import {
  api,
  endpoints,
  unwrap,
} from "../api";

import {
  formatMoney,
  formatNumber,
} from "../utils/helper";

export default function AssociatesPage({
  session,
}) {
  const resource =
    useResourceList("network");

  const [selected, setSelected] =
    useState(null);

  const [
    associateDetail,
    setAssociateDetail,
  ] = useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    showCreate,
    setShowCreate,
  ] = useState(false);

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
  } = resource;

  const summary =
    meta.summary || {};

  const openDetails = async (
    row
  ) => {
    setSelected(row);

    if (!row?.id) {
      return;
    }

    setDetailLoading(true);
    setAssociateDetail(null);

    try {
      setAssociateDetail(
        unwrap(
          await api.get(
            endpoints.networkChild(
              row.id
            ),
            {
              params: {
                ...(fromDate
                  ? { fromDate }
                  : {}),

                ...(toDate
                  ? { toDate }
                  : {}),
              },
            }
          )
        )
      );
    } catch (requestError) {
      setAssociateDetail({
        error:
          requestError?.response?.data?.message ||
          "Unable to load associate tracking.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const cards = [
    {
      title: "Associates",
      value: formatNumber(
        summary.directChildren
      ),
    },

    {
      title: "Associate Orders",
      value: formatNumber(
        summary.totalChildOrders
      ),
    },

    {
      title: "Referral Sales",
      value: formatMoney(
        summary.totalChildSales
      ),
    },

    {
      title: "Associate Coins",
      value: formatNumber(
        summary.totalChildCommission
      ),
    },

    {
      title: "Customers",
      value: formatNumber(
        summary.customerCount
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Associates"
        subtitle="Manage your associates and review their referral performance."
        loading={loading}
        onRefresh={load}
        actionLabel={
          session?.canCreateChildren
            ? "Add Associate"
            : undefined
        }
        onAction={() =>
          setShowCreate(true)
        }
      />

      {/* Summary Cards */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
          />
        ))}
      </div>

      {/* Associates Table */}

      <section className="overflow-hidden rounded-xl border border-[#eadfce] bg-white shadow-[0_1px_3px_rgba(31,27,95,0.04)]">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#211b62]">
            Associate Details
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            Review your associates, referral activity, sales, coins, and customer performance.
          </p>
        </div>

        <ResourceFilters
          type="network"
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
            RESOURCE_COLUMNS.network
          }
          rows={filteredRows}
          pageTitle="Associates"
          pagination={
            meta.pagination || {}
          }
          page={page}
          setPage={setPage}
          loading={loading}
          error={error}
          onRetry={load}
          onView={openDetails}
        />
      </section>

      {/* Associate Details */}

      {selected && (
        <AssociateDetailModal
          data={associateDetail}
          loading={detailLoading}
          onClose={() => {
            setSelected(null);
            setAssociateDetail(null);
          }}
        />
      )}

      {/* Add Associate */}

      {showCreate && (
        <AssociateForm
          onClose={() =>
            setShowCreate(false)
          }
          onCreated={() => {
            setShowCreate(false);
            setPage(1);
            load();
          }}
        />
      )}
    </>
  );
}