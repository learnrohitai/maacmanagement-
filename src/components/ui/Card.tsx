'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className = '', hover = true, gradient = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${
        gradient ? 'bg-gradient-to-br from-gray-50 to-white' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ title, value, icon, color, trend, trendDirection }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  /** Semantic key ('purple' | 'cyan' | ...) or a raw Tailwind bg-* class (e.g. 'bg-amber-500'). */
  color: string;
  trend?: string;
  /** Controls the trend arrow color: 'up' (green) | 'down' (red) | 'neutral' (gray). Defaults to 'up'. */
  trendDirection?: 'up' | 'down' | 'neutral';
}) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-indigo-600',
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-emerald-500 to-green-600',
    orange: 'from-orange-500 to-amber-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    pink: 'from-pink-500 to-fuchsia-600'
  };

  // Accept both semantic keys and raw Tailwind classes used by some pages
  // (e.g. color: 'bg-emerald-500') so page colors are never silently dropped.
  const iconBg = colorMap[color]
    ? `bg-gradient-to-br ${colorMap[color]}`
    : color;

  const trendStyles: Record<string, string> = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };
  const trendArrows: Record<string, string> = { up: '↑', down: '↓', neutral: '•' };
  const direction = trendDirection || 'up';

  return (
    <Card className="p-6" gradient>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mt-2"
          >
            {value}
          </motion.p>
          {trend && (
            <p className={`text-sm mt-1 flex items-center ${trendStyles[direction]}`}>
              <span className="mr-1">{trendArrows[direction]}</span>
              {trend}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-lg`}
        >
          {icon}
        </motion.div>
      </div>
    </Card>
  );
}
