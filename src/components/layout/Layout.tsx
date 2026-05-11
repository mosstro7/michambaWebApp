import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { TabBar } from './TabBar';
import { useAuthStore } from '@/store/authStore';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export function Layout({ children, showNavigation = true }: LayoutProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {showNavigation && <Navbar />}
      
      <main className="flex-1 pb-20 md:pb-0 md:pt-4">
        <div className="max-w-md mx-auto w-full px-4 md:max-w-2xl lg:max-w-4xl">
          {children}
        </div>
      </main>

      {showNavigation && isAuthenticated && <TabBar />}
    </div>
  );
}
