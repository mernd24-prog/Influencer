import { useCallback, useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api, endpoints, unwrap } from "../api";

import SummaryCard from "../components/SummaryCard";
import NoDataState from "../components/NoDataState";
import PageHeader from "../components/PageHeader";

import {
  DASHBOARD_CARDS,
  STATUS_COLORS,
} from "../data/appData";

const fmt = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const money = (value) =>
  `₹${fmt.format(Number(value || 0))}`;

const integer = (value) =>
  fmt.format(Number(value || 0));

const formatCardValue = (value, type) =>
  type === "money"
    ? money(value)
    : integer(value);

export default function DashboardPage({
  session,
}) {
  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = unwrap(
        await api.get(
          endpoints.dashboard
        )
      );

      setData(response);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary =
    data?.summaryCards || {};

  const earnings =
    data?.charts?.dailyEarnings || [];

  const statuses =
    data?.charts?.orderStatus || [];

  const recentOrders =
    data?.recentOrders || [];

  const total = statuses.reduce(
    (sum, item) =>
      sum +
      Number(item.value || 0),
    0
  );

  const partnerName =
    session?.influencerType ===
    "parent"
      ? "Growth Partner"
      : "Brand Associate";

  return (
    <>
      {/* Page Header */}

      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${partnerName}. Here is your referral performance.`}
        loading={loading}
        onRefresh={load}
      />

      {error ? (
        <div className="state-card error-state text-[13px]">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {DASHBOARD_CARDS.map(
              (card) => (
                <SummaryCard
                  key={card.key}
                  title={card.label}
                  value={formatCardValue(
                    summary[
                      card.key
                    ],
                    card.format
                  )}
                  icon={card.icon}
                  iconBg={
                    card.iconBg
                  }
                  iconColor={
                    card.iconColor
                  }
                  subtitle={
                    card.subtitle
                  }
                />
              )
            )}
          </div>

          {/* Charts */}

          <div className="dashboard-chart-grid">
            {/* Performance Overview */}

            <ChartCard
              title="Performance Overview"
              subtitle="Daily earnings and referral transactions"
            >
              <div className="mb-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-[#37B446]" />
                  Earnings
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-[#D6A323]" />
                  Transactions
                </div>
              </div>

              <div className="rechart">
                {earnings.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={earnings}
                      margin={{
                        top: 12,
                        right: 12,
                        left: -12,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="earningFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#37B446"
                            stopOpacity=".30"
                          />

                          <stop
                            offset="95%"
                            stopColor="#37B446"
                            stopOpacity=".03"
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#EADFCE"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill: "#777487",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill: "#777487",
                          fontSize: 11,
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

                      <Area
                        type="monotone"
                        dataKey="coins"
                        name="Earnings"
                        stroke="#37B446"
                        strokeWidth={
                          2.2
                        }
                        fill="url(#earningFill)"
                      />

                      <Area
                        type="monotone"
                        dataKey="entries"
                        name="Transactions"
                        stroke="#D6A323"
                        strokeWidth={
                          2.2
                        }
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataState
                    message="No performance data available"
                    className="min-h-full"
                  />
                )}
              </div>
            </ChartCard>

            {/* Order Status */}

            <ChartCard
              title="Order Status"
              subtitle="Referral order distribution"
            >
              {statuses.length ? (
                <div className="donut-wrap">
                  <div className="donut">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={
                            statuses
                          }
                          dataKey="value"
                          nameKey="status"
                          innerRadius={
                            50
                          }
                          outerRadius={
                            74
                          }
                          paddingAngle={
                            2
                          }
                        >
                          {statuses.map(
                            (
                              row
                            ) => (
                              <Cell
                                key={
                                  row.status
                                }
                                fill={
                                  STATUS_COLORS[
                                    row
                                      .status
                                  ] ||
                                  "#1F1B5F"
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            borderRadius:
                              "8px",
                            border:
                              "1px solid #EADFCE",
                            fontSize:
                              "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="donut-center">
                      <strong className="!text-[24px]">
                        {integer(
                          total
                        )}
                      </strong>

                      <span className="!text-[11px]">
                        Total Orders
                      </span>
                    </div>
                  </div>

                  <div className="status-legend !gap-2.5">
                    {statuses
                      .slice(0, 5)
                      .map(
                        (
                          row
                        ) => (
                          <div
                            key={
                              row.status
                            }
                          >
                            <i
                              style={{
                                background:
                                  STATUS_COLORS[
                                    row
                                      .status
                                  ] ||
                                  "#1F1B5F",
                              }}
                            />

                            <span className="!text-[11px]">
                              {String(
                                row.status ||
                                  "—"
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                            <strong className="!text-[12px]">
                              {integer(
                                row.value
                              )}
                            </strong>
                          </div>
                        )
                      )}
                  </div>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-[12px] font-medium text-gray-400">
                  No order status
                  data available
                </div>
              )}
            </ChartCard>
          </div>

          {/* Recent Referral Orders */}

          <section className="table-card dashboard-table overflow-hidden">
            <div className="table-toolbar !px-5 !py-4">
              <div>
                <h2 className="!text-[15px] !font-semibold">
                  Recent Referral
                  Orders
                </h2>

                <span className="!mt-1 !text-[11px]">
                  Latest orders
                  attributed to your
                  referral codes
                </span>
              </div>

              {recentOrders.length >
                0 && (
                <div className="rounded-full bg-[#fff8e9] px-3 py-1.5 text-[10px] font-semibold text-[#9c741e]">
                  {
                    recentOrders.length
                  }{" "}
                  Recent
                </div>
              )}
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="!text-[11px]">
                      Order
                    </th>

                    <th className="!text-[11px]">
                      Referral Code
                    </th>

                    <th className="!text-[11px]">
                      Order Amount
                    </th>

                    <th className="!text-[11px]">
                      Customer
                      Discount
                    </th>

                    <th className="!text-[11px]">
                      Coin Status
                    </th>

                    <th className="!text-[11px]">
                      Order Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length ? (
                    recentOrders.map(
                      (
                        row
                      ) => (
                        <tr
                          key={
                            row.id ||
                            row._id ||
                            row.orderId
                          }
                        >
                          <td className="!text-[12px] !font-medium !text-[#211b62]">
                            {row.orderId ||
                              "—"}
                          </td>

                          <td className="!text-[12px]">
                            <span className="rounded-md bg-[#f5f3ff] px-2 py-1 font-medium text-[#5147a5]">
                              {row.code ||
                                "—"}
                            </span>
                          </td>

                          <td className="!text-[12px] !font-medium">
                            {money(
                              row.orderAmount ??
                                row.eligibleAmount
                            )}
                          </td>

                          <td className="!text-[12px]">
                            {money(
                              row.customerDiscount ??
                                row.discountAmount
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-pill ${
                                row.status ||
                                ""
                              } !px-2.5 !py-1 !text-[10px]`}
                            >
                              {String(
                                row.status ||
                                  "—"
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </span>
                          </td>

                          <td className="!text-[12px]">
                            {row.orderDate ||
                            row.createdAt
                              ? new Date(
                                  row.orderDate ||
                                    row.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month:
                                      "short",
                                    year:
                                      "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="h-[160px] text-center !text-[12px] font-medium text-gray-400"
                      >
                        No referral
                        orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="admin-chart-card transition-shadow duration-200 hover:shadow-sm">
      <div className="admin-chart-title !mb-4">
        <div>
          <h2 className="!text-[15px] !font-semibold">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[11px] text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}