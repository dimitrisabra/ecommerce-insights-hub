import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MessageSquare, Plus, Clock, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getFeedbacksForUser, addFeedback, type Feedback } from '@/lib/store';

export default function UserFeedbackPage() {
  useStoreSync();
  const { user } = useAuth();
  const feedbacks = user ? getFeedbacksForUser(user.id) : [];
  const [showAdd, setShowAdd] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Feedback['type']>('general');
  const [priority, setPriority] = useState<Feedback['priority']>('medium');

  const handleSubmit = () => {
    if (!subject || !message || !user) return;
    addFeedback({ userId: user.id, userName: user.name, type, subject, message, priority });
    setSubject(''); setMessage(''); setShowAdd(false);
    toast.success('Feedback submitted — admin will review it');
  };

  const statusColor = (s: string) => { switch (s) { case 'open': return 'bg-warning/10 text-warning'; case 'in_progress': return 'bg-primary/10 text-primary'; case 'resolved': return 'bg-success/10 text-success'; default: return 'bg-muted text-muted-foreground'; } };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Feedback & Support</h1><p className="text-sm text-muted-foreground">Submit feedback, report bugs, request features</p></div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1"><Plus className="h-3.5 w-3.5" /> New Feedback</Button>
        </div>

        {showAdd && (
          <div className="glass rounded-xl p-5 space-y-3 animate-slide-up">
            <div className="flex gap-3">
              <Select value={type} onValueChange={v => setType(v as Feedback['type'])}><SelectTrigger className="w-32 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="bug">Bug Report</SelectItem><SelectItem value="feature">Feature Request</SelectItem><SelectItem value="complaint">Complaint</SelectItem></SelectContent></Select>
              <Select value={priority} onValueChange={v => setPriority(v as Feedback['priority'])}><SelectTrigger className="w-32 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
            </div>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..." className="bg-secondary border-border" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your feedback..." className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground resize-none h-24 outline-none focus:border-primary" />
            <Button size="sm" onClick={handleSubmit} className="gap-1"><Send className="h-3.5 w-3.5" /> Submit</Button>
          </div>
        )}

        <div className="space-y-3">
          {feedbacks.length === 0 && !showAdd && (
            <div className="glass rounded-xl p-12 text-center"><MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No feedback submitted yet</p><p className="text-xs text-muted-foreground mt-1">Click "New Feedback" to get started</p></div>
          )}
          {feedbacks.map(f => (
            <div key={f.id} className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">{f.subject}</h3>
                <span className={'text-[10px] px-1.5 py-0.5 rounded font-medium ' + statusColor(f.status)}>{f.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{f.message}</p>
              <div className="flex items-center gap-3 ml-6 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {f.createdAt}</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary">{f.type}</span>
              </div>
              {f.adminResponse && (
                <div className="ml-6 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary font-medium mb-1">Admin Response:</p>
                  <p className="text-sm text-foreground">{f.adminResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
