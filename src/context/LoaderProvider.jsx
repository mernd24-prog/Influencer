import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Loader from "../components/Loading";
import { subscribeToApiLoading } from "../api";

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const [apiRequests, setApiRequests] = useState(0);
  const [manualRequests, setManualRequests] = useState(0);
  const manualRequestsRef = useRef(0);

  useLayoutEffect(
    () => subscribeToApiLoading(setApiRequests),
    [],
  );

  const showLoader = useCallback(() => {
    manualRequestsRef.current += 1;
    setManualRequests(manualRequestsRef.current);

    let finished = false;
    return () => {
      if (finished) return;
      finished = true;
      manualRequestsRef.current = Math.max(0, manualRequestsRef.current - 1);
      setManualRequests(manualRequestsRef.current);
    };
  }, []);

  const withLoader = useCallback(async (operation) => {
    const hideLoader = showLoader();
    try {
      return await operation();
    } finally {
      hideLoader();
    }
  }, [showLoader]);

  const value = useMemo(() => ({
    loading: apiRequests + manualRequests > 0,
    showLoader,
    withLoader,
  }), [apiRequests, manualRequests, showLoader, withLoader]);

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <Loader loading={value.loading} fullScreen />
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used inside LoaderProvider.");
  }
  return context;
}
