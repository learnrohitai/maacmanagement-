'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { currentUser } = useStore();
  const [isDark, setIsDark] = useState(false);

  const roleLabels: Record<string, string> = {
    'admin': 'Administrator',
    'teacher': 'Teacher',
    'student': 'Student',
    'academic-manager': 'Academic Manager',
    'account-manager': 'Account Manager',
    'counselor': 'Admission Counselor'
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-20"
    >
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100/80 border border-transparent focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all duration-300 outline-none text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-500">{roleLabels[currentUser?.role || '']}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg"
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
