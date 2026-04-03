import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
}

export default function KpiCard({ title, value, change, positive, icon: Icon }: KpiCardProps) {
  return (
    <div className="glass rounded-xl p-5 animate-fade-in hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {change && (
        <span className={`text-xs font-medium mt-1 inline-block ${positive ? 'text-success' : 'text-destructive'}`}>
          {positive ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );
}
