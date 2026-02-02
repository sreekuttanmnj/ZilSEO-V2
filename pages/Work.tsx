import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { ModuleKey, WorkItem } from '../types';
import { MockService } from '../services/mockService';
import {
  Clock, CheckCircle, XCircle, MessageSquare, ExternalLink,
  ChevronDown, AlertCircle, Search, RefreshCw, Trash2,
  Filter, CheckSquare, Square, MoreHorizontal, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const REVISE_REASONS = [
  "Unable to open screenshot",
  "Social media link is not public",
  "Wrong keyword or link used",
  "Use Google Search as requested",
  "Proof does not match requirements"
];

const REJECT_REASONS = [
  "Spam submission",
  "Duplicate proof used",
  "Task not completed",
  "Fake/Edited Screenshot"
];

const ITEMS_PER_PAGE = 100;

export default function Work() {
  const { checkPermission } = useAuth();
  const { selectedWebsite } = useWebsite();

  // Data State
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selection & Filters
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [modalMode, setModalMode] = useState<'revise' | 'reject' | null>(null);
  const [activeTaskIds, setActiveTaskIds] = useState<string[]>([]); // Tasks being acted upon
  const [reasonInput, setReasonInput] = useState("");
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'revise' | 'reject' | null>(null);

  const canEdit = checkPermission(ModuleKey.WORK, 'edit');

  useEffect(() => {
    loadTasks();
  }, [selectedWebsite]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await MockService.getWorkItems();
    let filtered = data;

    if (selectedWebsite) {
      filtered = data.filter(t => t.websiteId === selectedWebsite.id);
    }

    // Sort: Completed (pending review) first, then by date
    filtered.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });

    setTasks(filtered);
    setLoading(false);
    setSelectedIds(new Set());
    setCurrentPage(1); // Reset page on load
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await MockService.syncWorkTasks(selectedWebsite?.id);
      await loadTasks();
    } catch (err: any) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Selection Logic ---
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTasks.map(t => t.id)));
    }
  };

  // --- Actions ---
  const executeStatusUpdate = async (ids: string[], status: WorkItem['status'], reason?: string) => {
    if (!canEdit) return;

    // Optimistic Update: Remove from local state immediately
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status, rejectionReason: reason } : t));
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });

    // Actual API Calls
    for (const id of ids) {
      try {
        const task = tasks.find(t => t.id === id);
        await MockService.updateWorkItemStatus(id, status, reason, task?.mwCampaignId);
      } catch (e: any) {
        console.error(`Status update failed for ${id}:`, e);
      }
    }

    // Refresh from server to ensure sync
    // await loadTasks(); // optimization: rely on optimistic update
    setModalMode(null);
    setActiveTaskIds([]);
    setReasonInput("");
    setBulkConfirmOpen(false);
  };

  const handleDeleteTask = async (ids: string[], skipConfirm = false) => {
    if (!canEdit) return;
    if (!skipConfirm && !window.confirm(`Are you sure you want to delete ${ids.length} task(s)? This cannot be undone.`)) return;

    // Optimistic Update: Remove from local state
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });

    for (const id of ids) {
      try {
        await MockService.deleteWorkItem(id);
      } catch (e: any) {
        console.error(`Failed to delete task ${id}`, e);
        // If it failed, we might want to reload to be safe
        await loadTasks();
      }
    }
  };

  const openActionModal = (type: 'revise' | 'reject', ids: string[]) => {
    setModalMode(type);
    setActiveTaskIds(ids);
    setReasonInput("");
  };

  const handleBulkClick = (type: 'approve' | 'revise' | 'reject' | 'delete') => {
    if (selectedIds.size === 0) return;

    if (type === 'approve' || type === 'delete') {
      setBulkActionType(type);
      setActiveTaskIds(Array.from(selectedIds));
      setBulkConfirmOpen(true);
    } else {
      openActionModal(type, Array.from(selectedIds));
    }
  };

  // Filtering
  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'pending' ? t.status === 'completed' :
        ['done', 'rejected', 'needs_revision'].includes(t.status);

    const matchesSearch = searchQuery === "" ||
      (t.workerId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIds(new Set()); // Clear selection on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  return (
    <>
      <div className="min-h-screen bg-gray-50/50 flex flex-col animate-fade-in pb-20">

        {/* 1. Header & Controls */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Work Verification</h1>
              <p className="text-sm text-gray-500">
                {selectedWebsite ? `Reviewing tasks for ${selectedWebsite.name}` : "Global Task View (All Websites)"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Worker ID */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search Worker ID..."
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-64"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Tasks'}
              </button>
            </div>
          </div>

          {/* Filters & Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {(['pending', 'reviewed', 'all'] as const).map(f => {
                const count = tasks.filter(t => f === 'all' ? true : f === 'pending' ? t.status === 'completed' : ['done', 'rejected', 'needs_revision'].includes(t.status)).length;
                return (
                  <button
                    key={f}
                    onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {f === 'pending' ? 'To Verify' : f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                  </button>
                );
              })}
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 animate-slide-in-up">
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                  {selectedIds.size} Selected
                </span>
                <div className="h-6 w-px bg-gray-300"></div>
                <button onClick={() => handleBulkClick('approve')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
                  <CheckCircle size={16} /> Approve All
                </button>
                <button onClick={() => handleBulkClick('revise')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
                  <MessageSquare size={16} /> Revise All
                </button>
                <button onClick={() => handleBulkClick('reject')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
                  <XCircle size={16} /> Reject All
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <button onClick={() => handleBulkClick('delete')} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
                  <Trash2 size={16} /> Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Task Feed */}
        <div className="w-full p-6 space-y-6">
          {paginatedTasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600">All Caught Up!</h3>
              <p className="text-gray-400 mt-2">No tasks matching your filter.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
                  {selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0 ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                  Select All Visible ({paginatedTasks.length})
                </button>

                <span className="text-xs text-gray-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} of {filteredTasks.length}
                </span>
              </div>

              {paginatedTasks.map(task => (
                <ReviewTaskCard
                  key={task.id}
                  task={task}
                  canEdit={canEdit}
                  isSelected={selectedIds.has(task.id)}
                  onSelect={() => toggleSelection(task.id)}
                  onApprove={() => {
                    setBulkActionType('approve');
                    setActiveTaskIds([task.id]);
                    setBulkConfirmOpen(true);
                  }}
                  onRevise={() => openActionModal('revise', [task.id])}
                  onReject={() => openActionModal('reject', [task.id])}
                  onDelete={() => {
                    setBulkActionType('delete');
                    setActiveTaskIds([task.id]);
                    setBulkConfirmOpen(true);
                  }}
                />
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Global Modals (Revise/Reject) */}
      {modalMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in my-auto">
            <div className={`p-6 border-b ${modalMode === 'reject' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${modalMode === 'reject' ? 'text-red-900' : 'text-yellow-900'}`}>
                {modalMode === 'reject' ? <XCircle /> : <MessageSquare />}
                {modalMode === 'reject' ? 'Reject Submission' : 'Request Revision'}
              </h3>
              <p className="text-sm opacity-80 mt-1">
                Action applies to <span className="font-bold">{activeTaskIds.length} tasks</span>.
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Reason</label>
                <div className="flex flex-wrap gap-2">
                  {(modalMode === 'reject' ? REJECT_REASONS : REVISE_REASONS).map(reason => (
                    <button
                      key={reason}
                      onClick={() => setReasonInput(reason)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${reasonInput === reason
                        ? (modalMode === 'reject' ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500')
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Custom Reason / Comment</label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                  placeholder="Type a specific reason..."
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button onClick={() => setModalMode(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-white transition-all">
                Cancel
              </button>
              <button
                disabled={!reasonInput}
                onClick={() => executeStatusUpdate(activeTaskIds, modalMode === 'reject' ? 'rejected' : 'needs_revision', reasonInput)}
                className={`flex-[2] px-4 py-2 text-white rounded-xl text-sm font-bold shadow-sm shadow-black/10 transition-all active:scale-95 disabled:opacity-50 ${modalMode === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                Confirm {modalMode === 'reject' ? 'Rejection' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div >
      )}

      {/* 4. Bulk Confirmation Modal (for Approve/Delete) */}
      {bulkConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className={`p-6 text-center ${bulkActionType === 'delete' ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${bulkActionType === 'delete' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {bulkActionType === 'delete' ? <Trash2 size={32} /> : <CheckCircle size={32} />}
              </div>
              <h3 className={`text-xl font-bold ${bulkActionType === 'delete' ? 'text-red-900' : 'text-green-900'}`}>
                {bulkActionType === 'delete' ? 'Delete Tasks?' : 'Approve Tasks?'}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to {bulkActionType === 'delete' ? 'delete' : 'approve'} <b>{activeTaskIds.length}</b> {activeTaskIds.length === 1 ? 'task' : 'selected tasks'}?
                {bulkActionType === 'delete' && " This action cannot be undone."}
              </p>
            </div>
            <div className="p-6 flex gap-3 bg-white">
              <button onClick={() => { setBulkConfirmOpen(false); setActiveTaskIds([]); }} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                No, Cancel
              </button>
              <button
                onClick={() => {
                  if (bulkActionType === 'approve') executeStatusUpdate(activeTaskIds, 'done');
                  else if (bulkActionType === 'delete') handleDeleteTask(activeTaskIds, true);
                  setBulkConfirmOpen(false);
                }}
                className={`flex-1 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 ${bulkActionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Component: Review Task Card ---
interface ReviewTaskCardProps {
  task: WorkItem;
  canEdit: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onRevise: () => void;
  onReject: () => void;
  onDelete: () => void | Promise<void>;
}

const ReviewTaskCard: React.FC<ReviewTaskCardProps> = ({ task, canEdit, isSelected, onSelect, onApprove, onRevise, onReject, onDelete }) => {
  const isPending = task.status === 'completed';

  return (
    <div className={`bg-white rounded-xl border transition-all shadow-sm group hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>

      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/30 rounded-t-xl">
        <div className="flex items-center gap-4">
          <button onClick={onSelect} className="text-gray-400 hover:text-primary transition-colors">
            {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-gray-500">#{task.id.slice(-6)}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                task.status === 'needs_revision' ? 'bg-yellow-100 text-yellow-700' :
                  task.status === 'done' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><CkUser size={12} /> Worker: <span className="font-medium text-gray-700">{task.workerId || 'Unknown'}</span></span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Submitted: {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Changed from Target Page to Microworkers Task based on user request */}
        <div className="flex items-center gap-3">
          {task.mwCampaignId && (
            <a
              href={`https://ttv.microworkers.com/campaign/ratetask/view2/${task.mwCampaignId}?rate_view2_filter[taskRating]=NOTRATED&rate_view2_filter[workerId]=${task.workerId || ''}&rate_view2_filter[recordsPerPage]=10`}
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
            >
              <ExternalLink size={12} /> Task
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{task.title}</h3>
            <p className="text-gray-600 text-sm">{task.description}</p>
          </div>

          {/* Proof Display Section */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
              <CkUser size={14} className="text-gray-400" /> Worker Evidence (Microworkers)
            </h4>

            {/* Structured Text Proofs */}
            {task.proofs && task.proofs.length > 0 ? (
              <div className="space-y-4">
                {task.proofs.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.question}</div>
                    <div className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-100 shadow-sm leading-relaxed break-words">
                      {p.answer.startsWith('http') ? (
                        <a href={p.answer} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all flex items-center gap-1">
                          <ExternalLink size={12} className="flex-shrink-0" /> {p.answer}
                        </a>
                      ) : (
                        p.answer
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !task.proofLink && (
              <div className="text-sm text-gray-400 italic py-2">No text answers provided.</div>
            )}

            {/* File Proofs (Screenshots) */}
            {(task.fileProofs && task.fileProofs.length > 0) || task.proofLink ? (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Attachments / Screenshots</div>

                {/* Handle individual proofLink fallback */}
                {task.proofLink && (!task.fileProofs || !task.fileProofs.find(f => f.url === task.proofLink)) && (
                  <div className="space-y-2">
                    <a href={task.proofLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                      <ExternalLink size={12} /> View Proof Screenshot
                    </a>
                    {isImageUrl(task.proofLink) && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-h-96 w-full flex justify-center group/img">
                        <img src={task.proofLink} alt="Proof" className="max-w-full h-auto object-contain max-h-96" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Click to Open Full Size</span>
                        </div>
                        <a href={task.proofLink} target="_blank" rel="noreferrer" className="absolute inset-0 opacity-0 cursor-pointer">View</a>
                      </div>
                    )}
                  </div>
                )}

                {/* Handle fileProofs array */}
                {task.fileProofs?.map((f, idx) => (
                  <div key={idx} className="space-y-2">
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                      <ExternalLink size={12} /> {f.name || `Screenshot ${idx + 1}`}
                    </a>
                    {isImageUrl(f.url) && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-h-96 w-full flex justify-center group/img">
                        <img src={f.url} alt={f.name} className="max-w-full h-auto object-contain max-h-96" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Click to Open Full Size</span>
                        </div>
                        <a href={f.url} target="_blank" rel="noreferrer" className="absolute inset-0 opacity-0 cursor-pointer">View</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions Column */}
        <div className="md:col-span-1 flex flex-col justify-center border-l border-gray-100 pl-6 space-y-3">
          {isPending ? (
            <>
              <button onClick={onApprove} className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                <CheckCircle size={18} /> Approve
              </button>
              <button onClick={onRevise} className="w-full py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                <MessageSquare size={18} /> Revise
              </button>
              <button onClick={onReject} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                <XCircle size={18} /> Reject
              </button>
            </>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Status</div>
              <div className={`text-lg font-bold capitalize ${task.status === 'done' ? 'text-blue-600' :
                task.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                }`}>{task.status.replace('_', ' ')}</div>
              {task.rejectionReason && (
                <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                  "{task.rejectionReason}"
                </div>
              )}
              {canEdit && (
                <button onClick={onRevise} className="mt-3 text-xs text-gray-400 underline hover:text-gray-600">
                  Change Status
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon helper
function CkUser({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}

function isImageUrl(url: string) {
  if (!url) return false;
  const imageExtensions = /\.(jpeg|jpg|gif|png|webp|avif|bmp)$/i;
  const imageHosts = /imgur\.com|ibb\.co|snipboard\.io|gyazo\.com|prnt\.sc|prntscr\.com/i;
  return imageExtensions.test(url) || imageHosts.test(url);
}
