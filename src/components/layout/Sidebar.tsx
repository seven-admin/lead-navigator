import { Home, Users, Upload, LogOut, Menu } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/import', icon: Upload, label: 'Importar', adminOnly: true },
];

export function Sidebar() {
  const { signOut, isAdmin, user } = useAuthContext();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <h1 className="text-lg font-bold text-foreground">
            Gestão de Leads
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        {!collapsed && user && (
          <p className="px-3 py-2 text-sm text-muted-foreground truncate">
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}