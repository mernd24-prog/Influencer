import {
  BadgeIndianRupee,
  ShoppingBag,
  TrendingUp,
  WalletCards,
} from "lucide-react";

// ========================================
// Common Status Colors
// ========================================

export const STATUS_COLORS = {
  completed: "#37B446",
  available: "#37B446",
  pending: "#D6A323",
  locked: "#E79A12",
  cancelled: "#FF453D",
  refunded: "#24B8C3",
  reversed: "#777487",
};

// ========================================
// Dashboard Summary Cards
// ========================================

export const DASHBOARD_CARDS = [
  {
    key: "totalReferralOrders",
    label: "Referral Orders",
    icon: ShoppingBag,
    iconBg: "#E7EDFF",
    iconColor: "#0F4BB3",
    format: "integer",
    subtitle: "Total Referral Orders",
  },
  {
    key: "totalSalesAmount",
    label: "Referral Sales",
    icon: TrendingUp,
    iconBg: "#E4F4E2",
    iconColor: "#1D9B50",
    format: "money",
    subtitle: "Total Sales Amount",
  },
  {
    key: "totalAvailableCoins",
    label: "Available Coins",
    icon: WalletCards,
    iconBg: "#EEE5FF",
    iconColor: "#8D5CF6",
    format: "integer",
    subtitle: "Available Balance",
  },
  {
    key: "monthlyEarnings",
    label: "Monthly Earnings",
    icon: BadgeIndianRupee,
    iconBg: "#FFF0D2",
    iconColor: "#E79A12",
    format: "money",
    subtitle: "This Month",
  },
  {
    key: "pendingWithdrawalAmount",
    label: "Pending Withdrawal",
    icon: WalletCards,
    iconBg: "#FFE3E1",
    iconColor: "#FF4B55",
    format: "money",
    subtitle: "Pending Amount",
  },
  {
    key: "lifetimeEarnings",
    label: "Lifetime Earnings",
    icon: BadgeIndianRupee,
    iconBg: "#DFF7F3",
    iconColor: "#149F91",
    format: "money",
    subtitle: "Total Earnings",
  },
];

export const RESOURCE_COLUMNS = {
  codes: [
    ["code", "Code"],
    ["status", "Status", "status"],
    ["usageCount", "Uses", "number"],
    ["totalOrdersFromCode", "Orders", "number"],
    ["totalSalesAmount", "Sales", "amount"],
    ["totalCoinsEarned", "Coins Earned", "number"],
  ],

  orders: [
    ["orderId", "Order"],
    ["code", "Code"],
    ["relationship", "Source", "status"],
    ["orderAmount", "Order Value", "amount"],
    ["yourEarning", "Your Coins", "number"],
    ["status", "Coin Status", "status"],
    ["orderDate", "Date", "date"],
  ],

  earnings: [
    ["transactionType", "Transaction", "status"],
    ["direction", "Credit / Debit", "status"],
    ["coins", "Coins", "number"],
    ["commissionType", "Reason", "status"],
    ["status", "Status", "status"],
    ["transactionDate", "Date", "date"],
  ],

  network: [
    ["displayName", "Associate"],
    ["primaryCode.code", "Code"],
    ["status", "Status", "status"],
    ["performance.totalOrders", "Orders", "number"],
    [
      "performance.totalSalesAmount",
      "Sales Amount",
      "amount",
    ],
    [
      "performance.totalCommissionCoins",
      "Coins Earned",
      "number",
    ],
    ["joinedOn", "Joined", "date"],
  ],
};

export const RESOURCE_STATUS_OPTIONS = {
  codes: [
    "active",
    "inactive",
    "expired",
    "suspended",
  ],

  orders: [
    "pending",
    "completed",
    "cancelled",
    "refunded",
    "reversed",
    "locked",
    "available",
  ],

  earnings: [
    "pending",
    "locked",
    "available",
    "payout_requested",
    "paid",
    "reversed",
    "expired",
  ],

  network: [
    "pending",
    "active",
    "suspended",
    "rejected",
  ],
};