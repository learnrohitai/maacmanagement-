'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Circle,
  CheckCircle2,
  GripVertical,
  X,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { LessonPlan, Chapter, SubTopic } from '@/types';

export default function LessonPlansPage() {
  const { currentUser, lessonPlans, batches, users, addLessonPlan, updateLessonPlan, deleteLessonPlan } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchId: '',
    date: '',
    duration: '2 hours',
    materials: '',
    chapters: [] as { id: string; name: string; subTopics: { id: string; name: string }[] }[]
  });

  const teachers = users.filter(u => u.role === 'teacher');

  const myBatches = currentUser?.role === 'teacher'
    ? batches.filter(b => b.teacherId === currentUser.id)
    : batches;

  const myLessonPlans = currentUser?.role === 'teacher'
    ? lessonPlans.filter(lp => lp.teacherId === currentUser.id)
    : lessonPlans;

  const filteredPlans = myLessonPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.batchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper to calculate progress
  const getPlanProgress = (plan: LessonPlan) => {
    const allSubTopics = plan.chapters.flatMap(c => c.subTopics);
    if (allSubTopics.length === 0) return 0;
    const completed = allSubTopics.filter(st => st.isCompleted).length;
    return Math.round((completed / allSubTopics.length) * 100);
  };

  const getChapterProgress = (chapter: Chapter) => {
    if (chapter.subTopics.length === 0) return 0;
    const completed = chapter.subTopics.filter(st => st.isCompleted).length;
    return Math.round((completed / chapter.subTopics.length) * 100);
  };

  // Toggle subtopic completion
  const toggleSubTopic = (planId: string, chapterId: string, subTopicId: string) => {
    const plan = lessonPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedChapters = plan.chapters.map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        subTopics: ch.subTopics.map(st =>
          st.id === subTopicId ? { ...st, isCompleted: !st.isCompleted } : st
        )
      };
    });

    // Auto-determine status based on progress
    const allSubTopics = updatedChapters.flatMap(c => c.subTopics);
    const completedCount = allSubTopics.filter(st => st.isCompleted).length;
    let newStatus: 'planned' | 'in-progress' | 'completed' = 'planned';
    if (completedCount === allSubTopics.length && allSubTopics.length > 0) {
      newStatus = 'completed';
    } else if (completedCount > 0) {
      newStatus = 'in-progress';
    }

    updateLessonPlan(planId, { chapters: updatedChapters, status: newStatus });
  };

  // Chapter form helpers
  const addChapter = () => {
    const newChapter = {
      id: Date.now().toString(),
      name: '',
      subTopics: [{ id: Date.now().toString() + 'st', name: '' }]
    };
    setFormData(prev => ({ ...prev, chapters: [...prev.chapters, newChapter] }));
  };

  const removeChapter = (chapterId: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(ch => ch.id !== chapterId)
    }));
  };

  const updateChapterName = (chapterId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId ? { ...ch, name } : ch
      )
    }));
  };

  const addSubTopic = (chapterId: string) => {
    const newSubTopic = { id: Date.now().toString() + 'st', name: '' };
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId
          ? { ...ch, subTopics: [...ch.subTopics, newSubTopic] }
          : ch
      )
    }));
  };

  const removeSubTopic = (chapterId: string, subTopicId: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId
          ? { ...ch, subTopics: ch.subTopics.filter(st => st.id !== subTopicId) }
          : ch
      )
    }));
  };

  const updateSubTopicName = (chapterId: string, subTopicId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch =>
        ch.id === chapterId
          ? {
              ...ch,
              subTopics: ch.subTopics.map(st =>
                st.id === subTopicId ? { ...st, name } : st
              )
            }
          : ch
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      batchId: '',
      date: '',
      duration: '2 hours',
      materials: '',
      chapters: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find(b => b.id === formData.batchId);

    const chaptersWithIds: Chapter[] = formData.chapters.map(ch => ({
      id: ch.id,
      name: ch.name,
      subTopics: ch.subTopics.map(st => ({
        id: st.id,
        name: st.name,
        isCompleted: false
      }))
    }));

    if (editingPlan) {
      // Preserve existing completion status
      const existingPlan = lessonPlans.find(p => p.id === editingPlan);
      const preservedChapters = chaptersWithIds.map(ch => {
        const existingChapter = existingPlan?.chapters.find(ec => ec.id === ch.id);
        return {
          ...ch,
          subTopics: ch.subTopics.map(st => {
            const existingSubTopic = existingChapter?.subTopics.find(est => est.id === st.id);
            return { ...st, isCompleted: existingSubTopic?.isCompleted ?? false };
          })
        };
      });

      updateLessonPlan(editingPlan, {
        title: formData.title,
        description: formData.description,
        batchId: formData.batchId,
        batchName: batch?.name || '',
        date: formData.date,
        duration: formData.duration,
        chapters: preservedChapters,
        materials: formData.materials.split(',').map(m => m.trim()).filter(Boolean)
      });
    } else {
      addLessonPlan({
        id: Date.now().toString(),
        batchId: formData.batchId,
        batchName: batch?.name || '',
        teacherId: currentUser?.id || '',
        teacherName: currentUser?.name || '',
        title: formData.title,
        description: formData.description,
        date: formData.date,
        duration: formData.duration,
        chapters: chaptersWithIds,
        status: 'planned',
        materials: formData.materials.split(',').map(m => m.trim()).filter(Boolean)
      });
    }
    setIsModalOpen(false);
    setEditingPlan(null);
    resetForm();
  };

  const openEditModal = (plan: LessonPlan) => {
    setEditingPlan(plan.id);
    setFormData({
      title: plan.title,
      description: plan.description,
      batchId: plan.batchId,
      date: plan.date,
      duration: plan.duration,
      materials: plan.materials.join(', '),
      chapters: plan.chapters.map(ch => ({
        id: ch.id,
        name: ch.name,
        subTopics: ch.subTopics.map(st => ({ id: st.id, name: st.name }))
      }))
    });
    setIsModalOpen(true);
  };

  const toggleChapterExpanded = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const total = myLessonPlans.length;
    const completed = myLessonPlans.filter(p => p.status === 'completed').length;
    const inProgress = myLessonPlans.filter(p => p.status === 'in-progress').length;
    const planned = myLessonPlans.filter(p => p.status === 'planned').length;
    return { total, completed, inProgress, planned };
  }, [myLessonPlans]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'in-progress': return 'info' as const;
      default: return 'default' as const;
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct === 100) return 'from-green-500 to-emerald-600';
    if (pct >= 60) return 'from-blue-500 to-cyan-600';
    if (pct >= 30) return 'from-amber-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
          <p className="text-gray-500 mt-1">Create chapter-based lesson plans and track topic completion</p>
        </div>
        {currentUser?.role === 'teacher' && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Create Lesson Plan
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: stats.total, color: 'bg-gray-500', icon: <ClipboardList className="w-5 h-5" /> },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500', icon: <Clock className="w-5 h-5" /> },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-500', icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'Planned', value: stats.planned, color: 'bg-amber-500', icon: <BookOpen className="w-5 h-5" /> },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4" hover={false}>
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
      <Card className="p-4" hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lesson plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'planned', label: 'Planned' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]}
            className="w-full md:w-48"
          />
        </div>
      </Card>

      {/* Lesson Plans List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPlans.map((plan, index) => {
            const progress = getPlanProgress(plan);
            const isExpanded = expandedPlan === plan.id;
            const totalSubTopics = plan.chapters.flatMap(c => c.subTopics).length;
            const completedSubTopics = plan.chapters.flatMap(c => c.subTopics).filter(st => st.isCompleted).length;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="overflow-visible" hover={false}>
                  {/* Plan Header - Always visible */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white flex-shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(plan.status)}>
                        {plan.status === 'in-progress' ? 'In Progress' : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-500" />
                        {plan.batchName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-cyan-500" />
                        {plan.teacherName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        {plan.duration}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Overall Progress
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {completedSubTopics}/{totalSubTopics} topics ({progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
                        />
                      </div>
                    </div>

                    {/* Materials */}
                    {plan.materials.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {plan.materials.map((mat, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {mat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                        {isExpanded ? 'Hide Chapters' : `View ${plan.chapters.length} Chapter${plan.chapters.length !== 1 ? 's' : ''}`}
                      </Button>
                      <div className="flex items-center gap-2">
                        {currentUser?.role === 'teacher' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(plan)}>
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteLessonPlan(plan.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Chapters Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-purple-500" />
                            Chapters & Topics
                          </h4>
                          <div className="space-y-3">
                            {plan.chapters.map((chapter, chIdx) => {
                              const chProgress = getChapterProgress(chapter);
                              const isChapterExpanded = expandedChapters.has(chapter.id) || isExpanded;

                              return (
                                <motion.div
                                  key={chapter.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: chIdx * 0.05 }}
                                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                                >
                                  {/* Chapter Header */}
                                  <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleChapterExpanded(chapter.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {chIdx + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 text-sm">{chapter.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {chapter.subTopics.filter(st => st.isCompleted).length}/{chapter.subTopics.length} completed
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {/* Mini progress bar */}
                                      <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(chProgress)}`}
                                          style={{ width: `${chProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-bold text-gray-600 w-10 text-right">{chProgress}%</span>
                                      {expandedChapters.has(chapter.id) || isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                  </div>

                                  {/* SubTopics */}
                                  {(expandedChapters.has(chapter.id) || isExpanded) && (
                                    <div className="border-t border-gray-100 px-4 pb-4">
                                      {chapter.subTopics.map((subTopic, stIdx) => (
                                        <div
                                          key={subTopic.id}
                                          className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
                                            subTopic.isCompleted ? 'bg-emerald-50' : 'hover:bg-gray-50'
                                          } ${stIdx < chapter.subTopics.length - 1 ? 'border-b border-gray-50' : ''}`}
                                        >
                                          <button
                                            onClick={() => toggleSubTopic(plan.id, chapter.id, subTopic.id)}
                                            className="flex-shrink-0"
                                          >
                                            {subTopic.isCompleted ? (
                                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                              <Circle className="w-5 h-4 text-gray-300 hover:text-emerald-400 transition-colors" />
                                            )}
                                          </button>
                                          <span className={`text-sm flex-1 ${
                                            subTopic.isCompleted
                                              ? 'text-emerald-700 line-through decoration-emerald-400'
                                              : 'text-gray-700'
                                          }`}>
                                            {subTopic.name}
                                          </span>
                                          {subTopic.isCompleted && (
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                              Done
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredPlans.length === 0 && (
        <Card className="p-12" hover={false}>
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Lesson Plans Found</h3>
            <p className="text-gray-500">
              {currentUser?.role === 'teacher'
                ? 'Create your first lesson plan to get started.'
                : 'No lesson plans available yet.'}
            </p>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
        title={editingPlan ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Introduction to Maya Interface"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the lesson objectives and content..."
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Batch"
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              options={[
                { value: '', label: 'Select Batch' },
                ...myBatches.map(b => ({ value: b.id, label: `${b.name} (${b.course})` }))
              ]}
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 2 hours"
              required
            />
            <Input
              label="Materials (comma separated)"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="e.g., Maya Software, Practice Files"
            />
          </div>

          {/* Chapters Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Chapters & Subtopics
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={addChapter}>
                <Plus className="w-4 h-4 mr-1" />
                Add Chapter
              </Button>
            </div>

            {formData.chapters.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No chapters added yet. Click &quot;Add Chapter&quot; to start.</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.chapters.map((chapter, chIdx) => (
                <div key={chapter.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {chIdx + 1}
                    </div>
                    <input
                      type="text"
                      value={chapter.name}
                      onChange={(e) => updateChapterName(chapter.id, e.target.value)}
                      placeholder="Chapter name..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-gray-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeChapter(chapter.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="ml-10 space-y-2">
                    {chapter.subTopics.map((st, stIdx) => (
                      <div key={st.id} className="flex items-center gap-2">
                        <Circle className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <input
                          type="text"
                          value={st.name}
                          onChange={(e) => updateSubTopicName(chapter.id, st.id, e.target.value)}
                          placeholder={`Subtopic ${stIdx + 1}...`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-gray-900 bg-white"
                          required
                        />
                        {chapter.subTopics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubTopic(chapter.id, st.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSubTopic(chapter.id)}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium mt-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add Subtopic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setEditingPlan(null); }}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
