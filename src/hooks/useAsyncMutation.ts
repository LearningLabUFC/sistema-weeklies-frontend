import { useCallback, useEffect, useRef, useState } from 'react';

import { type ApiErrorDetail, parseApiError } from '@/lib/errorHandler';

export interface UseAsyncMutationOptions<TResult> {
  onSuccess?: (data: TResult) => void;
  onError?: (error: ApiErrorDetail) => void;
}

export function useAsyncMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options?: UseAsyncMutationOptions<TResult>,
) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<ApiErrorDetail | null>(null);
  const mutationFnRef = useRef(mutationFn);
  const optionsRef = useRef(options);

  useEffect(() => {
    mutationFnRef.current = mutationFn;
    optionsRef.current = options;
  });

  const isExecutingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      // Bloqueia clique repetido / duplo envio enquanto uma operação estiver pendente
      if (!isMountedRef.current || isExecutingRef.current) {
        return null;
      }

      isExecutingRef.current = true;
      setIsMutating(true);
      setError(null);

      try {
        const result = await mutationFnRef.current(...args);
        if (!isMountedRef.current) return null;
        optionsRef.current?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        if (!isMountedRef.current) return null;
        const parsed = parseApiError(err);
        setError(parsed);
        optionsRef.current?.onError?.(parsed);
        return null;
      } finally {
        isExecutingRef.current = false;
        if (isMountedRef.current) setIsMutating(false);
      }
    },
    [],
  );

  return {
    execute,
    isMutating,
    error,
    resetError,
  };
}
