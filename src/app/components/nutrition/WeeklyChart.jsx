import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';

export function WeeklyChart({ data, trend, totalCalories, period = 'Weekly' }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 relative">
      {/* Overlay header and trends - positioned absolutely over the graph */}
      <div className="absolute top-3 left-5 right-5 z-[5] flex justify-between items-start pointer-events-none">
        <h3 className="text-lg font-semibold bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">Your Status - {period}</h3>
        <div className="text-right bg-transparent border-2 border-border rounded-xl px-4 py-2 pointer-events-auto">
          <p className="text-xs text-muted-foreground mb-1">{period} Trends</p>
          <p className="text-xl font-bold text-blue-600">{totalCalories.toLocaleString()} Cal</p>
          <p className={`text-xs font-medium ${trend >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
            {trend >= 0 ? '+' : ''}{trend}% Trend
          </p>
        </div>
      </div>
      
      <div className="h-44 pt-12 relative z-0">
        <ResponsiveContainer width="100%" height="100%" className="relative z-20">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value / 1000}k`}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="calories" 
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorBlue)"
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 7, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}