import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getFeedbacks, updateFeedbackStatus, type Feedback } from '@/lib/store';

export default function AdminFeedbackPage() {
  useStoreSync();
  const feedbacks = getFeedbacks();
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = statusFilter === 'all' ? feedbacks : feedbacks.filter(f => f.status === statusFilter);

  const handleReply = (id: string) => {
    if (!replyText) return;
    updateFeedbackStatus(id, 'in_progress', replyText);
    setReplyText(''); setReplyingTo(null);
    toast.success('Response sent to user');
  };

  const statusColor = (s: string) => { switch (s) { case 'open': return 'bg-warning/10 text-warning'; case 'in_progress': return 'bg-primary/10 text-primary'; case 'resolved': return 'bg-success/10 text-success'; case 'closed': return 'bg-muted text-muted-foreground'; default: return 'bg-muted text-muted-foreground'; } };
  const typeColor = (t: string) => { switch (t) { case 'bug': return 'bg-destructive/10 text-destructive'; case 'feature': return 'bg-primary/10 text-primary'; case 'complaint': return 'bg-warning/10 text-warning'; default: return 'bg-muted text-muted-foreground'; } };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">User Feedback</h1><p className="text-sm text-muted-foreground">{feedbacks.filter(f => f.status === 'open').length} open tickets</p></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-foreground">{feedbacks.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-warning">{feedbacks.filter(f => f.status === 'open').length}</div><div className="text-xs text-muted-foreground">Open</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-primary">{feedbacks.filter(f => f.status === 'in_progress').length}</div><div className="text-xs text-muted-foreground">In Progress</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-success">{feedbacks.filter(f => f.status === 'resolved').length}</div><div className="text-xs text-muted-foreground">Resolved</div></div>
        </div>
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">{f.subject}</h3>
                  <span className={'text-[10px] px-1.5 py-0.5 rounded font-medium ' + typeColor(f.type)}>{f.type}</span>
                  <span className={'text-[10px] px-1.5 py-0.5 rounded font-medium ' + statusColor(f.status)}>{f.status.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {f.createdAt}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{f.message}</p>
              <p className="text-xs text-muted-foreground ml-6 mt-1">From: {f.userName}</p>
              {f.adminResponse && <div className="ml-6 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10"><p className="text-xs text-primary font-medium mb-1">Admin Response:</p><p className="text-sm text-foreground">{f.adminResponse}</p></div>}
              <div className="ml-6 mt-3 flex gap-2">
                {f.status !== 'resolved' && f.status !== 'closed' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setReplyingTo(replyingTo === f.id ? null : f.id)} className="text-xs">Reply</Button>
                    <Button variant="outline" size="sm" onClick={() => { updateFeedbackStatus(f.id, 'resolved'); toast.success('Marked as resolved'); }} className="text-xs gap-1"><CheckCircle className="h-3 w-3" /> Resolve</Button>
                  </>
                )}
                {f.status === 'resolved' && <Button variant="outline" size="sm" onClick={() => { updateFeedbackStatus(f.id, 'closed'); toast.success('Closed'); }} className="text-xs">Close</Button>}
              </div>
              {replyingTo === f.id && (
                <div className="ml-6 mt-3 flex gap-2 animate-slide-up">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response..." className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-16 outline-none focus:border-primary" />
                  <Button size="sm" onClick={() => handleReply(f.id)} className="gap-1 self-end"><Send className="h-3.5 w-3.5" /> Send</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
