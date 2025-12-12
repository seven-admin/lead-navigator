import { Home, Users, Upload, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Início' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/import', icon: Upload, label: 'Importar', adminOnly: true },
];

export function BottomNav() {
  const { signOut, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground transition-colors',
                isActive && 'text-primary'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}