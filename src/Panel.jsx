import { useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import {
  BarChart3,
  BadgeIndianRupee,
  ChevronRight,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  ReceiptText,
  Tag,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import ReferralCodesPage from "./pages/ReferralCodesPage";
import ReferredOrdersPage from "./pages/ReferredOrdersPage";
import CoinActivityPage from "./pages/CoinActivityPage";
import BonusTargetsPage from "./pages/BonusTargetsPage";
import AssociatesPage from "./pages/AssociatesPage";
import ProfilePage from "./pages/ProfilePage";

import {
  getAllowedPanelModules,
  getDefaultPanelRoute,
  PANEL_MODE,
} from "./panelConfig";

import BrandLogo from "./components/BrandLogo";

const icons = {
  dashboard: LayoutDashboard,
  codes: Tag,
  orders: ReceiptText,
  earnings: BadgeIndianRupee,
  wallet: WalletCards,
  bonuses: Gift,
  analytics: BarChart3,
  profile: UserRound,
  network: Network,
};

export default function Panel({
  session,
  onLogout,
}) {
  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const modules =
    getAllowedPanelModules(session);

  const defaultRoute =
    getDefaultPanelRoute(
      modules
    ).replace("/app/", "");

  const closeMobile = () =>
    setMobileOpen(false);

  return (
    <div
      className={`panel-shell admin-shell ${
        collapsed
          ? "sidebar-collapsed"
          : ""
      }`}
      data-panel-mode={PANEL_MODE}
    >
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`panel-sidebar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >
        {/* Sidebar Top */}
        <div className="sidebar-brand relative">
          {!collapsed ? (
            <BrandLogo
              clickable
              to="/app/dashboard"
              className="h-[90px] w-[210px] rounded-md border border-[#dca719] bg-white shadow-[0_3px_8px_rgba(31,27,95,0.08)]"
              logoClassName="text-[28px]"
              titleClassName="mt-1 text-[13px] tracking-[0.13em]"
              subtitleClassName="mt-0.5 text-[7px] tracking-[0.08em]"
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                setCollapsed(false)
              }
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="absolute left-1/2 top-4 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#211b62] shadow-sm transition hover:border-[#dca719] hover:bg-[#fff8e9]"
            >
              <ChevronRight
                size={19}
                strokeWidth={2}
              />
            </button>
          )}

          {/* Mobile Close */}
          <button
            type="button"
            className="mobile-close"
            onClick={closeMobile}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="panel-nav">
          {modules.map((item) => {
            const Icon =
              icons[item.key] ||
              LayoutDashboard;

            return (
              <NavLink
                key={item.key}
                to={item.route}
                onClick={closeMobile}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <section className="panel-main">
        {/* Topbar */}
        <header className="topbar">
          {/* Desktop Collapse Button */}
          {!collapsed && (
            <button
              type="button"
              className="menu-button desktop-menu"
              onClick={() =>
                setCollapsed(true)
              }
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <Menu size={19} />
            </button>
          )}

          {/* Mobile Menu */}
          <button
            type="button"
            className="menu-button mobile-menu"
            onClick={() =>
              setMobileOpen(true)
            }
            aria-label="Open sidebar"
          >
            <Menu size={19} />
          </button>

          {/* Header Title */}
          <div className="header-title">
            <strong>
              Referral Partner Portal
            </strong>
          </div>

          {/* Search */}
          <div className="header-search">
            <SearchIcon />

            <input
              placeholder="Search"
              aria-label="Search panel"
            />
          </div>

          {/* Profile */}
          <div className="topbar-profile">
            <div className="avatar">
              <UserRound size={18} />
            </div>

            <div>
              <strong>
                {session.influencerType ===
                "parent"
                  ? "Growth Partner"
                  : "Brand Associate"}
              </strong>

              <span>
                {session.primaryCode?.code ||
                  session.status}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="header-logout"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="content admin-content">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5">
            <div className="page-transition">
              <Routes>
                {modules.map((item) => {
                  const page =
                    item.key === "dashboard" ? (
                      <DashboardPage
                        session={session}
                      />
                    ) : item.key === "codes" ? (
                      <ReferralCodesPage
                        session={session}
                      />
                    ) : item.key === "orders" ? (
                      <ReferredOrdersPage
                        session={session}
                      />
                    ) : item.key === "earnings" ? (
                      <CoinActivityPage
                        session={session}
                      />
                    ) : item.key === "bonuses" ? (
                      <BonusTargetsPage
                        session={session}
                      />
                    ) : item.key === "network" ? (
                      <AssociatesPage
                        session={session}
                      />
                    ) : item.key === "wallet" ? (
                      <WithdrawalsPage />
                    ) : item.key === "profile" ? (
                      <ProfilePage
                        session={session}
                      />
                    ) : item.key === "analytics" ? (
                      <AnalyticsPage
                        session={session}
                      />
                    ) : null;

                  return (
                    <Route
                      key={item.key}
                      path={item.route.replace(
                        "/app/",
                        ""
                      )}
                      element={page}
                    />
                  );
                })}

                <Route
                  path="*"
                  element={
                    <Navigate
                      to={defaultRoute}
                      replace
                    />
                  }
                />
              </Routes>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}