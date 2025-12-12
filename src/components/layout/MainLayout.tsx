import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}