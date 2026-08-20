import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  api,
  endpoints,
  unwrap,
} from "../api";

import PageHeader from "../components/PageHeader";
import { SkeletonGrid } from "../components/Skeleton";
import NoDataState from "../components/NoDataState";

import {
  formatDate,
  formatLabel,
  formatNumber,
  getStatusClass,
  rowsFrom,
} from "../utils/helper";

export default function BonusTargetsPage() {
  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          endpoints.bonuses
        );

      setRows(
        rowsFrom(
          unwrap(response)
        ).map((row) => ({
          ...row,

          displayStatus:
            row.existingAchievement
              ?.status ||
            (row.achieved
              ? "achieved"
              : "in_progress"),
        }))
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load bonus targets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Bonus Targets"
        subtitle="See what to achieve, your current progress and when rewards are released."
        loading={loading}
        onRefresh={load}
      />

      {/* Error State */}

      {error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] font-medium text-red-600">
          {error}
        </div>
      ) : loading ? (
        /* Loading State */

        <SkeletonGrid
          count={3}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          itemClassName="h-[200px]"
        />
      ) : rows.length ? (
        /* Bonus Cards */

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <article
              key={`${row.rule?._id}-${row.cycleKey}`}
              className="rounded-xl border border-[#eadfce] bg-white p-5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
            >
              {/* Card Header */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#d09a0b]">
                    {formatLabel(
                      row.rule?.targetType
                    )}
                  </span>

                  <h2 className="mt-1.5 text-[15px] font-semibold leading-5 text-[#211b62]">
                    {
                      row.rule?.ruleName
                    }
                  </h2>
                </div>

                <span
                  className={getStatusClass(
                    row.displayStatus
                  )}
                >
                  {formatLabel(
                    row.displayStatus
                  )}
                </span>
              </div>

              {/* Progress */}

              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#dca719] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        Number(
                          row.progressPercent ||
                            0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <strong className="text-[12px] font-semibold text-gray-700">
                    {formatNumber(
                      row.achievedValue
                    )}{" "}
                    of{" "}
                    {formatNumber(
                      row.targetValue
                    )}
                  </strong>

                  <span className="text-[11px] font-semibold text-[#d09a0b]">
                    {formatNumber(
                      row.progressPercent
                    )}
                    %
                  </span>
                </div>
              </div>

              {/* Bonus Details */}

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                <Info
                  label="Reward"
                  value={
                    row.rule
                      ?.bonusType ===
                    "percentage_extra_coins"
                      ? `${formatNumber(
                          row.rule
                            ?.bonusValue
                        )}% extra coins`
                      : `${formatNumber(
                          row.rule
                            ?.bonusValue
                        )} coins`
                  }
                />

                <Info
                  label="Period"
                  value={
                    row.cycleKey
                  }
                />

                <Info
                  label="Ends"
                  value={formatDate(
                    row.periodEnd
                  )}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */

        <div className="overflow-hidden rounded-xl border border-[#eadfce] bg-white">
          <NoDataState message="No active bonus targets" />
        </div>
      )}
    </>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <strong className="mt-1.5 block break-words text-[12px] font-semibold leading-5 text-gray-700">
        {value}
      </strong>
    </div>
  );
}
