import React, { useState, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  AlertDialogContext,
  type AlertOptions,
  type AlertType,
} from '../context/AlertDialogContext';

const iconMap: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />,
  error: <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />,
  warning: <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />,
  info: <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />,
  confirm: <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />,
};

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlertDialog = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const hideAlertDialog = () => {
    setIsOpen(false);
    setTimeout(() => setOptions(null), 300);
  };

  const handleConfirm = () => {
    if (options?.onConfirm) options.onConfirm();
    hideAlertDialog();
  };

  const handleCancel = () => {
    if (options?.onCancel) options.onCancel();
    hideAlertDialog();
  };

  const shouldShowCancel = options?.showCancel ?? options?.type === 'confirm';

  return (
    <AlertDialogContext.Provider value={{ showAlertDialog, hideAlertDialog }}>
      {children}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-106.25 text-center">
          <AlertDialogHeader>
            {options?.type && iconMap[options.type]}
            <AlertDialogTitle className="w-full text-center text-xl">
              {options?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="w-full text-center text-base">
              {options?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4 flex-col sm:flex-row gap-2">
            {shouldShowCancel && (
              <AlertDialogCancel onClick={handleCancel} className="mt-0">
                {options?.cancelText || 'Cancelar'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options?.type === 'error'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : ''
              }
            >
              {options?.confirmText || 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}
