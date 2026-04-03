import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getCoupons, addCoupon, toggleCoupon, deleteCoupon } from '@/lib/store';

export default function AdminCouponsPage() {
  useStoreSync();
  const coupons = getCoupons();
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('10');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [minOrder, setMinOrder] = useState('50');
  const [maxUses, setMaxUses] = useState('100');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const handleAdd = () => {
    if (!code || !discount) return;
    addCoupon({ code: code.toUpperCase(), discount: parseFloat(discount), type, minOrder: parseFloat(minOrder), maxUses: parseInt(maxUses), expiresAt, active: true });
    setCode(''); setDiscount('10'); setShowAdd(false);
    toast.success('Coupon created');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Coupons & Discounts</h1><p className="text-sm text-muted-foreground">Manage promotional codes</p></div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1"><Plus className="h-3.5 w-3.5" /> New Coupon</Button>
        </div>

        {showAdd && (
          <div className="glass rounded-xl p-5 space-y-3 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground block mb-1">Code</label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="SAVE20" className="bg-secondary border-border uppercase" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Discount</label><Input value={discount} onChange={e => setDiscount(e.target.value)} className="bg-secondary border-border" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Type</label>
                <Select value={type} onValueChange={v => setType(v as 'percentage' | 'fixed')}><SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed ($)</SelectItem></SelectContent></Select>
              </div>
              <div><label className="text-xs text-muted-foreground block mb-1">Min Order ($)</label><Input value={minOrder} onChange={e => setMinOrder(e.target.value)} className="bg-secondary border-border" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Max Uses</label><Input value={maxUses} onChange={e => setMaxUses(e.target.value)} className="bg-secondary border-border" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Expires</label><Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="bg-secondary border-border" /></div>
            </div>
            <Button size="sm" onClick={handleAdd}>Create Coupon</Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-foreground">{coupons.length}</div><div className="text-xs text-muted-foreground">Total Coupons</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-success">{coupons.filter(c => c.active).length}</div><div className="text-xs text-muted-foreground">Active</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-warning">{coupons.reduce((a, c) => a + c.usedCount, 0)}</div><div className="text-xs text-muted-foreground">Total Redemptions</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-destructive">{coupons.filter(c => !c.active).length}</div><div className="text-xs text-muted-foreground">Expired/Disabled</div></div>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium">Code</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Discount</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Min Order</th>
              <th className="text-center p-4 text-muted-foreground font-medium">Used / Max</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Expires</th>
              <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                  <td className="p-4 font-mono font-medium text-primary">{c.code}</td>
                  <td className="p-4 text-foreground">{c.discount}{c.type === 'percentage' ? '%' : '$'} off</td>
                  <td className="p-4 text-muted-foreground">${c.minOrder}</td>
                  <td className="p-4 text-center text-foreground">{c.usedCount} / {c.maxUses}</td>
                  <td className="p-4 text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {c.expiresAt}</td>
                  <td className="p-4 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{c.active ? 'Active' : 'Disabled'}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { toggleCoupon(c.id); toast.success(c.active ? 'Coupon disabled' : 'Coupon enabled'); }}>{c.active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}</Button>
                      <Button variant="ghost" size="sm" onClick={() => { deleteCoupon(c.id); toast.success('Coupon deleted'); }}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
