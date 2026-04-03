import { useState, useMemo } from 'react';
import { getSales, deleteSale, getProducts, getRegions, type SaleRecord } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminSales() {
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [, setRefresh] = useState(0);

  const sales = useMemo(() => {
    let all = getSales();
    if (productFilter !== 'all') all = all.filter(s => s.product === productFilter);
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(s => s.product.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    return all;
  }, [search, productFilter]);

  const handleDelete = (s: SaleRecord) => {
    deleteSale(s.id);
    setRefresh(n => n + 1);
    toast.success('Sale record deleted');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Sales Data</h1>
            <p className="text-sm text-muted-foreground">{sales.length} records</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-secondary border-border" />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-40 bg-secondary border-border text-sm">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {getProducts().map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Product</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Region</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Qty</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Price</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Total</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 50).map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-muted-foreground">{s.date}</td>
                    <td className="p-4 text-foreground font-medium">{s.product}</td>
                    <td className="p-4 text-muted-foreground">{s.region}</td>
                    <td className="p-4 text-right text-foreground">{s.quantity}</td>
                    <td className="p-4 text-right text-foreground">${s.price.toFixed(2)}</td>
                    <td className="p-4 text-right text-primary font-medium">${(s.price * s.quantity).toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sales.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
              Showing 50 of {sales.length} records
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
