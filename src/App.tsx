import { Outlet } from 'react-router';

import AppSidebar from '@/components/layout/Sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex h-14 items-center gap-4 border-b dark:border-slate-800 justify-end px-2 sticky top-0 z-30 md:hidden bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  LearningLab
                </span>
              </div>
              <SidebarTrigger className="text-indigo-600 dark:text-indigo-400 w-12 h-12 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6" />
            </header>

            <main className="min-h-full px-6 bg-linear-to-br from-indigo-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors">
              <div className="max-w-6xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
