'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50';

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 focus-visible:ring-purple-500 shadow-lg shadow-purple-500/25',
    secondary: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 focus-visible:ring-cyan-600 shadow-lg shadow-cyan-600/25',
    // Success mirrors the emerald/teal accent used by admission modules.
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 focus-visible:ring-emerald-600 shadow-lg shadow-emerald-600/25',
    // Warning (orange) is the academic-manager accent for allocation/transfer actions.
    warning: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 focus-visible:ring-orange-600 shadow-lg shadow-orange-600/25',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus-visible:ring-red-600 shadow-lg shadow-red-600/25',
    // White button for use on top of colored banners.
    white: 'bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-400 shadow-lg',
    outline: 'border-2 border-purple-300 text-purple-700 bg-white hover:bg-purple-50 hover:border-purple-400 focus-visible:ring-purple-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
