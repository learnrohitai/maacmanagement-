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

export function StatCard({ title, value, icon, color, trend }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-indigo-600',
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-emerald-500 to-green-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    pink: 'from-pink-500 to-fuchsia-600'
  };

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
            <p className="text-sm text-emerald-500 mt-1 flex items-center">
              <span className="mr-1">↑</span>
              {trend}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.purple} flex items-center justify-center text-white shadow-lg`}
        >
          {icon}
        </motion.div>
      </div>
    </Card>
  );
}
