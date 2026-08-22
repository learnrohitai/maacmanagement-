'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, ArrowRight, Sparkles, Users, BookOpen, CreditCard, Shield, UserCheck } from 'lucide-react';

const roleQuickLogin = [
  { role: 'admin', label: 'Admin', email: 'admin@maac.com', icon: <Shield className="w-5 h-5" />, color: 'from-purple-500 to-indigo-600' },
  { role: 'teacher', label: 'Teacher', email: 'rahul@maac.com', icon: <BookOpen className="w-5 h-5" />, color: 'from-cyan-500 to-blue-600' },
  { role: 'academic-manager', label: 'Academic', email: 'academic@maac.com', icon: <Users className="w-5 h-5" />, color: 'from-orange-500 to-amber-600' },
  { role: 'counselor', label: 'Counselor', email: 'counselor@maac.com', icon: <UserCheck className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
];

const bgBubbles = [
  { left: '10%', top: '20%', duration: 6, delay: 0, x: 20, y: -30 },
  { left: '25%', top: '70%', duration: 8, delay: 1, x: -30, y: 25 },
  { left: '45%', top: '15%', duration: 7, delay: 2, x: 15, y: -20 },
  { left: '60%', top: '80%', duration: 9, delay: 0.5, x: -25, y: -15 },
  { left: '75%', top: '35%', duration: 6.5, delay: 1.5, x: 30, y: 20 },
  { left: '85%', top: '65%', duration: 8.5, delay: 3, x: -20, y: -25 },
  { left: '15%', top: '50%', duration: 7.5, delay: 2.5, x: 25, y: 15 },
  { left: '35%', top: '85%', duration: 9.5, delay: 1.2, x: -15, y: -30 },
  { left: '55%', top: '40%', duration: 6.8, delay: 0.8, x: 35, y: -10 },
  { left: '90%', top: '10%', duration: 8.2, delay: 2.2, x: -10, y: 35 },
  { left: '5%', top: '80%', duration: 7.2, delay: 3.5, x: 20, y: -20 },
  { left: '70%', top: '90%', duration: 8.8, delay: 1.8, x: -25, y: 15 },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setIsLoading(true);
    const success = await login(userEmail, 'password');
    if (success) {
      router.push('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {bgBubbles.map((bubble, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [0, 1, 0],
                x: bubble.x,
                y: bubble.y,
              }}
              transition={{
                duration: bubble.duration,
                repeat: Infinity,
                delay: bubble.delay,
              }}
              className="absolute w-32 h-32 bg-white/5 rounded-full blur-xl"
              style={{
                left: bubble.left,
                top: bubble.top,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"
              >
                <span className="text-white text-3xl font-bold">M</span>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-white">MAAC Institute</h1>
                <p className="text-white/60">Management Portal</p>
              </div>
            </div>

            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Future of Education
              </span>
            </h2>

            <p className="text-xl text-white/70 mb-12 max-w-lg">
              Manage batches, track attendance, monitor progress, and streamline your institute operations with our advanced management system.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '📚', title: 'Batch Management', desc: 'Organize & track' },
                { icon: '📊', title: 'Analytics', desc: 'Real-time insights' },
                { icon: '👥', title: 'Role-based Access', desc: 'Secure & flexible' },
                { icon: '🎯', title: 'Progress Tracking', desc: 'Track success' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="text-white font-semibold">{feature.title}</p>
                    <p className="text-white/60 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white via-gray-50 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MAAC Institute</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Welcome Back
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Access your dashboard</p>
          </motion.div>

          {/* Quick Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm font-medium text-gray-600 mb-4 text-center">Quick Login as Role</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roleQuickLogin.map((role) => (
                <motion.button
                  key={role.role}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickLogin(role.email)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${role.color} text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  {role.icon}
                  <span className="text-xs font-medium">{role.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or sign in with email</span>
            </div>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            Don&apos;t have an account?{' '}
            <a href="/auth/register" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact Admin
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
