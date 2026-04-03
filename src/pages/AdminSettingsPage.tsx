import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Save, Server, Shield, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('SalesIQ');
  const [siteUrl, setSiteUrl] = useState('https://salesiq.demo.com');
  const [maxUsers, setMaxUsers] = useState('500');
  const [dataRetention, setDataRetention] = useState('365');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Global configuration for SalesIQ</p>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Platform Name</label>
              <Input value={siteName} onChange={e => setSiteName(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Site URL</label>
              <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="bg-secondary border-border" /></div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Server className="h-4 w-4 text-primary" /> Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Max Users</label>
              <Input value={maxUsers} onChange={e => setMaxUsers(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">API Rate Limit (req/min)</label>
              <Input value={apiRateLimit} onChange={e => setApiRateLimit(e.target.value)} className="bg-secondary border-border" /></div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Security</h3>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', value: twoFactor, set: setTwoFactor },
              { label: 'Maintenance Mode', desc: 'Disable user access temporarily', value: maintenanceMode, set: setMaintenanceMode },
              { label: 'Auto Backup', desc: 'Daily automatic database backups', value: autoBackup, set: setAutoBackup },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button onClick={() => item.set(!item.value)} className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${item.value ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Data</h3>
          <div><label className="text-xs text-muted-foreground block mb-1">Data Retention (days)</label>
            <Input value={dataRetention} onChange={e => setDataRetention(e.target.value)} className="bg-secondary border-border w-32" /></div>
        </div>

        <Button onClick={() => toast.success('Settings saved successfully')} className="gap-1"><Save className="h-3.5 w-3.5" /> Save All Settings</Button>
      </div>
    </DashboardLayout>
  );
}
