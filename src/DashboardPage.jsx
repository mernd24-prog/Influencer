import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgeIndianRupee, RefreshCw, ShoppingBag, TrendingUp, WalletCards } from "lucide-react";
import { api, endpoints, unwrap } from "./api";

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const money = (value) => `₹${fmt.format(Number(value || 0))}`;
const integer = (value) => fmt.format(Number(value || 0));
const STATUS_COLORS = { completed:"#37B446",available:"#37B446",pending:"#D6A323",locked:"#E79A12",cancelled:"#FF453D",refunded:"#24B8C3",reversed:"#777487" };
const cards = [
  ["totalReferralOrders","Referral Orders",ShoppingBag,"#e7edff","#0f4bb3",integer],
  ["totalSalesAmount","Referral Sales",TrendingUp,"#e4f4e2","#1d9b50",money],
  ["totalAvailableCoins","Available Coins",WalletCards,"#eee5ff","#8d5cf6",integer],
  ["monthlyEarnings","Monthly Earnings",BadgeIndianRupee,"#fff0d2","#e79a12",integer],
  ["pendingWithdrawalAmount","Pending Withdrawal",WalletCards,"#ffe3e1","#ff4b55",integer],
  ["lifetimeEarnings","Lifetime Earnings",BadgeIndianRupee,"#dff7f3","#149f91",integer],
];

export default function DashboardPage({ session }){
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  const load=useCallback(async()=>{setLoading(true);setError("");try{setData(unwrap(await api.get(endpoints.dashboard)));}catch(err){setError(err?.response?.data?.message||"Unable to load dashboard.");}finally{setLoading(false);}},[]);
  useEffect(()=>{load();},[load]);
  const summary=data?.summaryCards||{};const earnings=data?.charts?.dailyEarnings||[];const statuses=data?.charts?.orderStatus||[];const total=statuses.reduce((sum,item)=>sum+Number(item.value||0),0);
  return <><div className="page-heading"><div><h1>Dashboard</h1><p>Welcome back, {session.influencerType === "parent" ? "Growth Partner" : "Brand Associate"}. Here is your referral performance.</p></div><button className="button secondary" onClick={load}><RefreshCw size={15} className={loading?"spin":""}/>Refresh</button></div>
    {error?<div className="state-card error-state">{error}</div>:<>
      <div className="dashboard-card-grid">{cards.map(([key,label,Icon,bg,color,format])=><article className="dashboard-stat-card" key={key}><div className="stat-icon" style={{background:bg,color}}><Icon size={21}/></div><div><span>{label}</span><strong>{format(summary[key])}</strong><small>Live referral data</small></div></article>)}</div>
      <div className="dashboard-chart-grid"><ChartCard title="Performance Overview"><div className="chart-legend"><i className="green"/>Earnings <i className="gold"/>Transactions</div><div className="rechart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={earnings} margin={{top:10,right:12,left:-16,bottom:0}}><defs><linearGradient id="earningFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#37B446" stopOpacity=".34"/><stop offset="95%" stopColor="#37B446" stopOpacity=".06"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#EADFCE"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:"#777487",fontSize:9}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#777487",fontSize:9}}/><Tooltip/><Area type="monotone" dataKey="coins" name="Earnings" stroke="#37B446" strokeWidth={2} fill="url(#earningFill)"/><Area type="monotone" dataKey="entries" name="Transactions" stroke="#D6A323" strokeWidth={2} fill="transparent"/></AreaChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Order Status"><div className="donut-wrap"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statuses} dataKey="value" nameKey="status" innerRadius={48} outerRadius={72}>{statuses.map((row)=><Cell key={row.status} fill={STATUS_COLORS[row.status]||"#1F1B5F"}/>)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{total}</strong><span>Total Orders</span></div></div><div className="status-legend">{statuses.slice(0,5).map((row)=><div key={row.status}><i style={{background:STATUS_COLORS[row.status]||"#1F1B5F"}}/><span>{row.status}</span><strong>{row.value}</strong></div>)}</div></div></ChartCard></div>
      <section className="table-card dashboard-table"><div className="table-toolbar"><div><h2>Recent Referral Orders</h2><span>Latest orders attributed to your referral codes</span></div></div><div className="table-scroll"><table><thead><tr><th>Order</th><th>Referral Code</th><th>Order Amount</th><th>Customer Discount</th><th>Coin Status</th><th>Order Date</th></tr></thead><tbody>{(data?.recentOrders||[]).length?(data.recentOrders.map((row)=><tr key={row.id||row._id||row.orderId}><td>{row.orderId}</td><td>{row.code}</td><td>{money(row.orderAmount ?? row.eligibleAmount)}</td><td>{money(row.customerDiscount ?? row.discountAmount)}</td><td><span className={`status-pill ${row.status}`}>{String(row.status||"—").replaceAll("_"," ")}</span></td><td>{row.orderDate||row.createdAt?new Date(row.orderDate||row.createdAt).toLocaleDateString("en-IN"):"—"}</td></tr>)):<tr><td className="empty-cell" colSpan="6">No referral orders found</td></tr>}</tbody></table></div></section>
    </>}
  </>;
}
function ChartCard({title,children}){return <section className="admin-chart-card"><div className="admin-chart-title"><h2>{title}</h2></div>{children}</section>}
