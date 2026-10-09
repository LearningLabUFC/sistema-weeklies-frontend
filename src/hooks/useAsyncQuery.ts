import { useCallback, useEffect, useRef, useState } from 'react';

import { type ApiErrorDetail, parseApiError } from '@/lib/errorHandler';

export interface UseAsyncQueryOptions<TResult> {
  enabled?: boolean;
  onSuccess?: (data: TResult) => void;
  onError?: (error: ApiErrorDetail) => void;
}

export function useAsyncQuery<TResult>(
  queryFn: () => Promise<TResult>,
  options?: UseAsyncQueryOptions<TResult>,
) {
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiErrorDetail | null>(null);

  // Evita race condition se queryFn mudar ou componente desmontar
  const queryIdRef = useRef(0);

  // Mantém referências estáveis de options e queryFn para evitar loops
  const optionsRef = useRef(options);
  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    optionsRef.current = options;
    queryFnRef.current = queryFn;
  });

  const fetchData = useCallback(async (): Promise<TResult | null> => {
    const currentId = ++queryIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFnRef.current();
      if (currentId === queryIdRef.current) {
        setData(result);
        optionsRef.current?.onSuccess?.(result);
      }
      return result;
    } catch (err: unknown) {
      if (currentId === queryIdRef.current) {
        const parsed = parseApiError(err);
        setError(parsed);
        optionsRef.current?.onError?.(parsed);
      }
      return null;
    } finally {
      if (currentId === queryIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        void fetchData();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchData, enabled, queryFn]);

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
  };
}
