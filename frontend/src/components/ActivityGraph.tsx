import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

interface PriceDataPoint {
  timestamp: number;
  change: number;
}

interface ActivityGraphProps {
  color: string;
  data: PriceDataPoint[];
  title?: string;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ color, data, title = "Price Volatility" }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className="h-48 w-full">
      <div className="text-xs text-gray-400 mb-2">{title}</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorChange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            stroke="#4b5563"
            style={{ fontSize: '10px' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#4b5563"
            style={{ fontSize: '10px' }}
            tickFormatter={formatChange}
            tickLine={false}
            width={50}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelFormatter={(label: any) => formatTime(label as number)}
            formatter={(value: any) => [formatChange(value as number), 'Change']}
          />
          <Area 
            type="monotone" 
            dataKey="change" 
            stroke={color} 
            fill="url(#colorChange)"
            strokeWidth={2}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityGraph;