import { useState, useMemo } from 'react';
import { getUsers, deleteUser, type User } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, Shield, UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [, setRefresh] = useState(0);

  const users = useMemo(() => {
    const all = getUsers();
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [search, /* refresh trigger */]);

  const handleDelete = (u: User) => {
    deleteUser(u.id);
    setRefresh(n => n + 1);
    toast.success(`Deleted user ${u.name}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground">{users.length} total accounts</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 30).map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.createdAt}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(u)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
