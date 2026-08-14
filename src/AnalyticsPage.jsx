import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCw } from "lucide-react";
import { api, endpoints, unwrap } from "./api";

const fmt = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0));
const label = (key) => String(key).replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
const summaryLabels = {
  totalReferralOrders: "Referral orders",
  totalSalesAmount: "Referral sales",
  totalAvailableCoins: "Available coins",
  monthlyEarnings: "Coins earned this month",
  lifetimeEarnings: "Lifetime coins",
  pendingWithdrawalAmount: "Coins in payout process",
};

export default function AnalyticsPage({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(unwrap(await api.get(endpoints.analytics))); }
    catch (requestError) { setError(requestError?.response?.data?.message || "Unable to load performance."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const codes = (data?.codePerformance || []).map((row) => ({
    code: row.code,
    orders: Number(row.totalOrdersFromCode || row.usageCount || 0),
    sales: Number(row.totalSalesAmount || 0),
    earnings: Number(row.totalCoinsEarned || 0),
  }));
  const singleCode = codes.length === 1 ? codes[0] : null;

  return <>
    <div className="page-heading"><div><h1>Performance</h1><p>{session.influencerType === "parent" ? "Your referral results, including associate activity." : "Your referral orders, sales and coin performance."}</p></div><button className="button secondary" onClick={load}><RefreshCw size={15} className={loading ? "spin" : ""}/>Refresh</button></div>
    {error ? <div className="state-card error-state">{error}<button className="button secondary" onClick={load}>Try again</button></div> : <>
      <div className="dashboard-card-grid analytics-cards">{Object.entries(data?.summary || {}).filter(([key]) => summaryLabels[key]).slice(0, 6).map(([key, value]) => <article className="dashboard-stat-card" key={key}><div><span>{summaryLabels[key]}</span><strong>{fmt(value)}</strong></div></article>)}</div>
      {singleCode ? <section className="single-performance-card"><div><span>Referral code</span><strong>{singleCode.code}</strong><small>Because you have one code, its performance is shown directly instead of as a comparison chart.</small></div><div>{[["Orders", singleCode.orders],["Referral sales", `₹${fmt(singleCode.sales)}`],["Coins earned", singleCode.earnings]].map(([name,value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div></section> : codes.length > 1 ? <section className="admin-chart-card"><div className="admin-chart-title"><h2>Compare Referral Codes</h2><span>Orders, sales and earnings by code</span></div><div className="rechart analytics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={codes}><CartesianGrid vertical={false} stroke="#EADFCE"/><XAxis dataKey="code" axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#777487"}}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#777487"}}/><Tooltip/><Bar dataKey="orders" fill="#37B446" radius={[4,4,0,0]}/><Bar dataKey="earnings" fill="#D6A323" radius={[4,4,0,0]}/><Bar dataKey="sales" fill="#1F1B5F" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></section> : <div className="state-card">Performance will appear after your first referred order.</div>}
      {data?.networkSummary && <section className="details-card spaced-card"><div className="section-title"><h2>Associate Performance</h2><span>Combined activity from your team</span></div><div className="details-grid">{Object.entries(data.networkSummary).map(([key,value]) => <div key={key}><span>{label(key)}</span><strong>{fmt(value)}</strong></div>)}</div></section>}
    </>}
  </>;
}
