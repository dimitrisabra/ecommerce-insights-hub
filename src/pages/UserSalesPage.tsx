import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSales, addSale, deleteSale, getProducts, getRegions, type SaleRecord } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Search, Plus, Download, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

function exportCSV(data: SaleRecord[], filename: string) {
  const header = 'Date,Product,Region,Quantity,Price,Total\n';
  const rows = data.map(s => `${s.date},${s.product},${s.region},${s.quantity},${s.price},${(s.price * s.quantity).toFixed(2)}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  toast.success('CSV exported');
}

export default function UserSalesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');

  // Add form state
  const [newProduct, setNewProduct] = useState(getProducts()[0]);
  const [newRegion, setNewRegion] = useState(getRegions()[0]);
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('50');

  const sales = useMemo(() => {
    let all = user ? getUserSales(user.id) : [];
    if (productFilter !== 'all') all = all.filter(s => s.product === productFilter);
    if (search) { const q = search.toLowerCase(); all = all.filter(s => s.product.toLowerCase().includes(q) || s.region.toLowerCase().includes(q)); }
    return all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, productFilter, refresh]);

  const handleAdd = () => {
    if (!user) return;
    addSale({
      userId: user.id, product: newProduct, region: newRegion,
      quantity: parseInt(newQty) || 1, price: parseFloat(newPrice) || 50,
      date: new Date().toISOString().split('T')[0],
    });
    setRefresh(n => n + 1);
    setShowAdd(false);
    toast.success('Sale record added');
  };

  const handleDelete = (id: string) => {
    deleteSale(id);
    setRefresh(n => n + 1);
    toast.success('Sale deleted');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Sales</h1>
            <p className="text-sm text-muted-foreground">{sales.length} records</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-secondary border-border text-sm" />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-36 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {getProducts().map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportCSV(sales, 'my-sales.csv')} className="gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="glass rounded-xl p-4 flex flex-wrap gap-3 items-end animate-slide-up">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Product</label>
              <Select value={newProduct} onValueChange={setNewProduct}>
                <SelectTrigger className="w-40 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{getProducts().map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Region</label>
              <Select value={newRegion} onValueChange={setNewRegion}>
                <SelectTrigger className="w-36 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{getRegions().map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
              <Input value={newQty} onChange={e => setNewQty(e.target.value)} className="w-20 bg-secondary border-border text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Price ($)</label>
              <Input value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-24 bg-secondary border-border text-sm" />
            </div>
            <Button size="sm" onClick={handleAdd}>Add Sale</Button>
          </div>
        )}

        {/* Table */}
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
                    <td className="p-4 text-right text-foreground">
                      {editingId === s.id ? (
                        <Input value={editQty} onChange={e => setEditQty(e.target.value)} className="w-16 bg-secondary text-sm ml-auto text-right" />
                      ) : s.quantity}
                    </td>
                    <td className="p-4 text-right text-foreground">${s.price.toFixed(2)}</td>
                    <td className="p-4 text-right text-primary font-medium">${(s.price * s.quantity).toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {editingId === s.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => { s.quantity = parseInt(editQty) || s.quantity; setEditingId(null); setRefresh(n => n + 1); toast.success('Updated'); }}>
                              <Check className="h-3.5 w-3.5 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingId(s.id); setEditQty(String(s.quantity)); }}>
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
