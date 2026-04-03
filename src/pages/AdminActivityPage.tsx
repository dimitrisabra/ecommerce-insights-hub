import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getUsers, getSales } from '@/lib/mockData';
import { Activity, Clock, User, ShoppingCart, Shield, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function generateActivityLog() {
  const users = getUsers();
  const actions = [
    { action: 'User logged in', type: 'auth' },
    { action: 'Sale recorded', type: 'sale' },
    { action: 'Profile updated', type: 'user' },
    { action: 'Password changed', type: 'auth' },
    { action: 'Data exported', type: 'system' },
    { action: 'Report generated', type: 'system' },
    { action: 'Target created', type: 'user' },
    { action: 'Sale deleted', type: 'sale' },
    { action: 'User registered', type: 'auth' },
    { action: 'Settings updated', type: 'system' },
    { action: 'CSV imported', type: 'system' },
    { action: 'Notification dismissed', type: 'user' },
    { action: 'Admin login', type: 'admin' },
    { action: 'Bulk action performed', type: 'admin' },
    { action: 'Announcement sent', type: 'admin' },
  ];

  const logs = [];
  for (let i = 0; i < 100; i++) {
    const a = actions[Math.floor(Math.random() * actions.length)];
    const u = users[Math.floor(Math.random() * users.length)];
    const minsAgo = Math.floor(Math.random() * 10000);
    logs.push({
      id: String(i),
      action: a.action,
      type: a.type,
      userName: u.name,
      userEmail: u.email,
      timestamp: new Date(Date.now() - minsAgo * 60000).toISOString(),
      minsAgo,
    });
  }
  return logs.sort((a, b) => a.minsAgo - b.minsAgo);
}

function formatTimeAgo(mins: number) {
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function AdminActivityPage() {
  const logs = useMemo(() => generateActivityLog(), []);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = logs;
    if (typeFilter !== 'all') result = result.filter(l => l.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.action.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q));
    }
    return result;
  }, [logs, search, typeFilter]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'auth': return <Shield className="h-3.5 w-3.5" />;
      case 'sale': return <ShoppingCart className="h-3.5 w-3.5" />;
      case 'admin': return <Shield className="h-3.5 w-3.5" />;
      default: return <User className="h-3.5 w-3.5" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'auth': return 'bg-primary/10 text-primary';
      case 'sale': return 'bg-success/10 text-success';
      case 'admin': return 'bg-warning/10 text-warning';
      case 'system': return 'bg-muted text-muted-foreground';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} events</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-secondary border-border text-sm" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass rounded-xl divide-y divide-border/50">
          {filtered.slice(0, 50).map(log => (
            <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor(log.type)}`}>
                {typeIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.userName} — {log.userEmail}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" /> {formatTimeAgo(log.minsAgo)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
