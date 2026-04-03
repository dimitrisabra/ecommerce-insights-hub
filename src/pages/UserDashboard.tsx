import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSales, getSales, getProducts, getRegions, type SaleRecord } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import { DollarSign, ShoppingCart, TrendingUp, Package, Download, Calendar, Bell, Target, Award, Clock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];

function exportCSV(data: SaleRecord[], filename: string) {
  const header = 'Date,Product,Region,Quantity,Price,Total\n';
  const rows = data.map(s => `${s.date},${s.product},${s.region},${s.quantity},${s.price},${(s.price * s.quantity).toFixed(2)}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported successfully');
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [productFilter, setProductFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const allSales = useMemo(() => user ? getUserSales(user.id) : [], [user]);

  const sales = useMemo(() => {
    let filtered = allSales;
    if (productFilter !== 'all') filtered = filtered.filter(s => s.product === productFilter);
    if (regionFilter !== 'all') filtered = filtered.filter(s => s.region === regionFilter);
    if (dateRange !== 'all') {
      const now = Date.now();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const cutoff = new Date(now - days * 86400000).toISOString().split('T')[0];
      filtered = filtered.filter(s => s.date >= cutoff);
    }
    return filtered;
  }, [allSales, productFilter, regionFilter, dateRange]);

  const kpis = useMemo(() => {
    const revenue = sales.reduce((a, s) => a + s.price * s.quantity, 0);
    const orders = sales.length;
    const avgOrder = orders ? revenue / orders : 0;
    const profit = revenue * 0.32;
    const totalUnits = sales.reduce((a, s) => a + s.quantity, 0);
    const uniqueProducts = new Set(sales.map(s => s.product)).size;
    const uniqueRegions = new Set(sales.map(s => s.region)).size;
    // Best selling product
    const prodMap: Record<string, number> = {};
    sales.forEach(s => { prodMap[s.product] = (prodMap[s.product] || 0) + s.price * s.quantity; });
    const bestProduct = Object.entries(prodMap).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    return { revenue, orders, avgOrder, profit, totalUnits, uniqueProducts, uniqueRegions, bestProduct };
  }, [sales]);

  // Monthly revenue
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => { const m = s.date.substring(0, 7); map[m] = (map[m] || 0) + s.price * s.quantity; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
  }, [sales]);

  // Daily sales last 30 days
  const dailyData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    sales.filter(s => s.date >= cutoff).forEach(s => {
      if (!map[s.date]) map[s.date] = { revenue: 0, orders: 0 };
      map[s.date].revenue += s.price * s.quantity;
      map[s.date].orders += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date: date.substring(5), revenue: Math.round(d.revenue), orders: d.orders }));
  }, [sales]);

  // By product
  const productData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => { map[s.product] = (map[s.product] || 0) + s.quantity; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [sales]);

  // By region
  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => { map[s.region] = (map[s.region] || 0) + s.price * s.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [sales]);

  // Profit margins by product
  const marginData = useMemo(() => {
    const map: Record<string, { revenue: number; cost: number }> = {};
    sales.forEach(s => {
      if (!map[s.product]) map[s.product] = { revenue: 0, cost: 0 };
      map[s.product].revenue += s.price * s.quantity;
      map[s.product].cost += s.price * s.quantity * 0.68;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.revenue - a.revenue).slice(0, 6).map(([name, d]) => ({
      name, revenue: Math.round(d.revenue), profit: Math.round(d.revenue - d.cost),
    }));
  }, [sales]);

  // Recent sales
  const recentSales = useMemo(() => [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [sales]);

  // Sales target (mock)
  const salesTarget = 50000;
  const targetProgress = Math.min(100, (kpis.revenue / salesTarget) * 100);

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  // Notifications
  const notifications = [
    { text: 'Your monthly revenue exceeded $10k!', type: 'success' as const, time: '2h ago' },
    { text: `${kpis.bestProduct} is your top performer`, type: 'info' as const, time: '5h ago' },
    { text: 'New sales data has been recorded', type: 'info' as const, time: '1d ago' },
    { text: 'Quarterly report is ready for download', type: 'success' as const, time: '2d ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your sales performance at a glance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-secondary border-border text-sm">
                <Calendar className="h-3.5 w-3.5 mr-1" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="365d">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-40 bg-secondary border-border text-sm"><SelectValue placeholder="Product" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {getProducts().map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-40 bg-secondary border-border text-sm"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {getRegions().map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportCSV(sales, 'my-sales.csv')} className="gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Revenue" value={fmt(kpis.revenue)} change="12.5% vs last month" positive icon={DollarSign} />
          <KpiCard title="Orders" value={String(kpis.orders)} change="8.2%" positive icon={ShoppingCart} />
          <KpiCard title="Avg Order Value" value={fmt(kpis.avgOrder)} change="3.1%" positive icon={TrendingUp} />
          <KpiCard title="Est. Profit" value={fmt(kpis.profit)} change="15.4%" positive icon={Package} />
        </div>

        {/* Sales Target Progress */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Revenue Target</span>
            </div>
            <span className="text-sm text-muted-foreground">{fmt(kpis.revenue)} / {fmt(salesTarget)}</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${targetProgress}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{targetProgress.toFixed(1)}% achieved</span>
            <span>{fmt(salesTarget - kpis.revenue)} remaining</span>
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(217,91%,60%)" fill="url(#grad1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Activity (30d)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Sales by Product</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis type="number" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Bar dataKey="value" fill="hsl(217,91%,60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue by Region</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={regionData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                  {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Profit Margins</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
                <Bar dataKey="revenue" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: Recent sales + Notifications + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="lg:col-span-2 glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Sales</h3>
              <span className="text-xs text-muted-foreground">{sales.length} total orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">Date</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">Product</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">Region</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id} className="border-b border-border/30">
                      <td className="py-2.5 text-muted-foreground text-xs">{s.date}</td>
                      <td className="py-2.5 text-foreground font-medium text-xs">{s.product}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{s.region}</td>
                      <td className="py-2.5 text-right text-primary font-medium text-xs">${(s.price * s.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications + Quick Stats */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h3>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className={`mt-0.5 ${n.type === 'success' ? 'text-success' : 'text-primary'}`}>●</span>
                    <div>
                      <p className="text-foreground">{n.text}</p>
                      <p className="text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Award className="h-4 w-4" /> Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Units Sold</span><span className="text-foreground font-medium">{kpis.totalUnits}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span className="text-foreground font-medium">{kpis.uniqueProducts}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Regions</span><span className="text-foreground font-medium">{kpis.uniqueRegions}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Best Seller</span><span className="text-primary font-medium text-xs">{kpis.bestProduct}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
