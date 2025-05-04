import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/utils/const";

export interface UseVideosFetchOptions {
  apiUrl: string;
  pageSize?: number;
  lazyload?: boolean;
}

export interface UseVideosFetchResult<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  search: string;
  onSearch: (value: string) => void;
  loadMore: () => void;
  reset: () => void;
}

export function useVideosFetch<T = unknown>(
  options: UseVideosFetchOptions
): UseVideosFetchResult<T> {
  const { apiUrl, pageSize = DEFAULT_PAGE_SIZE } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: String(page * pageSize),
        limit: String(pageSize),
        q: search,
      });
      const res = await fetch(`${apiUrl}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result: T[] = await res.json();
      setData((prev) => (page === 0 ? result : [...prev, ...result]));
      setHasMore(result.length === pageSize);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
  }, []);

  const onSearch = (value: string) => {
    reset();
    setSearch(value);
  };

  return {
    data,
    loading,
    hasMore,
    search,
    onSearch,
    loadMore,
    reset,
  };
}
