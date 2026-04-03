import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSales, getUsers, getProducts, getRegions } from '@/lib/mockData';

export default function AdminReportsPage() {
  const sales = useMemo(() => getSales(), []);
  const users = useMemo(() => getUsers(), []);
  const [reportType, setReportType] = useState('revenue');

  const totalRevenue = sales.reduce((a, s) => a + s.price * s.quantity, 0);
  const totalOrders = sales.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const topProducts = useMemo(() => {
    const map: Record<string, { revenue: number; units: number; orders: number }> = {};
    sales.forEach(s => { if (!map[s.product]) map[s.product] = { revenue: 0, units: 0, orders: 0 }; map[s.product].revenue += s.price * s.quantity; map[s.product].units += s.quantity; map[s.product].orders += 1; });
    return Object.entries(map).sort(([, a], [, b]) => b.revenue - a.revenue).map(([name, d]) => ({ name, ...d }));
  }, [sales]);

  const regionBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    sales.forEach(s => { if (!map[s.region]) map[s.region] = { revenue: 0, orders: 0 }; map[s.region].revenue += s.price * s.quantity; map[s.region].orders += 1; });
    return Object.entries(map).sort(([, a], [, b]) => b.revenue - a.revenue).map(([name, d]) => ({ name, ...d }));
  }, [sales]);

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => { const m = s.date.substring(0, 7); map[m] = (map[m] || 0) + s.price * s.quantity; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
  }, [sales]);

  const exportReport = () => {
    let csv = '';
    if (reportType === 'revenue') {
      csv = 'Month,Revenue\n' + monthlyRevenue.map(r => `${r.month},$${r.revenue}`).join('\n');
    } else if (reportType === 'products') {
      csv = 'Product,Revenue,Units,Orders\n' + topProducts.map(p => `${p.name},$${Math.round(p.revenue)},${p.units},${p.orders}`).join('\n');
    } else if (reportType === 'regions') {
      csv = 'Region,Revenue,Orders\n' + regionBreakdown.map(r => `${r.name},$${Math.round(r.revenue)},${r.orders}`).join('\n');
    } else {
      csv = 'Name,Email,Role,Joined\n' + users.map(u => `${u.name},${u.email},${u.role},${u.createdAt}`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}-report.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${reportType} report exported`);
  };

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Generate and export platform reports</p></div>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={setReportType}><SelectTrigger className="w-40 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="products">Products</SelectItem><SelectItem value="regions">Regions</SelectItem><SelectItem value="users">Users</SelectItem></SelectContent></Select>
            <Button size="sm" onClick={exportReport} className="gap-1"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-5"><div className="flex items-center gap-2 mb-2 text-muted-foreground"><DollarSign className="h-4 w-4" /><span className="text-xs">Total Revenue</span></div><div className="text-2xl font-bold text-foreground">{fmt(totalRevenue)}</div></div>
          <div className="glass rounded-xl p-5"><div className="flex items-center gap-2 mb-2 text-muted-foreground"><ShoppingCart className="h-4 w-4" /><span className="text-xs">Total Orders</span></div><div className="text-2xl font-bold text-foreground">{totalOrders}</div></div>
          <div className="glass rounded-xl p-5"><div className="flex items-center gap-2 mb-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-xs">Total Users</span></div><div className="text-2xl font-bold text-foreground">{totalUsers}</div></div>
          <div className="glass rounded-xl p-5"><div className="flex items-center gap-2 mb-2 text-muted-foreground"><TrendingUp className="h-4 w-4" /><span className="text-xs">Avg Order Value</span></div><div className="text-2xl font-bold text-foreground">{fmt(avgOrderValue)}</div></div>
        </div>

        {reportType === 'revenue' && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-medium text-foreground">Monthly Revenue Report</h3></div>
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left p-4 text-muted-foreground font-medium">Month</th><th className="text-right p-4 text-muted-foreground font-medium">Revenue</th></tr></thead>
              <tbody>{monthlyRevenue.map(r => <tr key={r.month} className="border-b border-border/50 hover:bg-accent/50"><td className="p-4 text-foreground">{r.month}</td><td className="p-4 text-right text-primary font-medium">{fmt(r.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {reportType === 'products' && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-medium text-foreground">Product Performance Report</h3></div>
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left p-4 text-muted-foreground font-medium">Product</th><th className="text-right p-4 text-muted-foreground font-medium">Revenue</th><th className="text-right p-4 text-muted-foreground font-medium">Units</th><th className="text-right p-4 text-muted-foreground font-medium">Orders</th></tr></thead>
              <tbody>{topProducts.map(p => <tr key={p.name} className="border-b border-border/50 hover:bg-accent/50"><td className="p-4 text-foreground font-medium">{p.name}</td><td className="p-4 text-right text-primary">{fmt(p.revenue)}</td><td className="p-4 text-right text-foreground">{p.units}</td><td className="p-4 text-right text-foreground">{p.orders}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {reportType === 'regions' && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-medium text-foreground">Regional Performance Report</h3></div>
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left p-4 text-muted-foreground font-medium">Region</th><th className="text-right p-4 text-muted-foreground font-medium">Revenue</th><th className="text-right p-4 text-muted-foreground font-medium">Orders</th><th className="text-right p-4 text-muted-foreground font-medium">Share</th></tr></thead>
              <tbody>{regionBreakdown.map(r => <tr key={r.name} className="border-b border-border/50 hover:bg-accent/50"><td className="p-4 text-foreground font-medium">{r.name}</td><td className="p-4 text-right text-primary">{fmt(r.revenue)}</td><td className="p-4 text-right text-foreground">{r.orders}</td><td className="p-4 text-right text-foreground">{(r.revenue / totalRevenue * 100).toFixed(1)}%</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {reportType === 'users' && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-medium text-foreground">User Report</h3></div>
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left p-4 text-muted-foreground font-medium">Name</th><th className="text-left p-4 text-muted-foreground font-medium">Email</th><th className="text-left p-4 text-muted-foreground font-medium">Role</th><th className="text-left p-4 text-muted-foreground font-medium">Joined</th></tr></thead>
              <tbody>{users.slice(0, 30).map(u => <tr key={u.id} className="border-b border-border/50 hover:bg-accent/50"><td className="p-4 text-foreground font-medium">{u.name}</td><td className="p-4 text-muted-foreground">{u.email}</td><td className="p-4"><span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>{u.role}</span></td><td className="p-4 text-muted-foreground">{u.createdAt}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
