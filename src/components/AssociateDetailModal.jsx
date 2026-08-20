import { useState } from "react";

import {
  Coins,
  IndianRupee,
  ShoppingBag,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { TableSkeleton } from "./Skeleton";
import NoDataState from "./NoDataState";
import SectionCard from "./SectionCard";
import SummaryCard from "./SummaryCard";
import CopyButton from "./CopyButton";

import {
  formatDate,
  formatLabel,
  formatNumber,
  formatMoney,
  formatValue,
  getStatusClass,
} from "../utils/helper";

const number = formatNumber;
const date = formatDate;
const words = formatLabel;
const statusClass = getStatusClass;

const format = (value, kind) => {
  if (kind === "amount") {
    return formatMoney(value);
  }

  if (kind === "status") {
    return (
      <span className={statusClass(value)}>
        {words(value)}
      </span>
    );
  }

  return formatValue(value, kind);
};


function CopyDetail({
  label,
  value,
  raw,
}) {
  const copyable =
    ["string", "number"].includes(typeof raw) &&
    String(raw).trim();

  return (
    <div className="relative min-w-0 border-b border-gray-100 p-4">
      <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <strong className="mt-2 block overflow-hidden text-ellipsis pr-10 text-[12px] font-medium text-gray-700">
        {value}
      </strong>

      {copyable && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CopyButton
            value={raw}
            label={label}
          />
        </div>
      )}
    </div>
  );
}

export default function AssociateDetailModal({
  data,
  loading,
  onClose,
}) {
  const [tab, setTab] = useState("overview");

  const associate = data?.associate || {};
  const performance = data?.performance || {};
  const wallet = data?.wallet || {};

  const tabs = [
    ["overview", "Overview"],
    [
      "orders",
      `Orders (${data?.recentOrders?.length || 0})`,
    ],
    [
      "coins",
      `Coin Activity (${data?.recentCoinActivity?.length || 0})`,
    ],
    [
      "bonuses",
      `Bonuses (${data?.bonusTargets?.length || 0})`,
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="h-screen w-full max-w-[980px] overflow-y-auto bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {loading ? (
          <TableSkeleton />
        ) : data?.error ? (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-[17px] font-semibold text-[#211b62]">
                Associate Tracking
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="m-5 rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] font-medium text-red-600">
              {data.error}
            </div>
          </>
        ) : (
          <>
            {/* Header */}

            <header className="flex items-center gap-4 bg-gradient-to-r from-[#211b62] to-[#39327f] px-6 py-5 text-white">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <UserRound size={28} />
              </div>

              <div className="min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wide text-purple-100">
                  Brand Associate
                </span>

                <h2 className="mt-1 text-[20px] font-semibold">
                  {associate.displayName || "Associate"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <strong className="text-[12px] font-semibold tracking-wide">
                    {associate.primaryCode?.code || "No code"}
                  </strong>

                  <CopyButton
                    value={associate.primaryCode?.code}
                    label="referral code"
                    variant="dark"
                  />

                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium capitalize">
                    {words(associate.status)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>

            {/* Status Info */}

            <div className="grid grid-cols-1 border-b border-gray-100 sm:grid-cols-3">
              {[
                [
                  "KYC",
                  associate.kycStatus,
                ],
                [
                  "Payout profile",
                  associate.payoutProfileStatus,
                ],
                [
                  "Joined",
                  date(associate.joinedOn),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-gray-100 px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {label}
                  </span>

                  {label === "Joined" ? (
                    <strong className="text-[12px] font-medium text-gray-700">
                      {value}
                    </strong>
                  ) : (
                    <span
                      className={statusClass(value)}
                    >
                      {words(value)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Performance Cards */}

            <div className="grid grid-cols-1 gap-3 bg-[#f7f8fc] p-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  ShoppingBag,
                  "Orders",
                  performance.totalOrders,
                ],
                [
                  IndianRupee,
                  "Referral sales",
                  `₹${number(
                    performance.totalSalesAmount
                  )}`,
                ],
                [
                  Users,
                  "Customers",
                  performance.customerCount,
                ],
                [
                  Coins,
                  "Coins earned",
                  performance.totalCommissionCoins,
                ],
              ].map(
                ([Icon, label, value]) => (
                  <SummaryCard
                    key={label}
                    title={label}
                    value={value ?? 0}
                    icon={Icon}
                    iconBg="#fff4d9"
                    iconColor="#c48c0c"
                    subtitle="Associate performance"
                  />
                )
              )}
            </div>

            {/* Tabs */}

            <nav className="flex overflow-x-auto border-b border-gray-100 px-5">
              {tabs.map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setTab(key)}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-[12px] font-semibold transition ${
                    tab === key
                      ? "border-[#dca719] text-[#211b62]"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Tab Content */}

            <div className="bg-[#f7f8fc] p-5">
              {tab === "overview" && (
                <>
                  {/* Contact */}

                  <SectionCard
                    className="mb-4"
                    title="Contact & account"
                    actions={<span className="text-[11px] text-gray-400">Use the copy icon for reusable values</span>}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        [
                          "Influencer ID",
                          associate.id,
                        ],
                        [
                          "Email",
                          associate.email,
                        ],
                        [
                          "Phone",
                          associate.phone,
                        ],
                        [
                          "Referral code",
                          associate.primaryCode?.code,
                        ],
                        [
                          "Account status",
                          associate.status,
                        ],
                        [
                          "Onboarding",
                          associate.onboardingStatus,
                        ],
                      ].map(
                        ([label, value]) => (
                          <CopyDetail
                            key={label}
                            label={label}
                            value={value || "—"}
                            raw={value}
                          />
                        )
                      )}
                    </div>
                  </SectionCard>

                  {/* Wallet */}

                  <SectionCard
                    title="Wallet position"
                    icon={<WalletCards size={17} className="mt-0.5 text-[#dca719]" />}
                    actions={<span className="text-[11px] text-gray-400">Current coin balances</span>}
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-6">
                      {[
                        [
                          "Available",
                          wallet.availableCoins,
                        ],
                        [
                          "Locked",
                          wallet.lockedCoins,
                        ],
                        [
                          "In payout",
                          wallet.reservedCoins,
                        ],
                        [
                          "Paid",
                          wallet.withdrawnCoins,
                        ],
                        [
                          "Reversed",
                          wallet.reversedCoins,
                        ],
                        [
                          "Expired",
                          wallet.expiredCoins,
                        ],
                      ].map(
                        ([label, value]) => (
                          <div
                            key={label}
                            className="border-b border-r border-gray-100 p-4"
                          >
                            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              {label}
                            </span>

                            <strong className="mt-2 block text-[17px] font-semibold text-gray-800">
                              {number(value)}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  </SectionCard>
                </>
              )}

              {/* Orders */}

              {tab === "orders" && (
                <TrackingTable
                  title="Recent referred orders"
                  rows={data?.recentOrders || []}
                  columns={[
                    [
                      "orderId",
                      "Order",
                    ],
                    [
                      "code",
                      "Code",
                    ],
                    [
                      "orderAmount",
                      "Value",
                      "amount",
                    ],
                    [
                      "status",
                      "Referral status",
                      "status",
                    ],
                    [
                      "orderStatus",
                      "Order status",
                      "status",
                    ],
                    [
                      "paymentStatus",
                      "Payment",
                      "status",
                    ],
                    [
                      "orderDate",
                      "Date",
                      "date",
                    ],
                  ]}
                />
              )}

              {/* Coins */}

              {tab === "coins" && (
                <TrackingTable
                  title="Recent coin activity"
                  rows={
                    data?.recentCoinActivity ||
                    []
                  }
                  columns={[
                    [
                      "transactionType",
                      "Transaction",
                      "status",
                    ],
                    [
                      "direction",
                      "Credit / Debit",
                      "status",
                    ],
                    [
                      "coins",
                      "Coins",
                      "number",
                    ],
                    [
                      "commissionType",
                      "Reason",
                      "status",
                    ],
                    [
                      "status",
                      "Status",
                      "status",
                    ],
                    [
                      "transactionDate",
                      "Date",
                      "date",
                    ],
                  ]}
                />
              )}

              {/* Bonuses */}

              {tab === "bonuses" && (
                <SectionCard
                  title="Bonus targets"
                  actions={<span className="text-[11px] text-gray-400">Current achievement cycle</span>}
                >
                  <div className="grid gap-3 p-4">
                    {(data?.bonusTargets || [])
                      .length ? (
                      data.bonusTargets.map(
                        (row) => (
                          <div
                            key={`${row.rule?._id}-${row.cycleKey}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                          >
                            <div className="min-w-0">
                              <strong className="text-[12px] font-semibold text-gray-700">
                                {row.rule?.ruleName}
                              </strong>

                              <small className="mt-1 block text-[11px] leading-5 text-gray-400">
                                {row.cycleKey} ·{" "}
                                {number(
                                  row.rule
                                    ?.bonusValue
                                )}{" "}
                                {row.rule
                                  ?.bonusType ===
                                "percentage_extra_coins"
                                  ? "% extra coins"
                                  : "coins reward"}
                              </small>
                            </div>

                            <span className="text-[12px] font-medium text-gray-600">
                              {number(
                                row.achievedValue
                              )}{" "}
                              /{" "}
                              {number(
                                row.targetValue
                              )}{" "}
                              ·{" "}
                              {number(
                                row.progressPercent
                              )}
                              %
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <NoDataState message="No active bonus targets" />
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TrackingTable({
  title,
  rows,
  columns,
}) {
  return (
    <SectionCard title={title}>
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap border-collapse">
          <thead>
            <tr>
              {columns.map(
                ([, label]) => (
                  <th
                    key={label}
                    className="bg-gray-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.orderId ||
                      row.id ||
                      index
                    }
                    className="border-t border-gray-100 transition-colors hover:bg-gray-50/70"
                  >
                    {columns.map(
                      ([
                        key,
                        ,
                        kind,
                      ]) => (
                        <td
                          key={key}
                          className="px-4 py-3 text-[12px] font-medium text-gray-600"
                        >
                          {format(
                            row[key],
                            kind
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length
                  }
                  className="p-0"
                >
                  <NoDataState message="No activity found" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
