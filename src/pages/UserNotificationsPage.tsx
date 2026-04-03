import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Bell, Check, Trash2, Filter, Megaphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSync } from '@/hooks/useStoreSync';
import { getNotificationsForUser, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/lib/store';

export default function UserNotificationsPage() {
  useStoreSync();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcements'>('all');
  const allNotifications = user ? getNotificationsForUser(user.id) : [];
  const filtered = filter === 'unread' ? allNotifications.filter(n => !n.read) : filter === 'announcements' ? allNotifications.filter(n => n.type === 'announcement') : allNotifications;
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const typeIcon = (type: string) => { switch (type) { case 'announcement': return <Megaphone className="h-4 w-4" />; case 'warning': case 'alert': return <AlertTriangle className="h-4 w-4" />; default: return <Bell className="h-4 w-4" />; } };
  const typeColor = (type: string) => { switch (type) { case 'success': return 'bg-success/10 text-success'; case 'warning': return 'bg-warning/10 text-warning'; case 'alert': return 'bg-destructive/10 text-destructive'; default: return 'bg-primary/10 text-primary'; } };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Notifications</h1><p className="text-sm text-muted-foreground">{unreadCount} unread</p></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilter(f => f === 'all' ? 'unread' : f === 'unread' ? 'announcements' : 'all')} className="gap-1"><Filter className="h-3.5 w-3.5" /> {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Announcements'}</Button>
            <Button variant="outline" size="sm" onClick={() => user && markAllNotificationsRead(user.id)} className="gap-1"><Check className="h-3.5 w-3.5" /> Mark All Read</Button>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} className={`glass rounded-xl p-4 flex items-start gap-4 transition-colors ${!n.read ? 'border-primary/20' : 'opacity-80'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor(n.type)}`}>{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  {n.type === 'announcement' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Announcement</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">{n.time}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)} className="h-7 w-7 p-0"><Check className="h-3.5 w-3.5 text-muted-foreground" /></Button>}
                <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="glass rounded-xl p-12 text-center"><Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No notifications</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
