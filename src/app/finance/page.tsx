'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Plus,
  Search,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  CreditCard,
  Calendar
} from 'lucide-react';

export default function FinancePage() {
  const { feeRecords, batches, students, addFeeRecord } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalCollected = feeRecords.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = feeRecords.filter(f => f.status === 'pending').reduce((acc, f) => acc + f.amount, 0);
  const totalOverdue = feeRecords.filter(f => f.status === 'overdue').reduce((acc, f) => acc + f.amount, 0);

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.batchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-500 mt-1">Track fees, payments, and financial records</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Record Payment
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: `₹${(totalCollected / 1000).toFixed(0)}K`, color: 'bg-emerald-500', icon: <IndianRupee className="w-5 h-5" />, trend: '+12%' },
          { label: 'Pending', value: `₹${(totalPending / 1000).toFixed(0)}K`, color: 'bg-amber-500', icon: <Clock className="w-5 h-5" />, trend: '15 records' },
          { label: 'Overdue', value: `₹${(totalOverdue / 1000).toFixed(0)}K`, color: 'bg-red-500', icon: <AlertTriangle className="w-5 h-5" />, trend: 'Needs attention' },
          { label: 'Collection Rate', value: '87%', color: 'bg-purple-500', icon: <TrendingUp className="w-5 h-5" />, trend: '+5%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' }
            ]}
            className="w-full md:w-48"
          />
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {record.studentName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{record.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.batchName}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">₹{record.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      record.status === 'paid' ? 'success' :
                      record.status === 'pending' ? 'warning' :
                      'danger'
                    }>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.paymentMethod || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {record.paidDate ? new Date(record.paidDate).toLocaleDateString() : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Student"
              options={[
                { value: '', label: 'Select Student' },
                ...students.map(s => ({ value: s.id, label: s.name }))
              ]}
              required
            />
            <Select
              label="Batch"
              options={[
                { value: '', label: 'Select Batch' },
                ...batches.map(b => ({ value: b.id, label: b.name }))
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" placeholder="Enter amount" required />
            <Select
              label="Payment Method"
              options={[
                { value: '', label: 'Select Method' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Card', label: 'Card' }
              ]}
              required
            />
          </div>
          <Input label="Payment Date" type="date" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
