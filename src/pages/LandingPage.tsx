import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BarChart3, ArrowRight, Zap, Shield, Globe, TrendingUp, Users, Brain,
  ChevronDown, CheckCircle2, Star, Sparkles, LineChart, PieChart,
  Activity, Target, Layers, Lock, BarChart, Monitor,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Brain, title: 'AI-Powered Forecasting', desc: 'Predict future sales trends using advanced trend analysis and machine learning algorithms.' },
  { icon: LineChart, title: 'Real-time Analytics', desc: 'Interactive dashboards with live data visualization, KPIs, and performance metrics.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate admin and user dashboards with secure authentication and role switching.' },
  { icon: PieChart, title: 'Visual Reports', desc: 'Beautiful charts for revenue, products, regions, and forecasting with export options.' },
  { icon: Users, title: 'Team Management', desc: 'Full user administration with search, filtering, activity tracking, and bulk operations.' },
  { icon: Target, title: 'Sales Targets', desc: 'Set and track revenue goals with progress indicators and achievement notifications.' },
  { icon: Globe, title: 'Multi-Region Support', desc: 'Track sales across 6+ global regions with regional performance comparisons.' },
  { icon: Activity, title: 'Activity Monitoring', desc: 'Complete audit trail of platform activity with real-time event logging.' },
  { icon: Layers, title: 'Data Management', desc: 'Full CRUD operations on sales records with inline editing, import, and export.' },
  { icon: Lock, title: 'Secure Platform', desc: 'JWT-based authentication with encrypted credentials and protected API routes.' },
  { icon: BarChart, title: 'Product Analytics', desc: 'Deep insights into product performance, best sellers, and inventory optimization.' },
  { icon: Monitor, title: 'System Health', desc: 'Admin dashboard with platform health monitoring, uptime stats, and performance metrics.' },
];

const stats = [
  { value: '500+', label: 'Sales Records' },
  { value: '60+', label: 'Demo Accounts' },
  { value: '20+', label: 'Product SKUs' },
  { value: '6', label: 'Global Regions' },
];

const faqs = [
  { q: 'What is SalesIQ?', a: 'SalesIQ is a full-stack e-commerce analytics and AI-powered sales forecasting platform. It provides real-time dashboards, role-based access, and predictive analytics for sales teams.' },
  { q: 'How does the AI forecasting work?', a: 'Our forecasting engine uses linear regression and trend analysis on historical sales data to predict future revenue. It generates 3-month forecasts with confidence intervals and actionable insights.' },
  { q: 'Can I switch between admin and user views?', a: 'Yes! SalesIQ features instant role switching. You can toggle between admin and user dashboards without logging out, perfect for demos and testing.' },
  { q: 'What data is pre-loaded?', a: 'The platform comes with 50+ user accounts, 10+ admin accounts, and 500+ randomly generated sales records spanning products across 6 global regions.' },
  { q: 'What charts and visualizations are available?', a: 'Area charts for revenue trends, bar charts for product performance, pie charts for regional distribution, forecast charts with actual vs predicted data, and KPI cards with growth indicators.' },
  { q: 'Is this suitable for a portfolio project?', a: 'Absolutely! SalesIQ demonstrates full-stack development, AI integration, data visualization, role-based auth, and enterprise-grade UI design — all key skills recruiters look for.' },
  { q: 'Can I export data?', a: 'Yes, users can export sales data as CSV files and download dashboard reports. Admins can also export platform-wide analytics.' },
  { q: 'What admin features are available?', a: 'Admins get user management, platform-wide analytics, activity logs, system health monitoring, announcement broadcasting, revenue targets, and complete sales data management.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-text">SalesIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-muted-foreground">
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/login')} className="gap-1">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" /> AI-Powered Sales Intelligence
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Analytics That <br />
              <span className="gradient-text">Drive Revenue</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade e-commerce analytics with AI forecasting, real-time dashboards,
              and role-based access control. Built for modern sales teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2 text-base px-8 glow">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2 text-base px-8">
                Explore Features <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hero preview mock */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in">
            <div className="glass rounded-2xl p-1 glow">
              <div className="bg-card rounded-xl p-6 space-y-4">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['$127.4k Revenue', '342 Orders', '$372 AOV', '$40.8k Profit'].map((t, i) => (
                    <div key={i} className="bg-secondary rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1">{t.split(' ').slice(1).join(' ')}</div>
                      <div className="text-lg font-bold text-foreground">{t.split(' ')[0]}</div>
                      <div className="text-xs text-success mt-1">↑ {12 + i * 3}%</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-4 h-32 flex items-end">
                    <div className="flex gap-1 items-end w-full">
                      {[40, 55, 35, 70, 50, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 h-32 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-primary border-t-success border-r-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center animate-fade-in">
                <div className="text-3xl font-extrabold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive analytics toolkit for e-commerce teams of all sizes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social proof */}
      <section className="py-20 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-warning text-warning" />)}
          </div>
          <blockquote className="text-xl text-foreground font-medium leading-relaxed mb-6">
            "SalesIQ transformed how our team tracks performance. The AI forecasting alone has improved our
            quarterly planning accuracy by 40%. The admin dashboard gives us complete visibility."
          </blockquote>
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Sarah Chen</span> — VP of Sales, TechCorp Inc.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about SalesIQ.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass rounded-2xl p-12 text-center glow">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Boost Your Sales?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Start exploring your analytics dashboard with pre-loaded data. No setup required.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2 text-base px-10">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-bold gradient-text">SalesIQ</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <button onClick={() => navigate('/login')} className="hover:text-foreground transition-colors">Dashboard</button>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 SalesIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
