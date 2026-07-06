import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlertDialogProvider } from '../useAlertDialog';
import { useAlertDialog } from '@/context/AlertDialogContext';
import React from 'react';

describe('AlertDialogContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AlertDialogProvider>{children}</AlertDialogProvider>
  );

  it('deve prover a função showAlertDialog', () => {
    const { result } = renderHook(() => useAlertDialog(), { wrapper });

    expect(typeof result.current.showAlertDialog).toBe('function');
    expect(typeof result.current.hideAlertDialog).toBe('function');
  });
});
