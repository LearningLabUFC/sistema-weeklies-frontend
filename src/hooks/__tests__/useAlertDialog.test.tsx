import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { useAlertDialog } from '@/hooks/useAlertDialog';

describe('useAlertDialog hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AlertDialogProvider>{children}</AlertDialogProvider>
  );

  it('deve prover as funções showAlertDialog e hideAlertDialog', () => {
    const { result } = renderHook(() => useAlertDialog(), { wrapper });

    expect(typeof result.current.showAlertDialog).toBe('function');
    expect(typeof result.current.hideAlertDialog).toBe('function');
  });
});
