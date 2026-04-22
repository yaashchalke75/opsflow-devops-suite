import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { DemoBanner } from '@/components/ui/DemoBanner';

export function AppLayout() {
  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col md:overflow-hidden min-w-0 w-full">
        <DemoBanner />
        <Topbar />
        <main className="flex-1 md:overflow-y-auto ios-scroll">
          <div className="max-w-[1440px] mx-auto px-3 md:px-8 py-5 md:py-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
