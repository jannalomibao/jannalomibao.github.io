import { useEffect, useState } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Shared by every public page that fetches from frontend/src/api/ (Projects,
// ProjectDetail, Blog, BlogDetail, Resume, Home's featured section) — plain
// fetch-in-effect, no React Query, matching docs/05-user-stories.md 7.2's
// stated approach. `error` is the raw Error (not just a message) so callers
// can narrow on `instanceof ApiError` to distinguish 404 from other failures.
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // `deps` is the caller-supplied dependency list by design (this hook wraps arbitrary
  // fetchers) — oxlint's exhaustive-deps check can't statically verify a non-literal array, so
  // it warns here regardless of placement; expected and harmless for this generic-hook shape.
  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
