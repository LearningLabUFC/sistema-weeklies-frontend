import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './routes/index.tsx';
import { AlertDialogProvider } from './hooks/useAlertDialog.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertDialogProvider>
      <RouterProvider router={router} />
    </AlertDialogProvider>
  </StrictMode>,
);
