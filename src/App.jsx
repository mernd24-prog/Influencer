import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api, endpoints, tokens, unwrap } from "./api";
import Panel from "./Panel";
import { getAllowedPanelModules, getDefaultPanelRoute } from "./panelConfig";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(
      Boolean(tokens.access())
    );

  const loadSession =
    useCallback(async () => {
      if (!tokens.access()) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response =
          unwrap(
            await api.get(
              endpoints.session,
              { globalLoader: true },
            )
          );

        setSession(response);
      } catch {
        tokens.clear();
        setSession(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loading) {
    return null;
  }

  const home = session
    ? getDefaultPanelRoute(
        getAllowedPanelModules(
          session
        )
      )
    : "/login";

  const handleLogout = () => {
    tokens.clear();
    setSession(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate
              to={home}
              replace
            />
          ) : (
            <LoginPage
              onLogin={
                loadSession
              }
            />
          )
        }
      />

      <Route
        path="/register"
        element={session ? <Navigate to={home} replace /> : <RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={
          session ? <Navigate to={home} replace /> : <ForgotPasswordPage />
        }
      />

      <Route
        path="/app/*"
        element={
          session ? (
            <Panel
              session={session}
              onLogout={
                handleLogout
              }
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={home}
            replace
          />
        }
      />
    </Routes>
  );
}
