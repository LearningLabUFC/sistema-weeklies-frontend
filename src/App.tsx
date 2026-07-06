import { Outlet } from 'react-router';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar from './components/Sidebar/AppSidebar';

export default function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex h-14 items-center gap-4 border-b bg-white px-4 sticky top-0 z-30 md:hidden">
              <SidebarTrigger className="text-indigo-600" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600">LearningLab</span>
              </div>
            </header>

            <main className="min-h-full px-6 bg-linear-to-br from-indigo-50 via-white to-indigo-50 font-sans text-slate-900">
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
