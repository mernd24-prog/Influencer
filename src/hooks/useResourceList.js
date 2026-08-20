import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  api,
  endpoints,
  unwrap,
} from "../api";

import {
  rowsFrom,
} from "../utils/helper";

export default function useResourceList(
  type,
  additionalParams = {}
) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [status, setStatus] =
    useState("");

  const [scope, setScope] =
    useState("all");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: 20,

        ...(status
          ? { status }
          : {}),

        ...(fromDate
          ? { fromDate }
          : {}),

        ...(toDate
          ? { toDate }
          : {}),

        ...additionalParams,
      };

      const response = await api.get(
        endpoints[type],
        {
          params,
        }
      );

      setRows(
        rowsFrom(unwrap(response))
      );

      setMeta(
        response?.data?.meta || {}
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  }, [
    type,
    page,
    status,
    fromDate,
    toDate,
    JSON.stringify(additionalParams),
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      JSON.stringify(row)
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  return {
    rows,
    setRows,

    filteredRows,

    meta,

    loading,
    error,

    search,
    setSearch,

    page,
    setPage,

    status,
    setStatus,

    scope,
    setScope,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    load,
  };
}