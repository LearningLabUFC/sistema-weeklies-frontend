import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAsyncMutation } from '@/hooks/useAsyncMutation';

describe('useAsyncMutation', () => {
  it.each(['resolve', 'reject'])(
    'ignora resposta %s depois de desmontar o contexto',
    async outcome => {
      let resolve!: (value: string) => void;
      let reject!: (reason: Error) => void;
      const fn = vi.fn(
        () =>
          new Promise<string>((ok, fail) => {
            resolve = ok;
            reject = fail;
          }),
      );
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { result, unmount } = renderHook(() =>
        useAsyncMutation(fn, { onSuccess, onError }),
      );
      const execute = result.current.execute;
      let pending!: Promise<unknown>;
      act(() => {
        pending = execute();
      });
      unmount();
      await act(async () => {
        if (outcome === 'resolve') resolve('ok');
        else reject(new Error('falha tardia'));
        expect(await pending).toBeNull();
        expect(await execute()).toBeNull();
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    },
  );

  it('deve executar mutação com sucesso e atualizar estados', async () => {
    const mutationFn = vi.fn().mockResolvedValue('resultado-ok');
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useAsyncMutation(mutationFn, { onSuccess }),
    );

    expect(result.current.isMutating).toBe(false);
    expect(result.current.error).toBeNull();

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.execute('arg1');
    });

    expect(outcome).toBe('resultado-ok');
    expect(result.current.isMutating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith('resultado-ok');
  });

  it('deve bloquear clique repetido enquanto a mutação estiver pendente', async () => {
    let resolver: (val: string) => void;
    const slowFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>(resolve => {
          resolver = resolve;
        }),
    );

    const { result } = renderHook(() => useAsyncMutation(slowFn));

    let firstPromise: Promise<unknown>;
    act(() => {
      firstPromise = result.current.execute();
    });

    expect(result.current.isMutating).toBe(true);

    // Segundo clique imediato enquanto pendente
    let secondOutcome: unknown;
    await act(async () => {
      secondOutcome = await result.current.execute();
    });

    expect(secondOutcome).toBeNull();
    expect(slowFn).toHaveBeenCalledTimes(1);

    // Conclui a primeira
    let firstOutcome: unknown;
    await act(async () => {
      resolver!('ok');
      firstOutcome = await firstPromise!;
    });

    expect(firstOutcome).toBe('ok');
    expect(result.current.isMutating).toBe(false);
  });

  it('deve capturar e traduzir erro em caso de falha', async () => {
    const error = new Error('Falha de teste');
    const failFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() => useAsyncMutation(failFn, { onError }));

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.execute();
    });

    expect(outcome).toBeNull();
    expect(result.current.isMutating).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Falha de teste');
    expect(onError).toHaveBeenCalled();
  });
});
