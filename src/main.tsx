import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { router } from '@/routes/index';

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia(
  '(prefers-color-scheme: dark)',
).matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AlertDialogProvider>
        <RouterProvider router={router} />
      </AlertDialogProvider>
    </AuthProvider>
  </StrictMode>,
);
