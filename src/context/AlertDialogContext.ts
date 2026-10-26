import { createContext } from 'react';

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
