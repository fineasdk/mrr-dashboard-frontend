import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, change, trend, description, icon: Icon, className }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <Card className={cn("card hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn(
            "flex items-center text-xs font-semibold",
            trend === 'up' ? "text-green-600" : "text-red-600"
          )}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}