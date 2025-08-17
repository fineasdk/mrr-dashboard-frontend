import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlatformBreakdown } from '../../lib/types';

interface PlatformChartProps {
  data: PlatformBreakdown[];
}

export function PlatformChart({ data }: PlatformChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="revenue"
              nameKey="platform"
              label={({ platform, percentage }) => `${platform} ${percentage.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.platform} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.platform}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">{item.customers} customers</span>
                <span className="font-medium">{formatCurrency(item.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}