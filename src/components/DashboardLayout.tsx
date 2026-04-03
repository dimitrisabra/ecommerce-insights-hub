import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, ShieldCheck, LogOut, ArrowLeftRight,
  LayoutDashboard, TrendingUp, ChevronLeft, ChevronRight,
  Database, Settings, Activity, Bell, FileText, Target,
  Mail, MessageSquare, HelpCircle, Ticket, FileBarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const userNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Sales', icon: FileText, path: '/dashboard/sales' },
  { label: 'Forecast', icon: TrendingUp, path: '/dashboard/forecast' },
  { label: 'Targets', icon: Target, path: '/dashboard/targets' },
  { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { label: 'Messages', icon: Mail, path: '/dashboard/messages' },
  { label: 'Feedback', icon: MessageSquare, path: '/dashboard/feedback' },
  { label: 'Help Center', icon: HelpCircle, path: '/dashboard/help' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const adminNav = [
  { label: 'Overview', icon: BarChart3, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Sales Data', icon: Database, path: '/admin/sales' },
  { label: 'Activity Log', icon: Activity, path: '/admin/activity' },
  { label: 'Targets', icon: Target, path: '/admin/targets' },
  { label: 'Announcements', icon: Bell, path: '/admin/announcements' },
  { label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
  { label: 'Messages', icon: Mail, path: '/admin/messages' },
  { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const nav = isAdmin ? adminNav : userNav;

  return (
    <div className="flex min-h-screen w-full">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <BarChart3 className="h-5 w-5 text-primary shrink-0" />
          {!collapsed && <span className="text-foreground font-bold text-base tracking-tight">SalesIQ</span>}
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto scrollbar-thin">
          {nav.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-sidebar-accent text-primary font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground text-xs h-8" onClick={() => { switchRole(isAdmin ? 'user' : 'admin'); navigate(isAdmin ? '/dashboard' : '/admin'); }}>
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Switch to {isAdmin ? 'User' : 'Admin'}</span>}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:text-destructive text-xs h-8" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="h-9 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-4 w-4 ${isAdmin ? 'text-warning' : 'text-success'}`} />
            <span className="text-sm text-muted-foreground">{isAdmin ? 'Admin' : 'User'} — {user.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </header>
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
