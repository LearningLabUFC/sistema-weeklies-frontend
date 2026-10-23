import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAsyncQuery } from '@/hooks/useAsyncQuery';

describe('useAsyncQuery', () => {
  it('carrega dados na montagem quando enabled for true', async () => {
    const queryFn = vi.fn().mockResolvedValue({ id: 1, name: 'Setor A' });

    const { result } = renderHook(() => useAsyncQuery(queryFn));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: 'Setor A' });
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('não dispara consultas repetidas ao re-renderizar com nova referência de options inline', async () => {
    const queryFn = vi.fn().mockResolvedValue('ok');

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAsyncQuery(queryFn, { enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    await waitFor(() => {
      expect(result.current.data).toBe('ok');
    });

    expect(queryFn).toHaveBeenCalledTimes(1);

    // Múltiplos re-renders passando um novo objeto { enabled: true }
    rerender({ enabled: true });
    rerender({ enabled: true });
    rerender({ enabled: true });

    // Aguarda para garantir que timers ou effects adicionais não disparam
    await new Promise(r => setTimeout(r, 50));

    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('respeita enabled: false e só executa quando habilitado', async () => {
    const queryFn = vi.fn().mockResolvedValue('resultado-habilitado');

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAsyncQuery(queryFn, { enabled }),
      {
        initialProps: { enabled: false },
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(queryFn).not.toHaveBeenCalled();

    // Habilita
    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current.data).toBe('resultado-habilitado');
    });

    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('re-executa consulta via refetch() manual', async () => {
    const queryFn = vi
      .fn()
      .mockResolvedValueOnce('primeira')
      .mockResolvedValueOnce('segunda');

    const { result } = renderHook(() => useAsyncQuery(queryFn));

    await waitFor(() => {
      expect(result.current.data).toBe('primeira');
    });

    expect(queryFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe('segunda');
    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
