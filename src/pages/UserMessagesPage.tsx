import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Mail, Send, Inbox, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getInboxForUser, getSentForUser, sendMessage, markMessageRead } from '@/lib/store';
import { getUsers } from '@/lib/mockData';

export default function UserMessagesPage() {
  useStoreSync();
  const { user } = useAuth();
  const [tab, setTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const inbox = user ? getInboxForUser(user.id) : [];
  const sent = user ? getSentForUser(user.id) : [];
  const admins = useMemo(() => getUsers().filter(u => u.role === 'admin'), []);

  const handleSend = () => {
    if (!subject || !body || !user || !admins.length) return;
    const admin = admins[0];
    sendMessage({ fromUserId: user.id, fromName: user.name, toUserId: admin.id, toName: admin.name, subject, body });
    setSubject(''); setBody(''); setTab('sent');
    toast.success('Message sent to admin');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Messages</h1><p className="text-sm text-muted-foreground">Contact support & admins</p></div>
          <Button size="sm" onClick={() => setTab('compose')} className="gap-1"><Mail className="h-3.5 w-3.5" /> New Message</Button>
        </div>

        <div className="flex rounded-lg bg-secondary p-1 w-fit">
          {(['inbox', 'sent', 'compose'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t === 'inbox' ? `Inbox (${inbox.filter(m => !m.read).length})` : t === 'sent' ? `Sent (${sent.length})` : 'Compose'}
            </button>
          ))}
        </div>

        {tab === 'compose' && (
          <div className="glass rounded-xl p-5 space-y-3 animate-slide-up">
            <div className="text-xs text-muted-foreground">Sending to: Admin Team</div>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..." className="bg-secondary border-border" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground resize-none h-32 outline-none focus:border-primary" />
            <Button size="sm" onClick={handleSend} className="gap-1"><Send className="h-3.5 w-3.5" /> Send</Button>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="space-y-2">
            {inbox.length === 0 && <div className="glass rounded-xl p-12 text-center"><Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No messages yet</p></div>}
            {inbox.map(m => (
              <div key={m.id} className={`glass rounded-xl p-4 cursor-pointer transition-colors ${!m.read ? 'border-primary/20' : 'opacity-80'}`} onClick={() => markMessageRead(m.id)}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{m.fromName}</span>{!m.read && <span className="w-2 h-2 rounded-full bg-primary" />}</div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {m.createdAt}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground ml-5">{m.subject}</h3>
                <p className="text-xs text-muted-foreground ml-5 mt-1">{m.body}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'sent' && (
          <div className="space-y-2">
            {sent.length === 0 && <div className="glass rounded-xl p-12 text-center"><Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No sent messages</p></div>}
            {sent.map(m => (
              <div key={m.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">To:</span><span className="text-sm font-medium text-foreground">{m.toName}</span></div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {m.createdAt}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground">{m.subject}</h3>
                <p className="text-xs text-muted-foreground mt-1">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
