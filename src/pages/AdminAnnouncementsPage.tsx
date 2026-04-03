import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Megaphone, Plus, Trash2, Send, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getAnnouncements, addAnnouncement, deleteAnnouncement, type Announcement } from '@/lib/store';

export default function AdminAnnouncementsPage() {
  useStoreSync();
  const { user } = useAuth();
  const announcements = getAnnouncements();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<Announcement['audience']>('All Users');
  const [priority, setPriority] = useState<Announcement['priority']>('normal');

  const handleAdd = () => {
    if (!title || !message) return;
    addAnnouncement({ title, message, audience, priority, createdAt: new Date().toISOString().split('T')[0], createdBy: user?.name || 'Admin' });
    setTitle(''); setMessage(''); setShowAdd(false); setPriority('normal'); setAudience('All Users');
    toast.success('Announcement sent — users will see it in their notifications!');
  };
  const handleDelete = (id: string) => { deleteAnnouncement(id); toast.success('Announcement deleted'); };
  const priorityColor = (p: string) => { switch (p) { case 'urgent': return 'bg-destructive/10 text-destructive'; case 'high': return 'bg-warning/10 text-warning'; case 'low': return 'bg-muted text-muted-foreground'; default: return 'bg-primary/10 text-primary'; } };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Announcements</h1><p className="text-sm text-muted-foreground">Broadcast messages — users see these in their notifications</p></div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1"><Plus className="h-3.5 w-3.5" /> New Announcement</Button>
        </div>
        {showAdd && (
          <div className="glass rounded-xl p-5 space-y-3 animate-slide-up">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." className="bg-secondary border-border" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your announcement..." className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground resize-none h-24 outline-none focus:border-primary" />
            <div className="flex flex-wrap gap-3">
              <Select value={audience} onValueChange={v => setAudience(v as Announcement['audience'])}><SelectTrigger className="w-40 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All Users">All Users</SelectItem><SelectItem value="Sales Team">Sales Team</SelectItem><SelectItem value="Admins Only">Admins Only</SelectItem></SelectContent></Select>
              <Select value={priority} onValueChange={v => setPriority(v as Announcement['priority'])}><SelectTrigger className="w-32 bg-secondary border-border text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
              <Button size="sm" onClick={handleAdd} className="gap-1"><Send className="h-3.5 w-3.5" /> Send</Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-foreground">{announcements.length}</div><div className="text-xs text-muted-foreground">Total Sent</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-warning">{announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}</div><div className="text-xs text-muted-foreground">High Priority</div></div>
          <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-bold text-success">{announcements.filter(a => a.createdAt === new Date().toISOString().split('T')[0]).length}</div><div className="text-xs text-muted-foreground">Today</div></div>
        </div>
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">{a.priority === 'urgent' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Megaphone className="h-4 w-4 text-primary" />}</div>
                  <div>
                    <h3 className="font-medium text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.createdAt}</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary">{a.audience}</span>
                      <span className={'px-2 py-0.5 rounded-full ' + priorityColor(a.priority)}>{a.priority}</span>
                      <span className="text-muted-foreground/60">by {a.createdBy}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="shrink-0"><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
