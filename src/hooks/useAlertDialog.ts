import { useContext } from 'react';

import { AlertDialogContext } from '@/context/AlertDialogContext';

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      'useAlertDialog deve ser usado dentro de um AlertDialogProvider',
    );
  }
  return context;
};
