import { useMemo, useState } from 'react';
import { getSales, getUsers, getProducts, getRegions, type SaleRecord } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import {
  DollarSign, Users, ShoppingCart, Globe, TrendingUp, Activity,
  AlertTriangle, CheckCircle, Server, Cpu, HardDrive, Wifi,
  Bell, Target, Award, Megaphone, Eye, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const sales = useMemo(() => getSales(), []);
  const users = useMemo(() => getUsers(), []);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const totalRevenue = sales.reduce((a, s) => a + s.price * s.quantity, 0);
  const totalOrders = sales.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const avgRevPerUser = totalUsers ? totalRevenue / totalUsers : 0;
  const totalUnits = sales.reduce((a, s) => a + s.quantity, 0);

  // Monthly revenue
  const monthlyData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number; users: Set<string> }> = {};
    sales.forEach(s => {
      const m = s.date.substring(0, 7);
      if (!map[m]) map[m] = { revenue: 0, orders: 0, users: new Set() };
      map[m].revenue += s.price * s.quantity;
      map[m].orders += 1;
      map[m].users.add(s.userId);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({
      month, revenue: Math.round(d.revenue), orders: d.orders, activeUsers: d.users.size,
    }));
  }, [sales]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { revenue: number; units: number; orders: number }> = {};
    sales.forEach(s => {
      if (!map[s.product]) map[s.product] = { revenue: 0, units: 0, orders: 0 };
      map[s.product].revenue += s.price * s.quantity;
      map[s.product].units += s.quantity;
      map[s.product].orders += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.revenue - a.revenue).slice(0, 8).map(([name, d]) => ({
      name, revenue: Math.round(d.revenue), units: d.units, orders: d.orders,
    }));
  }, [sales]);

  // Region data
  const regionData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    sales.forEach(s => {
      if (!map[s.region]) map[s.region] = { revenue: 0, orders: 0 };
      map[s.region].revenue += s.price * s.quantity;
      map[s.region].orders += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.revenue - a.revenue).map(([name, d]) => ({
      name, revenue: Math.round(d.revenue), orders: d.orders,
    }));
  }, [sales]);

  // User growth (by join date)
  const userGrowth = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { const m = u.createdAt.substring(0, 7); map[m] = (map[m] || 0) + 1; });
    let cumulative = 0;
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => {
      cumulative += count;
      return { month, newUsers: count, totalUsers: cumulative };
    });
  }, [users]);

  // Hourly distribution (simulated)
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      orders: Math.round(Math.sin(h / 24 * Math.PI * 2 - Math.PI / 2) * 15 + 20 + Math.random() * 5),
    }));
  }, []);

  // Revenue by product category (pie)
  const categoryData = useMemo(() => {
    const categories: Record<string, string> = {};
    getProducts().forEach(p => {
      if (p.includes('Laptop') || p.includes('Tablet') || p.includes('Monitor')) categories[p] = 'Computing';
      else if (p.includes('Mouse') || p.includes('Keyboard') || p.includes('Hub') || p.includes('Dock') || p.includes('Cable')) categories[p] = 'Accessories';
      else if (p.includes('Headphones') || p.includes('Webcam') || p.includes('Smartwatch')) categories[p] = 'Wearables';
      else if (p.includes('SSD') || p.includes('RAM') || p.includes('Graphics') || p.includes('Power') || p.includes('CPU')) categories[p] = 'Components';
      else categories[p] = 'Other';
    });
    const map: Record<string, number> = {};
    sales.forEach(s => {
      const cat = categories[s.product] || 'Other';
      map[cat] = (map[cat] || 0) + s.price * s.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [sales]);

  // Activity log (mock)
  const activityLog = [
    { action: 'New user registered', user: users[0]?.name, time: '5 min ago', type: 'user' },
    { action: 'Sale recorded', user: users[1]?.name, time: '12 min ago', type: 'sale' },
    { action: 'Admin login', user: users[50]?.name, time: '25 min ago', type: 'admin' },
    { action: 'Data export requested', user: users[2]?.name, time: '1h ago', type: 'system' },
    { action: 'User profile updated', user: users[3]?.name, time: '2h ago', type: 'user' },
    { action: 'Bulk import completed', user: 'System', time: '3h ago', type: 'system' },
    { action: 'Password reset', user: users[5]?.name, time: '4h ago', type: 'user' },
    { action: 'New sale recorded', user: users[8]?.name, time: '5h ago', type: 'sale' },
  ];

  // System health (mock)
  const systemHealth = [
    { label: 'API Server', status: 'healthy', icon: Server, uptime: '99.9%' },
    { label: 'Database', status: 'healthy', icon: HardDrive, uptime: '99.8%' },
    { label: 'CPU Usage', status: 'warning', icon: Cpu, uptime: '78%' },
    { label: 'Network', status: 'healthy', icon: Wifi, uptime: '99.99%' },
  ];

  // Revenue targets
  const platformTarget = 500000;
  const targetProgress = (totalRevenue / platformTarget) * 100;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-sm text-muted-foreground">Platform-wide analytics & management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAnnouncement(!showAnnouncement)} className="gap-1">
              <Megaphone className="h-3.5 w-3.5" /> Announce
            </Button>
            <Button variant="outline" size="sm" onClick={() => { toast.success('Report generated'); }} className="gap-1">
              <Eye className="h-3.5 w-3.5" /> Report
            </Button>
          </div>
        </div>

        {/* Announcement bar */}
        {showAnnouncement && (
          <div className="glass rounded-xl p-4 flex gap-3 animate-slide-up">
            <input
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="Type announcement for all users..."
              className="flex-1 bg-secondary rounded-lg px-4 py-2 text-sm text-foreground border border-border outline-none focus:border-primary"
            />
            <Button size="sm" onClick={() => { toast.success('Announcement sent to all users'); setAnnouncement(''); setShowAnnouncement(false); }}>
              Send
            </Button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <KpiCard title="Total Revenue" value={fmt(totalRevenue)} change="18.3%" positive icon={DollarSign} />
          <KpiCard title="Total Orders" value={String(totalOrders)} change="12.7%" positive icon={ShoppingCart} />
          <KpiCard title="Active Users" value={String(totalUsers)} icon={Users} />
          <KpiCard title="Admins" value={String(totalAdmins)} icon={Users} />
          <KpiCard title="Avg Rev/User" value={fmt(avgRevPerUser)} change="5.2%" positive icon={TrendingUp} />
          <KpiCard title="Total Units" value={totalUnits.toLocaleString()} icon={Globe} />
        </div>

        {/* Platform Target */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Platform Revenue Target</span>
            </div>
            <span className="text-sm text-muted-foreground">{fmt(totalRevenue)} / {fmt(platformTarget)}</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all" style={{ width: `${Math.min(100, targetProgress)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{targetProgress.toFixed(1)}% of annual target achieved</p>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue & Orders Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(217,91%,60%)" fill="url(#gradAdmin)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={false} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280,67%,60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(280,67%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Area type="monotone" dataKey="totalUsers" stroke="hsl(280,67%,60%)" fill="url(#gradUsers)" strokeWidth={2} />
                <Bar dataKey="newUsers" fill="hsl(280,67%,60%)" opacity={0.4} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis type="number" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Bar dataKey="revenue" fill="hsl(142,71%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Hourly Order Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Bar dataKey="orders" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Regional Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regionData.map((r, i) => (
              <div key={r.name} className="bg-secondary rounded-lg p-4 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}>
                  <Globe className="h-4 w-4" style={{ color: COLORS[i % COLORS.length] }} />
                </div>
                <div className="text-xs text-muted-foreground mb-1">{r.name}</div>
                <div className="text-sm font-bold text-foreground">{fmt(r.revenue)}</div>
                <div className="text-xs text-muted-foreground">{r.orders} orders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Log */}
          <div className="lg:col-span-2 glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Activity Log
            </h3>
            <div className="space-y-3">
              {activityLog.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    log.type === 'admin' ? 'bg-warning' : log.type === 'sale' ? 'bg-success' : log.type === 'user' ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Server className="h-4 w-4" /> System Health
              </h3>
              <div className="space-y-3">
                {systemHealth.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <s.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{s.uptime}</span>
                      {s.status === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Award className="h-4 w-4" /> Top Performers
              </h3>
              <div className="space-y-3">
                {topProducts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${i === 0 ? 'text-warning' : i === 1 ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>#{i + 1}</span>
                      <span className="text-foreground">{p.name}</span>
                    </div>
                    <span className="text-primary font-medium">{fmt(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
