import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, User, Lock, Palette, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function UserSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Profile */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Email</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary border-border" /></div>
          </div>
          <Button size="sm" onClick={() => toast.success('Profile updated')} className="gap-1"><Save className="h-3.5 w-3.5" /> Save</Button>
        </div>

        {/* Password */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Password</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Current Password</label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">New Password</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary border-border" /></div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success('Password changed')} className="gap-1"><Lock className="h-3.5 w-3.5" /> Update Password</Button>
        </div>

        {/* Notifications */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</h3>
          <div className="space-y-3">
            {[
              { label: 'Email Notifications', desc: 'Receive sales alerts via email', value: emailNotifs, set: setEmailNotifs },
              { label: 'Push Notifications', desc: 'Browser push notifications', value: pushNotifs, set: setPushNotifs },
              { label: 'Weekly Report', desc: 'Automated weekly performance summary', value: weeklyReport, set: setWeeklyReport },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${item.value ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="glass rounded-xl p-5 border-destructive/20 space-y-3">
          <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
          <p className="text-xs text-muted-foreground">Once you delete your account, there is no going back.</p>
          <Button variant="destructive" size="sm" onClick={() => toast.error('Account deletion is disabled in demo mode')}>Delete Account</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
