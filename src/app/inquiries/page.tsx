'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit,
  GraduationCap,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import { InquiryLead } from '@/types';

export default function InquiriesPage() {
  const { inquiries, addInquiry, updateInquiry, deleteInquiry } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<InquiryLead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    interestedCourse: 'Animation',
    source: 'Walk-in' as InquiryLead['source'],
    notes: '',
    followUpDate: new Date().toISOString().split('T')[0],
    budget: 80000,
  });

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch =
      i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.phone.includes(searchTerm) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || i.interestedCourse === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: InquiryLead = {
      id: `inq-${Date.now()}`,
      studentName: formData.studentName,
      phone: formData.phone,
      email: formData.email,
      interestedCourse: formData.interestedCourse,
      source: formData.source,
      status: 'new',
      counselorName: 'Priya Sharma',
      counselorId: '8',
      notes: formData.notes,
      followUpDate: formData.followUpDate,
      createdAt: new Date().toISOString().split('T')[0],
      budget: Number(formData.budget) || 0
    };
    addInquiry(newLead);
    setIsAddModalOpen(false);
    setFormData({
      studentName: '',
      phone: '',
      email: '',
      interestedCourse: 'Animation',
      source: 'Walk-in',
      notes: '',
      followUpDate: new Date().toISOString().split('T')[0],
      budget: 80000,
    });
  };

  const getStatusBadge = (status: InquiryLead['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">New Lead</Badge>;
      case 'contacted':
        return <Badge variant="warning">Contacted</Badge>;
      case 'counseling-scheduled':
        return <Badge variant="purple">Visit Scheduled</Badge>;
      case 'demo-booked':
        return <Badge variant="purple">Demo Booked</Badge>;
      case 'enrolled':
        return <Badge variant="success">Admitted 🎉</Badge>;
      case 'lost':
        return <Badge variant="danger">Dropped</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Inquiries & Admissions</h1>
          <p className="text-gray-500 text-sm">Track candidate admissions pipeline, counseling calls, and follow-ups</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="new">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="counseling-scheduled">Counseling Scheduled</option>
            <option value="demo-booked">Demo Booked</option>
            <option value="enrolled">Admitted / Enrolled</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Programs</option>
            <option value="Animation">3D Animation</option>
            <option value="VFX">VFX & Compositing</option>
            <option value="Game Design">Game Art & Design</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Motion Graphics">Motion Graphics</option>
          </select>
        </div>
      </Card>

      {/* Inquiries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInquiries.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{lead.studentName}</h3>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">{lead.interestedCourse}</p>
                </div>
                {getStatusBadge(lead.status)}
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 my-4 bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Follow-up: <strong className="text-gray-800">{lead.followUpDate}</strong></span>
                </div>
              </div>

              {lead.notes && (
                <p className="text-xs text-gray-500 line-clamp-2 italic mb-4">
                  &ldquo;{lead.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Src: {lead.source}</span>
              <div className="flex items-center gap-2">
                {lead.status !== 'enrolled' && (
                  <Button
                    size="sm"
                    onClick={() => updateInquiry(lead.id, { status: 'enrolled' })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    Admit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedLead(lead);
                    setIsDetailModalOpen(true);
                  }}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-800"
                >
                  Details
                </Button>
                <button
                  onClick={() => deleteInquiry(lead.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedLead && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Candidate Profile: ${selectedLead.studentName}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Program Interest</p>
                <p className="font-semibold text-gray-900">{selectedLead.interestedCourse}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stage Status</p>
                <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Contact Number</p>
                <p className="font-medium text-gray-800">{selectedLead.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-medium text-gray-800 truncate">{selectedLead.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lead Source</p>
                <p className="font-medium text-gray-800">{selectedLead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned Counselor</p>
                <p className="font-medium text-gray-800">{selectedLead.counselorName}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Counseling Session Notes</p>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-700 text-xs leading-relaxed">
                {selectedLead.notes || 'No specific notes recorded for this candidate yet.'}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedLead.status !== 'enrolled' && (
                <Button
                  onClick={() => {
                    updateInquiry(selectedLead.id, { status: 'enrolled' });
                    setIsDetailModalOpen(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Convert to Admission
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Prospective Student Lead"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Candidate Name"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="candidate@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Interested Program
              </label>
              <select
                value={formData.interestedCourse}
                onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              >
                <option value="Animation">3D Animation</option>
                <option value="VFX">VFX & Compositing</option>
                <option value="Game Design">Game Art & Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Motion Graphics">Motion Graphics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as InquiryLead['source'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              >
                <option value="Walk-in">Campus Walk-in</option>
                <option value="Website">Website Form</option>
                <option value="Social Media">Social Media (Instagram/FB)</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Referral">Student Referral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Counseling Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Candidate background, discussion notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
