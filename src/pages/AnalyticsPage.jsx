import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeIndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { api, endpoints, unwrap } from "../api";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { AnalyticsSkeleton } from "../components/PageSkeletons";

const fmt = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const label = (key) =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase());

const summaryLabels = {
  totalReferralOrders: "Referral orders",
  totalSalesAmount: "Referral sales",
  totalAvailableCoins: "Available coins",
  monthlyEarnings: "Coins earned this month",
  lifetimeEarnings: "Lifetime coins",
  pendingWithdrawalAmount: "Coins in payout process",
};

const summaryIcons = {
  totalReferralOrders: ShoppingBag,
  totalSalesAmount: TrendingUp,
  totalAvailableCoins: WalletCards,
  monthlyEarnings: BadgeIndianRupee,
  lifetimeEarnings: BadgeIndianRupee,
  pendingWithdrawalAmount: WalletCards,
};

export default function AnalyticsPage({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setData(
        unwrap(
          await api.get(endpoints.analytics)
        )
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load performance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const codes = (
    data?.codePerformance || []
  ).map((row) => ({
    code: row.code,

    orders: Number(
      row.totalOrdersFromCode ||
        row.usageCount ||
        0
    ),

    sales: Number(
      row.totalSalesAmount || 0
    ),

    earnings: Number(
      row.totalCoinsEarned || 0
    ),
  }));

  const singleCode =
    codes.length === 1
      ? codes[0]
      : null;

  const summaryEntries = Object.entries(
    data?.summary || {}
  )
    .filter(
      ([key]) =>
        summaryLabels[key]
    )
    .slice(0, 6);

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle={
          session.influencerType === "parent"
            ? "Your referral results, including associate activity."
            : "Your referral orders, sales and coin performance."
        }
        loading={loading}
        onRefresh={load}
      />

      {error ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/60 p-6 text-center">
          <p className="text-[12px] font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {summaryEntries.map(
              ([key, value]) => {
                const Icon =
                  summaryIcons[key] ||
                  TrendingUp;

                return (
                  <article
                    key={key}
                    className="relative min-w-0 overflow-hidden rounded-xl border border-[#eadfce] border-l-[3px] border-l-[#dca719] bg-white p-4 transition hover:-translate-y-[1px] hover:shadow-sm"
                  >
                    <div className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center rounded-bl-xl bg-[#fff4d9] text-[#dca719]">
                      <Icon size={18} />
                    </div>

                    <span className="block max-w-[75%] truncate text-[11px] font-semibold text-gray-600">
                      {summaryLabels[key]}
                    </span>

                    <strong className="mt-2 block text-[20px] font-bold leading-tight text-[#211b62]">
                      {fmt(value)}
                    </strong>

                    <small className="mt-2 block text-[11px] text-gray-400">
                      Live performance data
                    </small>
                  </article>
                );
              }
            )}
          </div>

          {/* Single Referral Code */}

          {singleCode ? (
            <section className="mb-5 overflow-hidden rounded-xl border border-[#eadfce] bg-white">
              <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_2fr]">
                <div className="rounded-xl bg-[#fffaf0] p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Referral Code
                  </span>

                  <strong className="mt-2 block text-[28px] font-bold tracking-[0.12em] text-[#211b62]">
                    {singleCode.code}
                  </strong>

                  <small className="mt-4 block max-w-[350px] text-[11px] leading-5 text-gray-500">
                    Because you have one code, its performance is shown directly instead of as a comparison chart.
                  </small>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    [
                      ShoppingBag,
                      "Orders",
                      singleCode.orders,
                    ],

                    [
                      TrendingUp,
                      "Referral Sales",
                      `₹${fmt(
                        singleCode.sales
                      )}`,
                    ],

                    [
                      BadgeIndianRupee,
                      "Coins Earned",
                      singleCode.earnings,
                    ],
                  ].map(
                    ([
                      Icon,
                      name,
                      value,
                    ]) => (
                      <article
                        key={name}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#dca719] shadow-sm">
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <span className="block text-[11px] font-medium uppercase text-gray-500">
                            {name}
                          </span>

                          <strong className="mt-1 block truncate text-[16px] font-semibold text-gray-800">
                            {value}
                          </strong>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </div>
            </section>
          ) : codes.length > 1 ? (
            /* Multi Code Chart */

            <SectionCard
              className="mb-5"
              title="Compare Referral Codes"
              subtitle="Orders, sales and earnings by code"
            >
              <div className="p-5">
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <Legend
                    color="#37B446"
                    label="Orders"
                  />

                  <Legend
                    color="#D6A323"
                    label="Earnings"
                  />

                  <Legend
                    color="#1F1B5F"
                    label="Sales"
                  />
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={codes}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="#EADFCE"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="code"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#777487",
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#777487",
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius:
                            "8px",
                          border:
                            "1px solid #EADFCE",
                          fontSize:
                            "12px",
                          boxShadow:
                            "0 8px 24px rgba(31,27,95,0.08)",
                        }}
                      />

                      <Bar
                        dataKey="orders"
                        fill="#37B446"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="earnings"
                        fill="#D6A323"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="sales"
                        fill="#1F1B5F"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          ) : (
            /* Empty State */

            <div className="mb-5 flex min-h-[180px] items-center justify-center rounded-xl border border-[#eadfce] bg-white p-6 text-center">
              <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4d9] text-[#dca719]">
                  <TrendingUp
                    size={19}
                  />
                </div>

                <p className="mt-3 text-[12px] font-medium text-gray-500">
                  Performance will appear after your first referred order.
                </p>
              </div>
            </div>
          )}

          {/* Associate Performance */}

          {data?.networkSummary && (
            <SectionCard
              title="Associate Performance"
              subtitle="Combined activity from your team"
              headerClassName="bg-[#fffdf8]"
              icon={
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1efff] text-[#211b62]">
                  <Users size={17} />
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(
                  data.networkSummary
                ).map(
                  ([
                    key,
                    value,
                  ]) => (
                    <div
                      key={key}
                      className="border-b border-r border-gray-100 p-4"
                    >
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        {label(key)}
                      </span>

                      <strong className="mt-2 block text-[16px] font-semibold text-gray-800">
                        {fmt(value)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </>
  );
}

function Legend({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      {label}
    </div>
  );
}
