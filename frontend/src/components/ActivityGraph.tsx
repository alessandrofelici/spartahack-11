import { 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Scatter
} from 'recharts';

interface GraphDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
  isAttack?: boolean;
}

interface ActivityGraphProps {
  color: string;
  data: GraphDataPoint[];
  title?: string;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ color, data, title }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // SMART FORMATTER: Handles tiny crypto prices (PEPE/SHIB) vs normal prices (ETH)
  const formatPrice = (value: number) => {
    if (value === 0) return '0';
    if (value < 0.0001) return value.toFixed(8); // Show 8 decimals for memecoins
    if (value < 1) return value.toFixed(5);      // Show 5 decimals for cents
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 }); // Normal comma style
  };

  const AttackDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isAttack) return null;
    
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" fill="#ef4444" fillOpacity="0.4">
          <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="10" r="4" fill="#ef4444" stroke="white" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div className="h-[500px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">{title}</div>
        <div className="flex gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: color}}></div> Price Action</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> MEV Attack</span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
            
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              style={{ fontSize: '10px', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            
            <YAxis 
              yAxisId="left"
              stroke="#6b7280"
              style={{ fontSize: '10px', fontFamily: 'monospace' }}
              tickFormatter={formatPrice} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={80} // Increased width for long numbers
            />
            
            <YAxis yAxisId="right" orientation="right" hide domain={[0, 'dataMax * 5']} />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
              }}
              labelFormatter={(label) => formatTime(label as number)}
              formatter={(value: any, name: string) => [
                  name === 'price' ? `${Number(value) < 1 ? Number(value).toFixed(8) : Number(value).toFixed(2)}` : value, 
                  name === 'price' ? 'Price' : 'Volume'
              ]}
            />
            
            <Bar 
              yAxisId="right"
              dataKey="volume" 
              barSize={2} 
              fill="#4b5563" 
              radius={[2, 2, 0, 0]}
              opacity={0.3}
              isAnimationActive={false} // Performance Fix
            />

            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              fill="url(#colorPrice)"
              strokeWidth={2}
              isAnimationActive={false} // Performance Fix: Critical for 1s updates
            />

            <Scatter 
               yAxisId="left"
               dataKey="price" 
               shape={<AttackDot />} 
               isAnimationActive={false} // Performance Fix
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityGraph;