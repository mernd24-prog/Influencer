import { useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import {
  BarChart3, BadgeIndianRupee, ChevronLeft, ChevronRight, Gift,
  LayoutDashboard, LogOut, Menu, Network, ReceiptText, Tag, UserRound,
  WalletCards, X,
} from "lucide-react";
import ResourcePage from "./ResourcePage";
import AnalyticsPage from "./AnalyticsPage";
import DashboardPage from "./DashboardPage";
import WithdrawalsPage from "./WithdrawalsPage";
import ProfilePage from "./ProfilePage";
import { getAllowedPanelModules, getDefaultPanelRoute, PANEL_MODE } from "./panelConfig";

const icons = { dashboard: LayoutDashboard, codes: Tag, orders: ReceiptText, earnings: BadgeIndianRupee, wallet: WalletCards, bonuses: Gift, analytics: BarChart3, profile: UserRound, network: Network };

export default function Panel({ session, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const modules = getAllowedPanelModules(session);
  const defaultRoute = getDefaultPanelRoute(modules).replace("/app/", "");
  const closeMobile = () => setMobileOpen(false);

  return <div className={`panel-shell admin-shell ${collapsed ? "sidebar-collapsed" : ""}`} data-panel-mode={PANEL_MODE}>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={closeMobile} />}
    <aside className={`panel-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand">
        {!collapsed && <NavLink to="/app/dashboard" className="brand-logo"><div className="brand-monogram">SG</div><strong>SAM GLOBAL</strong><span>Enterprise Solutions</span></NavLink>}
        {collapsed && <button className="sidebar-expand" onClick={() => setCollapsed(false)}><ChevronRight size={20}/></button>}
        <button className="mobile-close" onClick={closeMobile}><X size={18} /></button>
      </div>
      <nav className="panel-nav">
        {modules.map((item) => { const Icon = icons[item.key] || LayoutDashboard; return <NavLink key={item.key} to={item.route} onClick={closeMobile} title={collapsed ? item.label : undefined}><Icon size={19} /><span>{item.label}</span></NavLink>; })}
      </nav>
      {!collapsed && <button className="collapse-button" onClick={() => setCollapsed(true)}><ChevronLeft size={18}/><span>Collapse sidebar</span></button>}
    </aside>
    <section className="panel-main">
      <header className="topbar">
        <button className="menu-button desktop-menu" onClick={() => setCollapsed((value) => !value)}><Menu size={19} /></button>
        <button className="menu-button mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
        <div className="header-title"><strong>Referral Partner Portal</strong></div>
        <div className="header-search"><SearchIcon/><input placeholder="Search" aria-label="Search panel"/></div>
        <div className="topbar-profile"><div className="avatar"><UserRound size={18} /></div><div><strong>{session.influencerType === "parent" ? "Growth Partner" : "Brand Associate"}</strong><span>{session.primaryCode?.code || session.status}</span></div></div>
        <button className="header-logout" onClick={onLogout} title="Sign out"><LogOut size={18}/></button>
      </header>
      <main className="content admin-content"><div className="page-transition"><Routes>
        {modules.map((item) => {
          const page = item.key === "dashboard"
            ? <DashboardPage session={session} />
            : item.key === "wallet"
              ? <WithdrawalsPage />
            : item.key === "profile"
            ? <ProfilePage session={session} />
            : item.key === "analytics"
              ? <AnalyticsPage session={session} />
              : <ResourcePage type={item.key} title={item.label} session={session} />;
          return <Route key={item.key} path={item.route.replace("/app/", "")} element={page} />;
        })}
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes></div></main>
    </section>
  </div>;
}

function SearchIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>}
