import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api, endpoints, tokens, unwrap } from "./api";
import LoginPage from "./LoginPage";
import Panel from "./Panel";
import { getAllowedPanelModules, getDefaultPanelRoute } from "./panelConfig";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokens.access()));

  const loadSession = useCallback(async () => {
    if (!tokens.access()) { setLoading(false); return; }
    try { setSession(unwrap(await api.get(endpoints.session))); }
    catch { tokens.clear(); setSession(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);
  if (loading) return <div className="center">Loading influencer workspace…</div>;
  const home = session
    ? getDefaultPanelRoute(getAllowedPanelModules(session))
    : "/login";

  return <Routes>
    <Route path="/login" element={session ? <Navigate to={home} replace /> : <LoginPage onLogin={loadSession} />} />
    <Route path="/app/*" element={session ? <Panel session={session} onLogout={() => { tokens.clear(); setSession(null); }} /> : <Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to={home} replace />} />
  </Routes>;
}
