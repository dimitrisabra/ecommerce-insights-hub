import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSales, generateForecast } from '@/lib/mockData';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import KpiCard from '@/components/KpiCard';

export default function ForecastPage() {
  const { user } = useAuth();
  const sales = useMemo(() => user ? getUserSales(user.id) : [], [user]);
  const forecast = useMemo(() => generateForecast(sales, 3), [sales]);

  const chartData = useMemo(() => {
    const hist = forecast.historical.map(([month, value]) => ({ month, actual: Math.round(value), forecast: null as number | null }));
    const last = hist[hist.length - 1];
    const fc = forecast.forecast.map(([month, value]) => ({ month, actual: null as number | null, forecast: value }));
    // Connect forecast to last historical point
    if (last && fc.length) fc[0] = { ...fc[0], actual: last.actual };
    return [...hist, ...fc];
  }, [forecast]);

  const totalForecast = forecast.forecast.reduce((a, [, v]) => a + v, 0);
  const lastHistorical = forecast.historical.length ? forecast.historical[forecast.historical.length - 1][1] : 0;
  const growth = lastHistorical ? ((forecast.forecast[0]?.[1] || 0) / lastHistorical - 1) * 100 : 0;

  const insights = [
    'Revenue is trending upward with seasonal fluctuations detected.',
    'Recommend increasing inventory for top-performing products ahead of projected demand surge.',
    'Asia Pacific region shows strongest growth potential — consider targeted campaigns.',
    'Average order value can be improved with bundling strategies on mid-tier products.',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> AI Sales Forecast
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Predictive analytics powered by trend analysis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard title="Forecasted Revenue (3mo)" value={`$${(totalForecast / 1000).toFixed(1)}k`} icon={Target} />
          <KpiCard title="Projected Growth" value={`${growth.toFixed(1)}%`} change="vs last period" positive={growth > 0} icon={TrendingUp} />
          <KpiCard title="Confidence" value="87%" icon={Zap} />
        </div>

        {/* Forecast chart */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Actual vs Forecasted Revenue</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280,67%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(280,67%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }} />
              <Area type="monotone" dataKey="actual" stroke="hsl(217,91%,60%)" fill="url(#gradActual)" strokeWidth={2} connectNulls={false} />
              <Area type="monotone" dataKey="forecast" stroke="hsl(280,67%,60%)" fill="url(#gradForecast)" strokeWidth={2} strokeDasharray="5 5" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-primary inline-block" /> Actual</span>
            <span className="flex items-center gap-2"><span className="w-3 h-0.5 inline-block" style={{ background: 'hsl(280,67%,60%)' }} /> Forecast</span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> AI-Generated Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-primary text-sm mt-0.5">💡</span>
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
