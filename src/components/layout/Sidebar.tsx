'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Settings,
  LogOut,
  CreditCard,
  ChevronLeft,
  Menu,
  X,
  UserCheck,
  UserPlus,
  TrendingUp,
  FileBarChart
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'teacher', 'academic-manager', 'counselor'] },
  { label: 'Create Admission', href: '/admission/new', icon: <UserPlus className="w-5 h-5" />, roles: ['admin', 'counselor'] },
  { label: 'Monthly Report', href: '/monthly-report', icon: <FileBarChart className="w-5 h-5" />, roles: ['admin', 'counselor'] },
  { label: 'Inquiries & Leads', href: '/inquiries', icon: <UserCheck className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Batches', href: '/batches', icon: <BookOpen className="w-5 h-5" />, roles: ['admin', 'teacher', 'academic-manager'] },
  { label: 'Students', href: '/students', icon: <GraduationCap className="w-5 h-5" />, roles: ['admin', 'teacher', 'academic-manager'] },
  { label: 'Teachers', href: '/teachers', icon: <Users className="w-5 h-5" />, roles: ['admin', 'academic-manager'] },
  { label: 'Attendance', href: '/attendance', icon: <ClipboardList className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Course Progress', href: '/course-progress', icon: <TrendingUp className="w-5 h-5" />, roles: ['admin', 'academic-manager'] },
  { label: 'Lesson Plans', href: '/lesson-plans', icon: <Calendar className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Finance', href: '/finance', icon: <CreditCard className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['admin', 'teacher', 'academic-manager', 'counselor'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredItems = navItems.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  // Render function (not a nested component) so no state is lost on re-render
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">MAAC</h1>
              <p className="text-xs text-white/60">Institute Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg shadow-purple-500/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : ''}>{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && (
                  <span className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-white/60 capitalize">{currentUser?.role?.replace('-', ' ')}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/30"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-950 z-50 lg:hidden">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block fixed left-0 top-0 h-full bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-950 z-30"
        style={{ width: isCollapsed ? 80 : 280, transition: 'width 0.2s ease' }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors z-10"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        {renderSidebarContent()}
      </aside>
    </>
  );
}
