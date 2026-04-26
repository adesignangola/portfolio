import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';

// Tipos para os dados dos gráficos
interface ChartData {
  value: number;
  label: string;
  color?: string;
}

interface TrendData {
  date: string;
  value: number;
  label?: string;
}

interface CountryData {
  country: string;
  sessions: number;
  percentage: number;
  flag?: string;
}

// Componentes de gráficos modernos

export function MiniSparkline({ data, color = "#635BFF", height = 40 }: { 
  data: number[]; 
  color?: string; 
  height?: number; 
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#gradient-${color})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    </div>
  );
}

export function DonutChart({ data, size = 120 }: { 
  data: ChartData[]; 
  size?: number; 
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;
  
  const paths = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = currentAngle + angle;
    
    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = 50 + 40 * Math.cos(startAngleRad);
    const y1 = 50 + 40 * Math.sin(startAngleRad);
    const x2 = 50 + 40 * Math.cos(endAngleRad);
    const y2 = 50 + 40 * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return (
      <path
        key={item.label}
        d={pathData}
        fill={item.color || '#635BFF'}
        className="transition-all hover:opacity-80"
        style={{ transformOrigin: '50% 50%' }}
      />
    );
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {paths}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center transform rotate-90">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">total</div>
        </div>
      </div>
    </div>
  );
}

export function BarChart({ data, height = 200 }: { 
  data: ChartData[]; 
  height?: number; 
}) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full relative group">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-500"
                  style={{ height: `${barHeight}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LollipopChart({ data, height = 220 }: {
  data: ChartData[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4" style={{ minHeight: height }}>
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;

        return (
          <motion.div
            key={`${item.label}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="grid grid-cols-[76px_1fr_auto] items-center gap-3"
          >
            <span className="text-xs font-medium text-gray-500">{item.label}</span>
            <div className="relative h-8">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#E5E7EB]" />
              <div
                className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
                style={{
                  width: `${Math.max(width, 8)}%`,
                  backgroundColor: item.color || '#635BFF'
                }}
              />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-white shadow-sm"
                style={{
                  left: `calc(${Math.max(width, 8)}% - 8px)`,
                  backgroundColor: item.color || '#635BFF'
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString('pt-PT')}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function HorizontalBarChart({ data }: {
  data: ChartData[];
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;

        return (
          <motion.div
            key={`${item.label}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString('pt-PT')}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(width, 6)}%`,
                  background: `linear-gradient(90deg, ${item.color || '#635BFF'}CC 0%, ${item.color || '#635BFF'} 100%)`
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function StackedShareChart({ data }: {
  data: ChartData[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-full bg-gray-100">
        <div className="flex h-5 w-full">
          {data.map((item, index) => {
            const width = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <motion.div
                key={`${item.label}-${index}`}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="h-full"
                style={{ backgroundColor: item.color || '#635BFF' }}
                title={`${item.label}: ${item.value}`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {data.map((item) => {
          const share = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color || '#635BFF' }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-gray-900">{item.value.toLocaleString('pt-PT')}</span>
                <span className="w-12 text-right text-gray-500">{share.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SplitProgressChart({ data }: {
  data: ChartData[];
}) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const boundedValue = Math.max(0, Math.min(item.value, 100));

        return (
          <motion.div
            key={`${item.label}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
              <span className="text-xl font-bold text-gray-900">{boundedValue.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${boundedValue}%`,
                  background: `linear-gradient(90deg, ${item.color || '#635BFF'}B3 0%, ${item.color || '#635BFF'} 100%)`
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ProgressRing({ 
  value, 
  maxValue, 
  size = 60, 
  strokeWidth = 8, 
  color = "#635BFF" 
}: { 
  value: number; 
  maxValue: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string; 
}) {
  const percentage = (value / maxValue) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-900">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export function TrendIndicator({ 
  current, 
  previous, 
  format = "number" 
}: { 
  current: number; 
  previous: number; 
  format?: "number" | "percentage" | "duration"; 
}) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const formatValue = (value: number) => {
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "duration":
        return `${Math.round(value)}s`;
      default:
        return value.toLocaleString('pt-PT');
    }
  };
  
  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
  const color = isPositive ? "text-green-600" : isNeutral ? "text-gray-500" : "text-red-600";
  
  return (
    <div className="flex items-center gap-1">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  previousValue, 
  icon: Icon, 
  color = "#635BFF",
  format = "number",
  trend 
}: { 
  title: string; 
  value: number | string; 
  change?: number; 
  previousValue?: number; 
  icon: any; 
  color?: string; 
  format?: "number" | "percentage" | "duration"; 
  trend?: "up" | "down" | "neutral"; 
}) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "duration":
        return `${Math.round(val)}s`;
      default:
        return val.toLocaleString('pt-PT');
    }
  };
  
  const getTrendIcon = () => {
    if (!trend) return null;
    const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const color = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
    
    return <Icon className={`h-3 w-3 ${color}`} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
      </div>
      
      {change !== undefined && previousValue !== undefined && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">vs. período anterior</span>
          <TrendIndicator 
            current={value as number} 
            previous={previousValue} 
            format={format} 
          />
        </div>
      )}
    </motion.div>
  );
}

export function WorldMap({ data }: { data: CountryData[] }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="grid grid-cols-2 gap-4">
        {data.slice(0, 6).map((country, index) => (
          <motion.div
            key={country.country}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-50"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{country.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(country.percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8 text-right">{country.percentage}%</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {data.length > 6 && (
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">
            +{data.length - 6} outros países
          </span>
        </div>
      )}
    </div>
  );
}

export function ActivityHeatmap({ data }: { data: Array<{ date: string; value: number }> }) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeks = Math.ceil(data.length / 7);
  
  const getIntensity = (value: number) => {
    const max = Math.max(...data.map(d => d.value));
    const intensity = (value / max) * 4;
    return Math.min(Math.floor(intensity), 4);
  };
  
  const getColor = (intensity: number) => {
    const colors = [
      'bg-gray-100',
      'bg-blue-100',
      'bg-blue-300',
      'bg-blue-500',
      'bg-blue-700'
    ];
    return colors[intensity];
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="grid grid-cols-8 gap-1">
        <div></div>
        {days.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center">
            {day}
          </div>
        ))}
        
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <React.Fragment key={weekIndex}>
            <div className="text-xs text-gray-500 text-right pr-2">
              {weekIndex + 1}
            </div>
            {days.map((_, dayIndex) => {
              const dataIndex = weekIndex * 7 + dayIndex;
              const dayData = data[dataIndex];
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${dayData ? getColor(getIntensity(dayData.value)) : 'bg-gray-50'} border border-gray-200`}
                  title={dayData ? `${dayData.date}: ${dayData.value}` : ''}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function RealtimeCounter({ 
  value, 
  label, 
  icon: Icon, 
  trend 
}: { 
  value: number; 
  label: string; 
  icon: any; 
  trend?: "up" | "down" | "neutral"; 
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-blue-400" />
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-1">
        {value.toLocaleString('pt-PT')}
      </div>
      
      <div className="text-xs text-gray-400">
        {label}
      </div>
    </motion.div>
  );
}
