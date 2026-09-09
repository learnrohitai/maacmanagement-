'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Table';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Camera,
  Mail,
  Phone,
  Lock,
  Moon,
  Sun
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDark, setIsDark] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-4 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{currentUser?.name}</h4>
                  <p className="text-gray-500 capitalize">{currentUser?.role?.replace('-', ' ')}</p>
                  <Badge variant="success" className="mt-2">Active</Badge>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    defaultValue={currentUser?.name}
                    icon={<User className="w-5 h-5" />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue={currentUser?.email}
                    icon={<Mail className="w-5 h-5" />}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    defaultValue={currentUser?.phone}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <Input
                    label="Role"
                    defaultValue={currentUser?.role?.replace('-', ' ')}
                    disabled
                  />
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive email updates about your account', enabled: true },
                  { label: 'Push Notifications', description: 'Receive push notifications on your device', enabled: true },
                  { label: 'SMS Notifications', description: 'Receive text messages for important updates', enabled: false },
                  { label: 'Marketing Emails', description: 'Receive emails about new features and offers', enabled: false },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
              <form className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  icon={<Lock className="w-5 h-5" />}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  icon={<Lock className="w-5 h-5" />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  icon={<Lock className="w-5 h-5" />}
                />
                <div className="flex justify-end">
                  <Button>
                    <Shield className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <p className="font-medium text-gray-900">Dark Mode</p>
                      <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={() => setIsDark(!isDark)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {['bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'].map((color, index) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full ${color} ${
                          index === 0 ? 'ring-4 ring-offset-2 ring-purple-500' : ''
                        } transition-all hover:scale-110`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-3">Language</p>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 bg-white shadow-sm">
                    <option className="text-gray-900 bg-white">English</option>
                    <option className="text-gray-900 bg-white">Hindi</option>
                    <option className="text-gray-900 bg-white">Marathi</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
