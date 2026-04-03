import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Plus, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SalesTarget {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

const initialTargets: SalesTarget[] = [
  { id: '1', name: 'Q2 Revenue Goal', target: 25000, current: 18500, deadline: '2026-06-30' },
  { id: '2', name: 'Monthly Orders Target', target: 100, current: 67, deadline: '2026-04-30' },
  { id: '3', name: 'New Product Launch', target: 5000, current: 3200, deadline: '2026-05-15' },
  { id: '4', name: 'Asia Pacific Expansion', target: 10000, current: 4100, deadline: '2026-07-01' },
];

export default function UserTargetsPage() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<SalesTarget[]>(initialTargets);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const handleAdd = () => {
    if (!newName || !newTarget) return;
    setTargets([...targets, {
      id: String(Date.now()), name: newName, target: parseFloat(newTarget),
      current: Math.round(parseFloat(newTarget) * Math.random() * 0.5), deadline: newDeadline || '2026-12-31',
    }]);
    setNewName(''); setNewTarget(''); setNewDeadline(''); setShowAdd(false);
    toast.success('Target added');
  };

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales Targets</h1>
            <p className="text-sm text-muted-foreground">Track your goals and milestones</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> New Target
          </Button>
        </div>

        {showAdd && (
          <div className="glass rounded-xl p-4 flex flex-wrap gap-3 items-end animate-slide-up">
            <div><label className="text-xs text-muted-foreground block mb-1">Name</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Target name" className="w-48 bg-secondary border-border text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Target ($)</label>
              <Input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="10000" className="w-28 bg-secondary border-border text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Deadline</label>
              <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-40 bg-secondary border-border text-sm" /></div>
            <Button size="sm" onClick={handleAdd}>Create</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targets.map(t => {
            const pct = Math.min(100, (t.current / t.target) * 100);
            const isComplete = pct >= 100;
            return (
              <div key={t.id} className={`glass rounded-xl p-5 ${isComplete ? 'border-success/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isComplete ? <Trophy className="h-5 w-5 text-warning" /> : <Target className="h-5 w-5 text-primary" />}
                    <h3 className="font-medium text-foreground">{t.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(t.current)} / {fmt(t.target)}</span>
                  <span>Due: {t.deadline}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Performance Summary
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{targets.length}</div>
              <div className="text-xs text-muted-foreground">Active Targets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{targets.filter(t => (t.current / t.target) >= 1).length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.round(targets.reduce((a, t) => a + (t.current / t.target) * 100, 0) / targets.length)}%</div>
              <div className="text-xs text-muted-foreground">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
