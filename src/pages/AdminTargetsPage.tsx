import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Target, Plus, TrendingUp, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PlatformTarget {
  id: string; name: string; target: number; current: number; category: string;
}

const initialTargets: PlatformTarget[] = [
  { id: '1', name: 'Annual Revenue', target: 500000, current: 275000, category: 'Revenue' },
  { id: '2', name: 'Monthly Active Users', target: 100, current: 60, category: 'Users' },
  { id: '3', name: 'Q2 Orders', target: 1000, current: 650, category: 'Orders' },
  { id: '4', name: 'New Markets Penetration', target: 6, current: 4, category: 'Growth' },
  { id: '5', name: 'Average Order Value', target: 500, current: 372, category: 'Revenue' },
  { id: '6', name: 'Customer Retention Rate', target: 95, current: 87, category: 'Users' },
];

const catIcons: Record<string, typeof Target> = { Revenue: BarChart3, Users, Orders: TrendingUp, Growth: Target };

export default function AdminTargetsPage() {
  const [targets, setTargets] = useState(initialTargets);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState('Revenue');

  const handleAdd = () => {
    if (!newName || !newTarget) return;
    setTargets([...targets, { id: String(Date.now()), name: newName, target: parseFloat(newTarget), current: Math.round(parseFloat(newTarget) * Math.random() * 0.6), category: newCategory }]);
    setNewName(''); setNewTarget(''); setShowAdd(false);
    toast.success('Target created');
  };

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Platform Targets</h1>
            <p className="text-sm text-muted-foreground">Set and monitor organization-wide goals</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1"><Plus className="h-3.5 w-3.5" /> New Target</Button>
        </div>

        {showAdd && (
          <div className="glass rounded-xl p-4 flex flex-wrap gap-3 items-end animate-slide-up">
            <div><label className="text-xs text-muted-foreground block mb-1">Name</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} className="w-48 bg-secondary border-border text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Target Value</label>
              <Input value={newTarget} onChange={e => setNewTarget(e.target.value)} className="w-28 bg-secondary border-border text-sm" /></div>
            <Button size="sm" onClick={handleAdd}>Create</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map(t => {
            const pct = Math.min(100, (t.current / t.target) * 100);
            const Icon = catIcons[t.category] || Target;
            return (
              <div key={t.id} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t.name}</h3>
                    <span className="text-xs text-muted-foreground">{t.category}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-success' : pct >= 60 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(t.current)} / {fmt(t.target)}</span>
                  <span className={`font-medium ${pct >= 100 ? 'text-success' : 'text-foreground'}`}>{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
