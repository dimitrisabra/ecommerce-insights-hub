import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreds, setShowCreds] = useState(true);
  const [roleTab, setRoleTab] = useState<'user' | 'admin'>('user');

  const users = getUsers();
  const demoUsers = users.filter(u => u.role === roleTab).slice(0, 5);

  const handleLogin = () => {
    setError('');
    const ok = login(email, password);
    if (ok) {
      const u = getUsers().find(u => u.email === email);
      navigate(u?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  const fillCreds = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen flex">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="text-center space-y-6 px-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <BarChart3 className="h-12 w-12 text-primary" />
            <span className="text-4xl font-extrabold gradient-text">SalesIQ</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-md">
            Enterprise analytics & AI-powered sales forecasting for modern teams.
          </p>
          <div className="flex gap-4 justify-center text-sm text-muted-foreground">
            <span className="glass px-4 py-2 rounded-full">📊 Real-time Analytics</span>
            <span className="glass px-4 py-2 rounded-full">🤖 AI Forecasting</span>
            <span className="glass px-4 py-2 rounded-full">👥 Role-based Access</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">SalesIQ</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access the dashboard</p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-lg bg-secondary p-1">
            {(['user', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleTab(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  roleTab === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'user' ? '👤 User' : '🛡️ Admin'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@demo.com"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full gap-2">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Demo credentials */}
          <div className="glass rounded-xl p-4">
            <button
              onClick={() => setShowCreds(!showCreds)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full"
            >
              {showCreds ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Demo Credentials ({roleTab})
            </button>
            {showCreds && (
              <div className="mt-3 space-y-2 max-h-48 overflow-auto scrollbar-thin">
                {demoUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => fillCreds(u.email, u.password)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-accent text-xs transition-colors"
                  >
                    <span className="text-foreground font-medium">{u.email}</span>
                    <span className="text-muted-foreground ml-2">/ {u.password}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
