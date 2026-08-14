import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Coins, Copy, Eye, IndianRupee, Plus, RefreshCw, Search, Share2, ShoppingBag, UserRound, Users, WalletCards, X } from "lucide-react";
import { api, endpoints, unwrap } from "./api";
import "./associate.css";

const number = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0));
const date = (value) => value ? new Date(value).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const words = (value) => String(value || "—").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const rowsFrom = (data) => Array.isArray(data) ? data : data?.items || data?.children || [];
const get = (row, key) => key.split(".").reduce((value, part) => value?.[part], row);
const copyText = async (value) => {
  const text = String(value ?? "");
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text; input.setAttribute("readonly", "");
  input.style.position = "fixed"; input.style.opacity = "0";
  document.body.appendChild(input); input.select();
  document.execCommand("copy"); input.remove();
};
const columnSets = {
  codes: [
    ["code","Code"],["status","Status","status"],["usageCount","Uses","number"],
    ["totalOrdersFromCode","Orders","number"],["totalSalesAmount","Sales","amount"],
    ["totalCoinsEarned","Coins Earned","number"],
  ],
  orders: [
    ["orderId","Order"],["code","Code"],["relationship","Source","status"],
    ["orderAmount","Order Value","amount"],["yourEarning","Your Coins","number"],
    ["status","Coin Status","status"],["orderDate","Date","date"],
  ],
  earnings: [
    ["transactionType","Transaction","status"],["direction","Credit / Debit","status"],
    ["coins","Coins","number"],["commissionType","Reason","status"],
    ["status","Status","status"],["transactionDate","Date","date"],
  ],
  bonuses: [
    ["rule.ruleName","Target"],["cycleKey","Period"],["progressDisplay","Progress"],
    ["rewardDisplay","Reward"],["displayStatus","Status","status"],["periodEnd","Ends On","date"],
  ],
  network: [
    ["displayName","Associate"],["primaryCode.code","Code"],["status","Status","status"],
    ["performance.totalOrders","Orders","number"],["performance.totalSalesAmount","Sales Amount","amount"],
    ["performance.totalCommissionCoins","Coins Earned","number"],["joinedOn","Joined","date"],
  ],
};
const pageCopy = {
  codes: ["My Referral Codes", "Share these codes and track the orders, sales and coins each code generates."],
  orders: ["Referred Orders", "Orders attributed to your referral codes and the coins you earned."],
  earnings: ["Coin Activity", "Every coin credit, hold, release, withdrawal and reversal in one place."],
  bonuses: ["Bonus Targets", "See what to achieve, your current progress and when rewards are released."],
  network: ["My Associates", "Manage your associates and review their referral performance."],
};
const statusOptions = {
  codes: ["active","inactive","expired","suspended"],
  orders: ["pending","completed","cancelled","refunded","reversed","locked","available"],
  earnings: ["pending","locked","available","payout_requested","paid","reversed","expired"],
  network: ["pending","active","suspended","rejected"],
};
const dateFilterTypes = new Set(["codes","orders","earnings","network"]);
const format = (value, kind) => {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "date") return date(value);
  if (kind === "amount") return `₹${number(value)}`;
  if (kind === "number") return number(value);
  if (kind === "status") return <span className={`status-pill ${String(value).toLowerCase()}`}>{words(value)}</span>;
  return typeof value === "object" ? "Available" : String(value);
};

export default function ResourcePage({ type, title, session }) {
  const [rows, setRows] = useState([]); const [meta, setMeta] = useState({});
  const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1); const [status, setStatus] = useState("");
  const [scope, setScope] = useState("all");
  const [fromDate, setFromDate] = useState(""); const [toDate, setToDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [associateDetail, setAssociateDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, limit: 20, ...(status ? { status } : {}), ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}), ...(type === "orders" && session.influencerType === "parent" ? { scope } : {}) };
      if (type === "bonuses") { delete params.status; delete params.fromDate; delete params.toDate; }
      const response = await api.get(endpoints[type], { params });
      const nextRows = rowsFrom(unwrap(response)).map((row) => type === "bonuses" ? {
        ...row,
        progressDisplay: `${number(row.achievedValue)} / ${number(row.targetValue)} (${number(row.progressPercent)}%)`,
        rewardDisplay: row.rule?.bonusType === "percentage_extra_coins" ? `${number(row.rule?.bonusValue)}% extra coins` : `${number(row.rule?.bonusValue)} coins`,
        displayStatus: row.existingAchievement?.status || (row.achieved ? "achieved" : "in_progress"),
      } : row);
      setRows(nextRows); setMeta(response?.data?.meta || {});
    } catch (requestError) { setError(requestError?.response?.data?.message || "Unable to load data."); }
    finally { setLoading(false); }
  }, [type, page, status, scope, fromDate, toDate, session.influencerType]);
  useEffect(() => { load(); }, [load]);
  const filteredRows = useMemo(() => { const query=search.trim().toLowerCase(); return query ? rows.filter((row)=>JSON.stringify(row).toLowerCase().includes(query)) : rows; }, [rows,search]);
  const columns = columnSets[type] || [];
  const pagination = meta.pagination || {};
  const summary = meta.summary || {};
  const [pageTitle, pageDescription] = pageCopy[type] || [title, "Review your referral activity."];
  const singleCode = type === "codes" && rows.length === 1 ? rows[0] : null;
  const singleAssociate = type === "network" && rows.length === 1 ? rows[0] : null;
  const copyCode = async (code) => {
    await copyText(code);
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(""), 1800);
  };
  const shareCode = async (row) => {
    const text = row?.share?.shareText || `Use my referral code ${row?.code}`;
    if (navigator.share) {
      await navigator.share({ title: "My referral code", text });
      return;
    }
    await copyText(text);
    setCopiedCode(row?.code);
    window.setTimeout(() => setCopiedCode(""), 1800);
  };
  const openDetails = async (row) => {
    setSelected(row);
    if (type !== "network" || !row?.id) return;
    setDetailLoading(true); setAssociateDetail(null);
    try {
      setAssociateDetail(unwrap(await api.get(endpoints.networkChild(row.id), { params: { ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}) } })));
    } catch (requestError) {
      setAssociateDetail({ error: requestError?.response?.data?.message || "Unable to load associate tracking." });
    } finally { setDetailLoading(false); }
  };
  return <><div className="page-heading"><div><h1>{pageTitle}</h1><p>{pageDescription}</p></div><div className="heading-actions">{type === "network" && session.canCreateChildren && <button className="button gold" onClick={()=>setShowCreate(true)}><Plus size={15}/>Add Associate</button>}<button className="button secondary" onClick={load}><RefreshCw size={15} className={loading?"spin":""}/>Refresh</button></div></div>
    {type === "orders" && <div className="module-counts">{(session.influencerType === "parent" ? [["Total orders",pagination.total||0],["Order value on this page",summary.orderAmount||0],["Your coins",summary.yourEarnings||0],["Associate coins",summary.childEarnings||0]] : [["Total orders",pagination.total||0],["Order value on this page",summary.orderAmount||0],["Your coins",summary.yourEarnings||0]]).map(([name,value])=><div key={name}><span>{name}</span><strong>{number(value)}</strong></div>)}</div>}
    {type === "network" && !singleAssociate && <div className="module-counts">{[["Associates",summary.directChildren||0],["Associate orders",summary.totalChildOrders||0],["Referral sales",summary.totalChildSales||0],["Associate coins",summary.totalChildCommission||0],["Customers",summary.customerCount||0]].map(([name,value])=><div key={name}><span>{name}</span><strong>{number(value)}</strong></div>)}</div>}
    {type === "codes" && !loading && !error && singleCode ? <section className="single-code-card">
      <div className="single-code-primary"><span>Your referral code</span><strong>{singleCode.code}</strong><div className="single-code-actions"><button type="button" className="button gold" onClick={()=>copyCode(singleCode.code)}>{copiedCode === singleCode.code ? <Check size={15}/> : <Copy size={15}/>} {copiedCode === singleCode.code ? "Copied" : "Copy code"}</button><button type="button" className="button secondary" onClick={()=>shareCode(singleCode)}><Share2 size={15}/>Share</button></div><small>Share this code with customers. Eligible orders will be credited automatically.</small></div>
      <div className="single-code-performance">{[["Status",<span className={`status-pill ${singleCode.status}`}>{words(singleCode.status)}</span>],["Code uses",number(singleCode.usageCount)],["Referred orders",number(singleCode.totalOrdersFromCode)],["Referral sales",`₹${number(singleCode.totalSalesAmount)}`],["Coins earned",number(singleCode.totalCoinsEarned)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    </section> : type === "bonuses" && !loading && !error && rows.length ? <section className="bonus-target-grid">{rows.map((row)=><article className={`bonus-target-card ${row.displayStatus}`} key={`${row.rule?._id}-${row.cycleKey}`}><div className="bonus-target-head"><div><span>{words(row.rule?.targetType)}</span><h2>{row.rule?.ruleName}</h2></div><span className={`status-pill ${row.displayStatus}`}>{words(row.displayStatus)}</span></div><div className="bonus-progress-line"><span style={{width:`${Math.min(Number(row.progressPercent||0),100)}%`}}/></div><div className="bonus-progress-values"><strong>{number(row.achievedValue)} of {number(row.targetValue)}</strong><span>{number(row.progressPercent)}%</span></div><div className="bonus-target-meta"><div><span>Reward</span><strong>{row.rewardDisplay}</strong></div><div><span>Period</span><strong>{row.cycleKey}</strong></div><div><span>Ends</span><strong>{date(row.periodEnd)}</strong></div></div></article>)}</section> : type === "network" && !loading && !error && singleAssociate ? <section className="associate-summary-card"><div className="associate-identity"><div className="associate-avatar">{String(singleAssociate.displayName||"A").slice(0,1).toUpperCase()}</div><div><span>Your associate</span><h2>{singleAssociate.displayName||"Associate"}</h2><p>{singleAssociate.primaryCode?.code||"No referral code"}</p></div><span className={`status-pill ${singleAssociate.status}`}>{words(singleAssociate.status)}</span></div><div className="associate-performance">{[["Orders",number(singleAssociate.performance?.totalOrders)],["Referral sales",`₹${number(singleAssociate.performance?.totalSalesAmount)}`],["Coins earned",number(singleAssociate.performance?.totalCommissionCoins)],["Customers",number(singleAssociate.performance?.customerCount)],["Joined",date(singleAssociate.joinedOn)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="button secondary associate-detail-button" onClick={()=>openDetails(singleAssociate)}><Eye size={14}/>View associate details</button></section> : <section className="table-card"><div className="resource-table-heading"><div><strong>{pageTitle}</strong><span>{pagination.total || rows.length} records</span></div></div><div className="module-filters"><div className="search-box"><Search size={16}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search this page"/></div>{type === "orders" && session.influencerType === "parent" && <select aria-label="Order source" value={scope} onChange={(event)=>{setPage(1);setScope(event.target.value)}}><option value="all">All referred orders</option><option value="own">My codes only</option><option value="children">Associate codes only</option></select>}{statusOptions[type]&&<select aria-label="Status" value={status} onChange={(event)=>{setPage(1);setStatus(event.target.value)}}><option value="">All statuses</option>{statusOptions[type].map((item)=><option key={item} value={item}>{words(item)}</option>)}</select>}{dateFilterTypes.has(type)&&<><label>From<input type="date" value={fromDate} onChange={(event)=>{setPage(1);setFromDate(event.target.value)}}/></label><label>To<input type="date" value={toDate} onChange={(event)=>{setPage(1);setToDate(event.target.value)}}/></label></>}</div>
      {error?<div className="state-card error-state">{error}<button className="button secondary" onClick={load}>Try again</button></div>:loading?<LoadingTable/>:<div className="table-scroll"><table><thead><tr>{columns.map(([key,label])=><th key={key}>{label}</th>)}<th>Details</th></tr></thead><tbody>{filteredRows.length?filteredRows.map((row,index)=><tr key={row.orderId||row.code||row.id||index}>{columns.map(([key,,kind])=><td key={key} title={typeof get(row,key) === "string" ? get(row,key) : undefined}>{format(get(row,key),kind)}</td>)}<td><button className="view-action" onClick={()=>openDetails(row)}><Eye size={14}/>View</button></td></tr>):<tr><td colSpan={columns.length+1} className="empty-cell">{search ? "No matching records on this page" : `No ${pageTitle.toLowerCase()} yet`}</td></tr>}</tbody></table></div>}
      <div className="table-pagination"><span>Page {pagination.page||page} of {pagination.totalPages||1} · {pagination.total||rows.length} records</span><div><button disabled={page<=1||loading} onClick={()=>setPage((value)=>value-1)}>Previous</button><button disabled={page>=(pagination.totalPages||1)||loading} onClick={()=>setPage((value)=>value+1)}>Next</button></div></div></section>}
    {selected&&(type === "network" ? <AssociateDetailModal data={associateDetail} loading={detailLoading} onClose={()=>{setSelected(null);setAssociateDetail(null)}}/> : <div className="modal-backdrop" onMouseDown={()=>setSelected(null)}><div className="detail-modal" onMouseDown={(event)=>event.stopPropagation()}><div className="modal-header"><div><h2>{title} Details</h2><span>Complete record information</span></div><button className="icon-action" onClick={()=>setSelected(null)}><X size={17}/></button></div><div className="details-grid">{columns.map(([key,label,kind])=><CopyDetail key={key} label={label} value={format(get(selected,key),kind)} raw={get(selected,key)}/>)}</div></div></div>)}
    {showCreate&&<AssociateForm onClose={()=>setShowCreate(false)} onCreated={()=>{setShowCreate(false);setPage(1);load()}}/>}
  </>;
}
function LoadingTable(){return <div className="loading-card"><div/><div/><div/><div/></div>}

function CopyDetail({label,value,raw}){const copyable=["string","number"].includes(typeof raw)&&String(raw).trim();return <div className="copy-detail"><span>{label}</span><strong>{value}</strong>{copyable&&<button type="button" title={`Copy ${label}`} onClick={()=>copyText(raw)}><Copy size={12}/></button>}</div>}

function AssociateDetailModal({data,loading,onClose}){const[tab,setTab]=useState("overview");const associate=data?.associate||{};const performance=data?.performance||{};const wallet=data?.wallet||{};const tabs=[["overview","Overview"],["orders",`Orders (${data?.recentOrders?.length||0})`],["coins",`Coin Activity (${data?.recentCoinActivity?.length||0})`],["bonuses",`Bonuses (${data?.bonusTargets?.length||0})`]];return <div className="modal-backdrop associate-drawer-backdrop" onMouseDown={onClose}><div className="detail-modal associate-tracking-modal" onMouseDown={(event)=>event.stopPropagation()}>{loading?<LoadingTable/>:data?.error?<><div className="modal-header"><h2>Associate Tracking</h2><button className="icon-action" onClick={onClose}><X size={17}/></button></div><div className="state-card error-state">{data.error}</div></>:<><header className="associate-detail-hero"><div className="associate-detail-avatar"><UserRound size={28}/></div><div className="associate-detail-name"><span>Brand Associate</span><h2>{associate.displayName||"Associate"}</h2><div><strong>{associate.primaryCode?.code||"No code"}</strong><button onClick={()=>copyText(associate.primaryCode?.code)} title="Copy referral code"><Copy size={12}/></button><span className={`status-pill ${associate.status}`}>{words(associate.status)}</span></div></div><button className="associate-close" onClick={onClose}><X size={18}/></button></header><div className="associate-readiness">{[["KYC",associate.kycStatus],["Payout profile",associate.payoutProfileStatus],["Joined",date(associate.joinedOn)]].map(([label,value])=><div key={label}><span>{label}</span><strong className={label!=="Joined"?`status-pill ${value}`:""}>{label==="Joined"?value:words(value)}</strong></div>)}</div><div className="associate-kpi-grid">{[[ShoppingBag,"Orders",performance.totalOrders],[IndianRupee,"Referral sales",`₹${number(performance.totalSalesAmount)}`],[Users,"Customers",performance.customerCount],[Coins,"Coins earned",performance.totalCommissionCoins]].map(([Icon,label,value])=><article key={label}><Icon size={18}/><div><span>{label}</span><strong>{value??0}</strong></div></article>)}</div><nav className="associate-detail-tabs">{tabs.map(([key,label])=><button key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}>{label}</button>)}</nav><div className="associate-tab-content">{tab==="overview"&&<><section className="associate-info-section"><div className="associate-section-heading"><h3>Contact & account</h3><span>Click the copy icon for reusable values</span></div><div className="details-grid">{[["Influencer ID",associate.id],["Email",associate.email],["Phone",associate.phone],["Referral code",associate.primaryCode?.code],["Account status",associate.status],["Onboarding",associate.onboardingStatus]].map(([label,value])=><CopyDetail key={label} label={label} value={value||"—"} raw={value}/>)}</div></section><section className="associate-info-section"><div className="associate-section-heading"><h3><WalletCards size={15}/> Wallet position</h3><span>Current coin balances</span></div><div className="wallet-position-grid">{[["Available",wallet.availableCoins],["Locked",wallet.lockedCoins],["In payout",wallet.reservedCoins],["Paid",wallet.withdrawnCoins],["Reversed",wallet.reversedCoins],["Expired",wallet.expiredCoins]].map(([label,value])=><div key={label}><span>{label}</span><strong>{number(value)}</strong></div>)}</div></section></>}{tab==="orders"&&<TrackingTable title="Recent referred orders" rows={data?.recentOrders||[]} columns={[["orderId","Order"],["code","Code"],["orderAmount","Value","amount"],["status","Referral status","status"],["orderStatus","Order status","status"],["paymentStatus","Payment","status"],["orderDate","Date","date"]]}/>} {tab==="coins"&&<TrackingTable title="Recent coin activity" rows={data?.recentCoinActivity||[]} columns={[["transactionType","Transaction","status"],["direction","Credit / Debit","status"],["coins","Coins","number"],["commissionType","Reason","status"],["status","Status","status"],["transactionDate","Date","date"]]}/>} {tab==="bonuses"&&<section className="associate-info-section"><div className="associate-section-heading"><h3>Bonus targets</h3><span>Current achievement cycle</span></div><div className="tracking-bonuses">{(data?.bonusTargets||[]).length?data.bonusTargets.map((row)=><div key={`${row.rule?._id}-${row.cycleKey}`}><div><strong>{row.rule?.ruleName}</strong><small>{row.cycleKey} · {number(row.rule?.bonusValue)} {row.rule?.bonusType==="percentage_extra_coins"?"% extra coins":"coins reward"}</small></div><span>{number(row.achievedValue)} / {number(row.targetValue)} · {number(row.progressPercent)}%</span></div>):<p>No active bonus targets.</p>}</div></section>}</div></>}</div></div>}
function TrackingTable({title,rows,columns}){return <section><h3>{title}</h3><div className="table-scroll"><table><thead><tr>{columns.map(([,label])=><th key={label}>{label}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={row.orderId||row.id||index}>{columns.map(([key,,kind])=><td key={key}>{format(row[key],kind)}</td>)}</tr>):<tr><td className="empty-cell" colSpan={columns.length}>No activity found</td></tr>}</tbody></table></div></section>}

function AssociateForm({onClose,onCreated}) {
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",code:""});
  const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const [created,setCreated]=useState(null);
  const update=(event)=>setForm((value)=>({...value,[event.target.name]:event.target.value}));
  const submit=async(event)=>{event.preventDefault();setSaving(true);setError("");try{const payload=Object.fromEntries(Object.entries(form).filter(([,value])=>String(value).trim()!==""));setCreated(unwrap(await api.post(endpoints.createBrandAssociate,payload)));}catch(requestError){setError(requestError?.response?.data?.message||"Unable to create brand associate.");}finally{setSaving(false)}};
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="detail-modal create-associate-modal" onMouseDown={(event)=>event.stopPropagation()}><div className="modal-header"><div><h2>Add Brand Associate</h2><span>Create login access under your growth-partner account</span></div><button className="icon-action" onClick={onClose}><X size={17}/></button></div>{created?<div className="created-credentials"><h3>Brand Associate Created</h3><p>Share these temporary credentials securely. The associate can update their profile after login.</p><div><span>Email</span><strong>{form.email}</strong></div><div><span>Temporary Password</span><strong>{created.temporaryPassword||"Sent/configured by the system"}</strong></div><button className="button gold" onClick={onCreated}>Done</button></div>:<form className="associate-form" onSubmit={submit}><div className="form-grid"><label className="field"><span>First Name *</span><input name="firstName" value={form.firstName} onChange={update} required minLength="2"/></label><label className="field"><span>Last Name</span><input name="lastName" value={form.lastName} onChange={update}/></label><label className="field"><span>Email Address *</span><input type="email" name="email" value={form.email} onChange={update} required/></label><label className="field"><span>Phone Number</span><input name="phone" value={form.phone} onChange={update} pattern="\+?[0-9]{7,15}"/></label><label className="field wide"><span>Referral Code (optional)</span><input name="code" value={form.code} onChange={update} placeholder="Automatically generated if empty"/></label></div>{error&&<div className="form-message error-state">{error}</div>}<div className="form-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button gold" disabled={saving}>{saving?"Creating…":"Create Associate"}</button></div></form>}</div></div>;
}
