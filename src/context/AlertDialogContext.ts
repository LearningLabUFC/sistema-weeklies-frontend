import { createContext, useContext } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AlertDialogContextType {
  showAlertDialog: (options: AlertOptions) => void;
  hideAlertDialog: () => void;
}

export const AlertDialogContext = createContext<
  AlertDialogContextType | undefined
>(undefined);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      'useAlertDialog deve ser usado dentro de um AlertDialogProvider',
    );
  }
  return context;
};
