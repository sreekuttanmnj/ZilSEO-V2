import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { ModuleKey, Website, Page, Post, FaqItem, SocialLink } from '../types';
import { MockService } from '../services/mockService';
import {
  Plus, ExternalLink, Globe, MoreVertical, ArrowLeft, ArrowRight,
  Check, X, FileText, Share2, Layout, Edit2, Trash2, FileMinus,
  Save, AlignLeft, List, Tag, Download, ChevronDown,
  Wand2, Loader2, Settings, AlertTriangle, Key, Layers,
  Search, HelpCircle, Image as ImageIcon, Upload, Shield, Server, RefreshCw,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Link as LinkIcon,
  Play, Pause, ToggleLeft, ToggleRight, LayoutGrid, ArrowUpDown
} from 'lucide-react';

interface EditorState {
  type: 'page' | 'post';
  item: Page | Post;
  isNew?: boolean;
}

// --- Helper Components for Editor (Defined outside to avoid re-creation) ---

const KeywordsEditor = ({ keywords = [], onChange }: { keywords?: string[], onChange: (k: string[]) => void }) => {
  const [input, setInput] = useState('');

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!keywords.includes(input.trim())) {
        onChange([...keywords, input.trim()]);
      }
      setInput('');
    }
  };

  const removeKeyword = (kwToRemove: string) => {
    onChange(keywords.filter(k => k !== kwToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {keywords.map(kw => (
          <span key={kw} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
            {kw}
            <button onClick={() => removeKeyword(kw)} className="hover:text-red-500"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 border rounded-lg p-2 focus:ring-2 focus:ring-blue-100 border-gray-300 text-sm"
          placeholder="Type keyword and press Enter..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addKeyword}
        />
      </div>
    </div>
  );
};

const FaqEditor = ({ faqs = [], onChange }: { faqs?: FaqItem[], onChange: (faqs: FaqItem[]) => void }) => {
  const addFaq = () => {
    onChange([...faqs, { id: Math.random().toString(), question: '', answer: '' }]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange(newFaqs);
  };

  const removeFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm"><List size={14} /> FAQs ({faqs.length})</h4>
        <button onClick={addFaq} className="text-xs text-white bg-accent px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1 shadow-sm transition">
          <Plus size={12} /> Add
        </button>
      </div>

      {faqs.length === 0 && (
        <div className="text-gray-400 text-xs italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          No FAQs.
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="bg-white p-3 rounded-lg border border-gray-200 relative group shadow-sm hover:shadow-md transition">
            <button
              onClick={() => removeFaq(idx)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Delete FAQ"
            >
              <X size={14} />
            </button>
            <div className="mb-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Question</label>
              <input
                value={faq.question}
                onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                className="w-full border-b border-gray-200 focus:border-accent outline-none py-1 text-sm font-medium text-gray-800 bg-transparent"
                placeholder="Question?"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Answer</label>
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-accent outline-none h-16 resize-none bg-gray-50"
                placeholder="Answer..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContentEditor = ({ content = [], onChange }: { content?: string[], onChange: (c: string[]) => void }) => {
  const addParagraph = () => {
    onChange([...content, '']);
  };

  const updateParagraph = (index: number, value: string) => {
    const newContent = [...content];
    newContent[index] = value;
    onChange(newContent);
  };

  const removeParagraph = (index: number) => {
    onChange(content.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm"><AlignLeft size={14} /> Content</h4>
        <button onClick={addParagraph} className="text-xs text-accent hover:underline flex items-center gap-1 font-medium">
          <Plus size={12} /> Add Para
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {content.length === 0 && <div className="text-gray-400 text-sm italic border border-dashed border-gray-200 rounded p-6 text-center">Start writing your story...</div>}
        {content.map((paragraph, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-5 top-2 text-gray-300 font-mono text-[10px]">{idx + 1}</div>
            <button
              onClick={() => removeParagraph(idx)}
              className="absolute -right-2 top-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
            >
              <Trash2 size={12} />
            </button>
            <textarea
              value={paragraph}
              onChange={(e) => updateParagraph(idx, e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent outline-none min-h-[120px] leading-relaxed resize-y"
              placeholder="Write paragraph content..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: {
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
  totalItems: number,
  itemsPerPage: number
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = currentPage;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;

          if (pageNum <= 0 || pageNum > totalPages) return null;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 border rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-accent border-accent text-white shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default function Websites() {
  const { checkPermission, user } = useAuth();
  const { selectedWebsite, setSelectedWebsite, refreshWebsites } = useWebsite();

  const [activeTab, setActiveTab] = useState<'pages' | 'posts' | 'social'>('pages');

  // Data for selected website
  const [sitePages, setSitePages] = useState<Page[]>([]);
  const [sitePosts, setSitePosts] = useState<Post[]>([]);

  // Editing State
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Social Editing State
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [selectedSocialIds, setSelectedSocialIds] = useState<Set<string>>(new Set());
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [isSocialModified, setIsSocialModified] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [isUpdatingSocial, setIsUpdatingSocial] = useState(false);

  // Modal State for Website Settings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  // Page Category State
  const [activePageCategory, setActivePageCategory] = useState<'all' | 'Main Page' | 'Feature Page' | 'Landing page'>('all');

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    links: string[],
    websiteId: string,
    type: 'pages' | 'posts',
    isGsc?: boolean
  } | null>(null);

  // Validation Modal State
  const [validationError, setValidationError] = useState<{ title: string, message: string } | null>(null);
  const [gscSyncError, setGscSyncError] = useState<{
    title: string,
    message: string,
    onFallback: () => void
  } | null>(null);

  // Campaign Error State
  const [campaignError, setCampaignError] = useState<{
    status: string | number;
    title: string;
    details: string;
  } | null>(null);

  // GSC Site Import State
  const [gscSites, setGscSites] = useState<any[]>([]);
  const [isGscImportOpen, setIsGscImportOpen] = useState(false);
  const [isFetchingSites, setIsFetchingSites] = useState(false);

  // Sync All State
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>({});

  // Bulk Campaign State
  const [bulkWorkEnabled, setBulkWorkEnabled] = useState(false);
  const [bulkPositions, setBulkPositions] = useState(30);
  const [workTogglePositions, setWorkTogglePositions] = useState(30); // For existing items toggle

  // Pagination and Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  const [statusSortOrder, setStatusSortOrder] = useState<('ready' | 'draft' | 'published')[]>(['ready', 'draft', 'published']);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'draft' | 'published'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isWithinRange = (dateStr: string | undefined) => {
    if (!dateStr) return dateFilter === 'all';
    if (dateFilter === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (dateFilter === 'today') return d.toDateString() === now.toDateString();
    if (dateFilter === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= lastWeek;
    }
    if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (dateFilter === 'custom' && customRange.from && customRange.to) {
      return d >= new Date(customRange.from) && d <= new Date(customRange.to);
    }
    return true;
  };

  // Reset pagination and selections when tab or category changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPageIds(new Set());
    setSelectedPostIds(new Set());
    setSelectedSocialIds(new Set());
  }, [activeTab, activePageCategory, searchQuery, statusFilter, dateFilter]);

  // Poll statuses for social links
  useEffect(() => {
    const checkStatuses = async () => {
      if (document.visibilityState !== 'visible') return;

      const itemsWithCampaign = socialLinks.filter(l => l.mwCampaignId && l.mwCampaignId !== 'undefined' && l.isWorkEnabled);
      if (itemsWithCampaign.length === 0) return;

      for (const item of itemsWithCampaign) {
        const status = await MockService.getMicroworkersCampaignStatus(item.mwCampaignId!);
        if (campaignStatuses[item.mwCampaignId!] !== status) {
          setCampaignStatuses(prev => ({ ...prev, [item.mwCampaignId!]: status }));
        }
      }
    };

    if (socialLinks.some(l => l.isWorkEnabled)) {
      checkStatuses();
      const interval = setInterval(checkStatuses, 60000); // 60s
      return () => clearInterval(interval);
    }
  }, [socialLinks]);

  // Auto-save social links
  useEffect(() => {
    if (isSocialModified && selectedWebsite) {
      const timer = setTimeout(() => {
        handleSaveSocials();
      }, 1500); // 1.5s delay to allow for typing
      return () => clearTimeout(timer);
    }
  }, [socialLinks, isSocialModified, selectedWebsite]);

  const canEdit = checkPermission(ModuleKey.WEBSITES, 'edit');
  const canDelete = checkPermission(ModuleKey.WEBSITES, 'delete');

  const canViewPages = checkPermission(ModuleKey.PAGES, 'view');
  const canEditPages = checkPermission(ModuleKey.PAGES, 'edit');

  const canViewPosts = checkPermission(ModuleKey.POSTS, 'view');
  const canEditPosts = checkPermission(ModuleKey.POSTS, 'edit');

  const canViewSocial = checkPermission(ModuleKey.SOCIAL, 'view');
  const canEditSocial = checkPermission(ModuleKey.SOCIAL, 'edit');

  useEffect(() => {
    if (selectedWebsite) {
      loadSiteDetails(selectedWebsite.id);
      setSocialLinks([...(selectedWebsite.socialLinks || [])]);
      setSelectedSocialIds(new Set());
      setIsSocialModified(false);
      setEditor(null); // Close editor on site change
      setIsBulkMode(false);
      setBulkInput('');

      // Permission Adjustment: If they can't view the default 'pages', switch to first allowed
      if (!canViewPages) {
        if (canViewPosts) setActiveTab('posts');
        else if (canViewSocial) setActiveTab('social');
      }
    } else {
      setSitePages([]);
      setSitePosts([]);
    }
  }, [selectedWebsite, canViewPages, canViewPosts, canViewSocial]);

  const loadSiteDetails = async (siteId: string) => {
    setIsFetching(true);
    try {
      const pages = await MockService.getPages(siteId);
      const posts = await MockService.getPosts(siteId);
      setSitePages(pages);
      setSitePosts(posts);
    } finally {
      setIsFetching(false);
    }
  };

  const handleBulkStatusUpdate = async (type: 'pages' | 'posts' | 'social', newStatus: 'published' | 'draft' | 'ready') => {
    const ids = Array.from(type === 'pages' ? selectedPageIds : type === 'posts' ? selectedPostIds : selectedSocialIds) as string[];
    if (ids.length === 0) return;

    try {
      await MockService.bulkUpdateStatus(ids, newStatus, type, selectedWebsite?.id);
      if (type === 'pages') {
        setSitePages(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: newStatus } : p));
        setSelectedPageIds(new Set());
      } else if (type === 'posts') {
        setSitePosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: newStatus } : p));
        setSelectedPostIds(new Set());
      } else {
        setSocialLinks(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: newStatus } : s));
        setSelectedSocialIds(new Set());
        setIsSocialModified(true);
      }
    } catch (error) {
      console.error("Bulk status update failed:", error);
      alert("Failed to update status.");
    }
  };

  const handleBulkCategoryUpdate = async (newCategory: string) => {
    const ids = Array.from(selectedPageIds) as string[];
    if (ids.length === 0) return;

    try {
      // MockService doesn't have a bulkUpdateCategory, so we loop for now or add it.
      // For efficiency in this turn, we'll loop updates (Optimistic UI first).
      // Ideally, add bulkUpdateCategory to MockService, but loop is fine for < 100 items.
      const updates = ids.map(id => MockService.updatePageDetails(id, { category: newCategory as any }));
      await Promise.all(updates);

      setSitePages(prev => prev.map(p => ids.includes(p.id) ? { ...p, category: newCategory as any } : p));
      setSelectedPageIds(new Set());
    } catch (error) {
      console.error("Bulk category update failed:", error);
      alert("Failed to update category.");
    }
  };

  const handleBulkDelete = async (type: 'pages' | 'posts' | 'social') => {
    const ids = Array.from(type === 'pages' ? selectedPageIds : type === 'posts' ? selectedPostIds : selectedSocialIds) as string[];
    if (ids.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected ${type}?`)) return;

    try {
      await MockService.bulkDelete(ids, type, selectedWebsite?.id);
      if (type === 'pages') {
        setSitePages(prev => prev.filter(p => !ids.includes(p.id)));
        setSelectedPageIds(new Set());
      } else if (type === 'posts') {
        setSitePosts(prev => prev.filter(p => !ids.includes(p.id)));
        setSelectedPostIds(new Set());
      } else {
        setSocialLinks(prev => prev.filter(s => !ids.includes(s.id)));
        setSelectedSocialIds(new Set());
        setIsSocialModified(true);
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete items.");
    }
  };

  const handleBulkAutoFill = async (type: 'pages' | 'posts') => {
    const ids = Array.from(type === 'pages' ? selectedPageIds : selectedPostIds) as string[];
    if (ids.length === 0) return;

    if (!window.confirm(`Auto-fill data for ${ids.length} selected items? This will take some time and overwrite existing content.`)) return;

    setIsFetching(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process sequentially to be gentle on the scraper/server
      for (const id of ids) {
        const item = type === 'pages'
          ? sitePages.find(p => p.id === id)
          : sitePosts.find(p => p.id === id);

        if (!item || !item.url) continue;

        try {
          const scrapedData = await MockService.scrapePageData(item.url);
          const updates: any = {
            title: scrapedData.title || item.title,
            metaTitle: scrapedData.metaTitle || item.metaTitle,
            metaDescription: scrapedData.metaDescription || item.metaDescription,
            content: (scrapedData.content && scrapedData.content.length > 0) ? scrapedData.content : (item as any).content,
            faqs: (scrapedData.faqs && scrapedData.faqs.length > 0) ? scrapedData.faqs : (item as any).faqs,
          };

          // common updates
          updates.lastEdited = new Date().toISOString().split('T')[0];

          if (type === 'pages') {
            if (scrapedData.keywords && scrapedData.keywords.length > 0) {
              updates.keyword = scrapedData.keywords[0];
            }
            await MockService.updatePageDetails(id, updates);
            // Optimistic update local state
            setSitePages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
          } else {
            if (scrapedData.keywords && scrapedData.keywords.length > 0) {
              const currentKeywords = (item as Post).keywords || [];
              updates.keywords = [...new Set([...currentKeywords, ...scrapedData.keywords])];

              // Also set search query if empty
              if (!(item as Post).searchQuery) {
                updates.searchQuery = scrapedData.keywords[0] || scrapedData.title || item.title;
              }
            }
            await MockService.updatePostDetails(id, updates);
            setSitePosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
          }
          successCount++;
        } catch (e) {
          console.error(`Failed to scrape ${item.url}`, e);
          failCount++;
        }
      }

      alert(`Auto-fill complete.\nSuccess: ${successCount}\nFailed: ${failCount}`);
      // Clear selection after done
      if (type === 'pages') setSelectedPageIds(new Set());
      else setSelectedPostIds(new Set());

    } catch (error) {
      console.error("Bulk auto-fill failed:", error);
      alert("Bulk auto-fill process failed unexpectedly.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleRemoveDuplicates = async (type: 'pages' | 'posts') => {
    if (!window.confirm(`Check and remove duplicate ${type}? This will keep the first occurrence based on URL and delete others.`)) return;

    const items = type === 'pages' ? sitePages : sitePosts;
    const seenUrls = new Set<string>();
    const duplicates: string[] = [];

    // Identify duplicates
    items.forEach(item => {
      const url = (item.url || '').trim().toLowerCase().replace(/\/$/, ''); // Normalize
      if (url && seenUrls.has(url)) {
        duplicates.push(item.id);
      } else {
        if (url) seenUrls.add(url);
      }
    });

    if (duplicates.length === 0) {
      alert("No duplicates found.");
      return;
    }

    if (!window.confirm(`Found ${duplicates.length} duplicates. Delete them?`)) return;

    // Delete duplicates
    try {
      if (type === 'pages') {
        for (const id of duplicates) await MockService.deletePage(id);
        setSitePages(prev => prev.filter(p => !duplicates.includes(p.id)));
      } else {
        for (const id of duplicates) await MockService.deletePost(id);
        setSitePosts(prev => prev.filter(p => !duplicates.includes(p.id)));
      }
      alert(`Removed ${duplicates.length} duplicates.`);
    } catch (e) {
      console.error("Failed to delete duplicates", e);
      alert("Failed to delete duplicates.");
    }
  };

  const handleBulkMove = async (currentType: 'pages' | 'posts') => {
    const selectedIds = currentType === 'pages' ? selectedPageIds : selectedPostIds;
    if (selectedIds.size === 0) return;

    const targetTypeLabel = currentType === 'pages' ? 'Posts' : 'Pages';
    if (!confirm(`Move ${selectedIds.size} items to ${targetTypeLabel}?`)) return;

    let successCount = 0;

    if (currentType === 'pages') {
      const pagesToMove = sitePages.filter(p => selectedIds.has(p.id));
      for (const page of pagesToMove) {
        try {
          const newPost: Post = {
            id: Math.random().toString(36).substr(2, 9),
            websiteId: page.websiteId,
            title: page.title,
            url: page.url,
            status: page.status,
            publishDate: page.status === 'published' ? (page.uploadedDate || new Date().toISOString().split('T')[0]) : '',
            uploadedDate: page.uploadedDate,
            keywords: page.keyword ? [page.keyword] : [],
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            content: page.content,
            faqs: page.faqs,
            pagePosition: page.pagePosition,
            resultText: page.resultText,
            isWorkEnabled: page.isWorkEnabled,
            mwCampaignId: page.mwCampaignId,
            mwTemplateId: page.mwTemplateId,
            searchQuery: page.keyword
          };
          await MockService.addPost(newPost);
          await MockService.deletePage(page.id);
          successCount++;
        } catch (e) { console.error(e); }
      }
      setSelectedPageIds(new Set());
    } else {
      const postsToMove = sitePosts.filter(p => selectedIds.has(p.id));
      for (const post of postsToMove) {
        try {
          const newPage: Page = {
            id: Math.random().toString(36).substr(2, 9),
            websiteId: post.websiteId,
            title: post.title,
            url: post.url || '',
            status: post.status,
            uploadedDate: post.uploadedDate,
            keyword: post.searchQuery || (post.keywords && post.keywords.length > 0 ? post.keywords[0] : ''),
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            content: post.content,
            faqs: post.faqs,
            pagePosition: post.pagePosition,
            resultText: post.resultText,
            isWorkEnabled: post.isWorkEnabled,
            mwCampaignId: post.mwCampaignId,
            mwTemplateId: post.mwTemplateId,
            links: [],
            category: 'Landing page'
          };
          await MockService.addPage(newPage);
          await MockService.deletePost(post.id);
          successCount++;
        } catch (e) { console.error(e); }
      }
      setSelectedPostIds(new Set());
    }

    await refreshWebsites();
    alert(`Moved ${successCount} items.`);
  };

  const handleBulkAutoCategorize = async () => {
    // Combine all selected items from both pages and posts
    const selectedPagesArray = Array.from(selectedPageIds);
    const selectedPostsArray = Array.from(selectedPostIds);

    if (selectedPagesArray.length === 0 && selectedPostsArray.length === 0) {
      alert('No items selected. Please select items to auto-categorize.');
      return;
    }

    const totalSelected = selectedPagesArray.length + selectedPostsArray.length;
    if (!confirm(`Auto-categorize ${totalSelected} selected items? Items will be moved to Pages or Posts based on their URL patterns.`)) return;

    setIsFetching(true);
    let movedToPosts = 0;
    let movedToPages = 0;
    let alreadyCorrect = 0;

    try {
      // Check selected pages
      for (const pageId of selectedPagesArray) {
        const page = sitePages.find(p => p.id === pageId);
        if (!page || !page.url) continue;

        const detectedType = MockService.detectContentTypeFromUrl(page.url);

        if (detectedType === 'post') {
          // Move to posts
          try {
            const newPost: Post = {
              id: Math.random().toString(36).substr(2, 9),
              websiteId: page.websiteId,
              title: page.title,
              url: page.url,
              status: page.status,
              publishDate: page.status === 'published' ? (page.uploadedDate || new Date().toISOString().split('T')[0]) : '',
              uploadedDate: page.uploadedDate,
              keywords: page.keyword ? [page.keyword] : [],
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
              content: page.content,
              faqs: page.faqs,
              pagePosition: page.pagePosition,
              resultText: page.resultText,
              isWorkEnabled: page.isWorkEnabled,
              mwCampaignId: page.mwCampaignId,
              mwTemplateId: page.mwTemplateId,
              searchQuery: page.keyword
            };
            await MockService.addPost(newPost);
            await MockService.deletePage(page.id);
            movedToPosts++;
          } catch (e) { console.error('Failed to move page to posts:', e); }
        } else {
          alreadyCorrect++;
        }
      }

      // Check selected posts
      for (const postId of selectedPostsArray) {
        const post = sitePosts.find(p => p.id === postId);
        if (!post || !post.url) continue;

        const detectedType = MockService.detectContentTypeFromUrl(post.url);

        if (detectedType === 'page') {
          // Move to pages
          try {
            const newPage: Page = {
              id: Math.random().toString(36).substr(2, 9),
              websiteId: post.websiteId,
              title: post.title,
              url: post.url,
              status: post.status,
              uploadedDate: post.uploadedDate,
              keyword: post.searchQuery || (post.keywords && post.keywords.length > 0 ? post.keywords[0] : ''),
              metaTitle: post.metaTitle,
              metaDescription: post.metaDescription,
              content: post.content,
              faqs: post.faqs,
              pagePosition: post.pagePosition,
              resultText: post.resultText,
              isWorkEnabled: post.isWorkEnabled,
              mwCampaignId: post.mwCampaignId,
              mwTemplateId: post.mwTemplateId,
              links: [],
              category: 'Landing page'
            };
            await MockService.addPage(newPage);
            await MockService.deletePost(post.id);
            movedToPages++;
          } catch (e) { console.error('Failed to move post to pages:', e); }
        } else {
          alreadyCorrect++;
        }
      }

      // Refresh  data
      await loadSiteDetails(selectedWebsite?.id || '');
      setSelectedPageIds(new Set());
      setSelectedPostIds(new Set());

      const summary = [
        `Auto-categorization complete!`,
        ``,
        `✓ ${movedToPosts} moved to Posts`,
        `✓ ${movedToPages} moved to Pages`,
        `✓ ${alreadyCorrect} already in correct section`
      ].join('\n');

      alert(summary);
    } catch (error) {
      console.error('Auto-categorize failed:', error);
      alert('Auto-categorization failed. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };


  const togglePageSelection = (id: string) => {
    setSelectedPageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePostSelection = (id: string) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const BulkActionsToolbar = ({ type, selectedCount, onStatusUpdate, onDelete, onCategoryUpdate, onAutoFill, onMove, onAutoCategorize }: {
    type: 'pages' | 'posts' | 'social',
    selectedCount: number,
    onStatusUpdate: (status: 'published' | 'draft' | 'ready') => void,
    onDelete: () => void,
    onCategoryUpdate?: (category: string) => void,
    onAutoFill?: () => void,
    onMove?: () => void,
    onAutoCategorize?: () => void
  }) => {
    if (selectedCount === 0) return null;

    return (
      <div className="flex items-center gap-4 bg-accent/10 border border-accent/20 px-4 py-2 rounded-lg mb-4 animate-in fade-in slide-in-from-top-2 duration-200 overflow-x-auto">
        <span className="text-sm font-medium text-accent whitespace-nowrap">{selectedCount} {type} selected</span>
        <div className="h-4 w-px bg-accent/20 shrink-0"></div>
        <div className="flex gap-2">
          {onAutoCategorize && (
            <>
              <button
                onClick={onAutoCategorize}
                className="text-xs bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap"
                title="Auto-detect and move items to correct section (Pages/Posts)"
              >
                <LayoutGrid size={14} /> Auto-Categorize
              </button>
              <div className="h-4 w-px bg-accent/20 mx-1 shrink-0"></div>
            </>
          )}

          {onAutoFill && (
            <>
              <button
                onClick={onAutoFill}
                className="text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap"
                title="Scrape and fill data for selected items"
              >
                <Wand2 size={14} /> Auto-fill
              </button>
              <div className="h-4 w-px bg-accent/20 mx-1 shrink-0"></div>
            </>
          )}

          {onMove && (
            <>
              <button
                onClick={onMove}
                className="text-xs bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap"
                title={type === 'pages' ? "Move selected to Posts" : "Move selected to Pages"}
              >
                {type === 'pages' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {type === 'pages' ? 'Move to Posts' : 'Move to Pages'}
              </button>
              <div className="h-4 w-px bg-accent/20 mx-1 shrink-0"></div>
            </>
          )}

          <button onClick={() => onStatusUpdate('ready')} className="text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1">
            <Check size={14} /> Ready
          </button>
          <button onClick={() => onStatusUpdate('draft')} className="text-xs bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-50 px-2 py-1 rounded transition flex items-center gap-1">
            <FileText size={14} /> Draft
          </button>
          <button onClick={() => onStatusUpdate('published')} className="text-xs bg-white border border-green-200 text-green-700 hover:bg-green-50 px-2 py-1 rounded transition flex items-center gap-1">
            <Globe size={14} /> Published
          </button>
          {type === 'pages' && onCategoryUpdate && (
            <>
              <div className="h-4 w-px bg-accent/20 mx-1 shrink-0"></div>
              <button onClick={() => onCategoryUpdate('Main Page')} className="text-xs bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap">
                Main
              </button>
              <button onClick={() => onCategoryUpdate('Feature Page')} className="text-xs bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap">
                Feature
              </button>
              <button onClick={() => onCategoryUpdate('Landing page')} className="text-xs bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 px-2 py-1 rounded transition flex items-center gap-1 whitespace-nowrap">
                Landing
              </button>
            </>
          )}
          <div className="h-4 w-px bg-accent/20 mx-1 shrink-0"></div>
          <button onClick={onDelete} className="text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 px-2 py-1 rounded transition flex items-center gap-1">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert("Permission denied: You cannot edit websites.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update Existing
        if (selectedWebsite) {
          const updatedSite = { ...selectedWebsite, ...formData };
          await MockService.updateWebsite(updatedSite);
        }
      } else {
        // Create New
        const newSite: Website = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: user?.id,
          ...formData,
          status: 'active',
          socialLinks: []
        };
        await MockService.addWebsite(newSite, user?.id);
      }

      await refreshWebsites();
      setFormData({ name: '', url: '', category: '', notes: '' });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save failed depth-check:", err);
      // Detailed error for Supabase issues
      const msg = err.message || JSON.stringify(err);
      alert(`Save Failed: ${msg} \n\nCheck if you ran the SQL schema and disabled RLS.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditWebsite = () => {
    if (!selectedWebsite) return;
    setFormData({
      name: selectedWebsite.name,
      url: selectedWebsite.url,
      category: selectedWebsite.category,
      notes: selectedWebsite.notes
    });
    setEditingId(selectedWebsite.id);
    setIsModalOpen(true);
  };

  const handleDeleteWebsite = async () => {
    if (!selectedWebsite) return;
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Website',
      message: `Are you sure you want to delete "${selectedWebsite.name}" ? This action cannot be undone and will remove all associated pages, posts, and data.`,
      onConfirm: async () => {
        await MockService.deleteWebsite(selectedWebsite.id);
        await refreshWebsites();
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!selectedWebsite || !canDelete) return;
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Page',
      message: `Are you sure you want to delete the page "${title}" ? `,
      onConfirm: async () => {
        await MockService.deletePage(id);
        setSitePages(prev => prev.filter(p => p.id !== id));
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!selectedWebsite || !canDelete) return;
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Post',
      message: `Are you sure you want to delete the post "${title}" ? `,
      onConfirm: async () => {
        await MockService.deletePost(id);
        setSitePosts(prev => prev.filter(p => p.id !== id));
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleMovePageToPost = async (page: Page) => {
    if (!selectedWebsite || !checkPermission(ModuleKey.POSTS, 'create') || !checkPermission(ModuleKey.PAGES, 'delete')) {
      alert("Permission denied. You need permissions to create posts and delete pages.");
      return;
    }

    if (!window.confirm(`Are you sure you want to move "${page.title}" to Posts ? `)) return;

    try {
      const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        websiteId: page.websiteId,
        title: page.title,
        url: page.url,
        status: page.status,
        publishDate: page.status === 'published' ? (page.uploadedDate || new Date().toISOString().split('T')[0]) : '',
        uploadedDate: page.uploadedDate,
        keywords: page.keyword ? [page.keyword] : [],
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        content: page.content,
        faqs: page.faqs,
        pagePosition: page.pagePosition,
        resultText: page.resultText,
        isWorkEnabled: page.isWorkEnabled,
        mwCampaignId: page.mwCampaignId,
        mwTemplateId: page.mwTemplateId,
        searchQuery: page.keyword
      };

      await MockService.addPost(newPost);
      await MockService.deletePage(page.id);

      // Update UI immediately (Optimistic Update)
      setSitePages(prev => prev.filter(p => p.id !== page.id));
      setSitePosts(prev => [newPost, ...prev]);

      // Sync with backend to ensure consistency
      await loadSiteDetails(selectedWebsite.id);

    } catch (error: any) {
      console.error("Failed to move page:", error);
      alert(`Failed to move page to posts: ${error.message} `);
    }
  };

  const handleMovePostToPage = async (post: Post) => {
    if (!selectedWebsite || !checkPermission(ModuleKey.PAGES, 'create') || !checkPermission(ModuleKey.POSTS, 'delete')) {
      alert("Permission denied. You need permissions to create pages and delete posts.");
      return;
    }

    if (!window.confirm(`Are you sure you want to move "${post.title}" to Pages ? `)) return;

    try {
      const newPage: Page = {
        id: Math.random().toString(36).substr(2, 9),
        websiteId: post.websiteId,
        title: post.title,
        url: post.url || '',
        status: post.status,
        uploadedDate: post.uploadedDate,
        keyword: post.searchQuery || (post.keywords && post.keywords.length > 0 ? post.keywords[0] : ''),
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        content: post.content,
        faqs: post.faqs,
        pagePosition: post.pagePosition,
        resultText: post.resultText,
        isWorkEnabled: post.isWorkEnabled,
        mwCampaignId: post.mwCampaignId,
        mwTemplateId: post.mwTemplateId,
        links: [],
        category: 'Landing page' // Default category
      };

      await MockService.addPage(newPage);
      await MockService.deletePost(post.id);

      // Update UI immediately (Optimistic Update)
      setSitePosts(prev => prev.filter(p => p.id !== post.id));
      setSitePages(prev => [newPage, ...prev]);

      // Sync with backend to ensure consistency
      await loadSiteDetails(selectedWebsite.id);

    } catch (error: any) {
      console.error("Failed to move post:", error);
      alert(`Failed to move post to pages: ${error.message} `);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', url: '', category: '', notes: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const isLikelyPost = (url: string) => {
    try {
      const path = new URL(url).pathname.toLowerCase();
      // Common WordPress & generic post patterns
      const postPatterns = [
        /\/20\d{2}\/\d{2}\/(\d{2}\/)?/, // Date patterns (year/month/day or year/month)
        /\/blog\//,
        /\/post\//,
        /\/article\//,
        /\/news\//,
        /\/p=\d+/,         // plain permalinks
        /\?p=\d+/,
        /\.html$/          // very common for articles
      ];

      if (postPatterns.some(pattern => pattern.test(path))) return true;

      // Heuristic: Deeper URLs frequently denote articles/posts in many CMS structures
      const segments = path.split('/').filter(Boolean).length;
      if (segments >= 3) return true;

      return false;
    } catch (e) {
      return false;
    }
  };

  const handleScanDomain = async (type: 'pages' | 'posts' = 'pages') => {
    if (!selectedWebsite) return;

    // Check if GSC is connected - if so, prioritize it
    if (selectedWebsite.gscConnected && selectedWebsite.accessToken) {
      setIsScanning(true);
      try {
        const allLinks = await MockService.syncGscPages(selectedWebsite.id);
        const links = allLinks.filter(link => {
          const isPost = isLikelyPost(link);
          return type === 'posts' ? isPost : !isPost;
        });
        setScanResult({ links, websiteId: selectedWebsite.id, type, isGsc: true });
        setIsScanning(false);
        return;
      } catch (err: any) {
        console.error("GSC Sync Failed:", err);
        setGscSyncError({
          title: "Google Sync Failed",
          message: `We couldn't fetch data from Google Search Console: ${err.message}.\n\nWould you like to fallback to traditional domain scanning?`,
          onFallback: () => {
            setGscSyncError(null);
            performTraditionalScan(type);
          }
        });
        setIsScanning(false);
        return;
      }
    }

    performTraditionalScan(type);
  };

  const performTraditionalScan = async (type: 'pages' | 'posts' = 'pages') => {
    if (!selectedWebsite) return;
    setIsScanning(true);
    try {
      const allLinks = await MockService.crawlWebsite(selectedWebsite.url);
      const links = allLinks.filter(link => {
        const isPost = isLikelyPost(link);
        return type === 'posts' ? isPost : !isPost;
      });
      setScanResult({ links, websiteId: selectedWebsite.id, type, isGsc: false });
    } catch (err) {
      alert("Failed to scan domain. Ensure your backend server is running on port 3001.");
    } finally {
      setIsScanning(false);
    }
  };

  const confirmBulkAdd = async () => {
    if (!scanResult || !selectedWebsite) return;
    if (scanResult.type === 'pages') {
      await MockService.bulkAddPages(selectedWebsite.id, scanResult.links);
      alert(`Successfully added ${scanResult.links.length} pages to the dashboard.`);
    } else {
      await MockService.bulkAddPosts(selectedWebsite.id, scanResult.links);
      alert(`Successfully added ${scanResult.links.length} posts to the dashboard.`);
    }
    await loadSiteDetails(selectedWebsite.id);
    setScanResult(null);
  };

  const handleAddPost = () => {
    if (!selectedWebsite) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      websiteId: selectedWebsite.id,
      title: '',
      url: '',
      keywords: [],
      status: 'draft',
      uploadedDate: new Date().toISOString().split('T')[0],
      publishDate: '',
      metaTitle: '',
      metaDescription: '',
      content: [],
      faqs: [],
      pagePosition: "0" // Init as string
    };
    setEditor({ type: 'post', item: newPost, isNew: true });
  };

  const handleAddPage = () => {
    if (!selectedWebsite) return;
    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      websiteId: selectedWebsite.id,
      title: '',
      url: '',
      keyword: '',
      status: 'draft',
      uploadedDate: new Date().toISOString().split('T')[0],
      links: [],
      metaTitle: '',
      metaDescription: '',
      content: [],
      faqs: [],
      pagePosition: "0", // Init as string
      category: 'Landing page'
    };
    setEditor({ type: 'page', item: newPage, isNew: true });
  };

  const handleFetchGscSites = async () => {
    // We need an access token. If no site is connected, we might need a global login or use selected site's token
    const token = selectedWebsite?.accessToken || localStorage.getItem('gsc_access_token');
    const refreshToken = selectedWebsite?.refreshToken || localStorage.getItem('gsc_refresh_token');

    if (!token && !refreshToken) {
      alert("Please connect to Google Search Console first in the Tracking page.");
      return;
    }

    setIsFetchingSites(true);
    setIsGscImportOpen(true);
    try {
      const sites = await MockService.listGscSites(token || '', refreshToken || undefined);
      setGscSites(sites);
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch GSC sites: " + err.message);
    } finally {
      setIsFetchingSites(false);
    }
  };

  const handleImportGscSite = async (siteUrl: string) => {
    const name = siteUrl.replace('sc-domain:', '').replace('https://', '').replace('http://', '').replace(/\/$/, '');
    const newSiteId = Math.random().toString(36).substr(2, 9);
    const newSite: Website = {
      id: newSiteId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      url: siteUrl.startsWith('sc-domain:') ? `https://${name}` : siteUrl,
      category: 'GSC Imported',
      notes: 'Imported from Google Search Console',
      status: 'active',
      socialLinks: [],
      gscConnected: true,
      accessToken: selectedWebsite?.accessToken || localStorage.getItem('gsc_access_token') || '',
      refreshToken: selectedWebsite?.refreshToken || localStorage.getItem('gsc_refresh_token') || ''
    };

    await MockService.addWebsite(newSite);
    await refreshWebsites();
    setSelectedWebsite(newSite); // Select the newly imported site

    // Automatically trigger a scan/sync for this new site
    setIsScanning(true);
    try {
      const links = await MockService.syncGscPages(newSite.id);
      if (links.length > 0) {
        setScanResult({ links, websiteId: newSiteId, type: 'pages', isGsc: true });
        // Instead of alerting, we let the user see the scanResult in the UI and click "Add All"
      } else {
        alert(`Successfully imported ${name}. No indexed pages found.`);
      }
    } catch (err: any) {
      console.warn("Initial page sync failed for imported site:", err);
      alert(`Imported ${name}, but failed to fetch pages: ${err.message}`);
    } finally {
      setIsScanning(false);
      setIsGscImportOpen(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const { success, failure } = await MockService.syncAllGscData();
      alert(`Sync Complete!\nSuccessfully updated: ${success} domains\nFailed: ${failure} domains`);
      if (selectedWebsite) {
        await loadSiteDetails(selectedWebsite.id);
      }
    } catch (err: any) {
      alert(`Global Sync Failed: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Helper to normalize hostname for comparison (removes www and protocol)
  const getHostname = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
      return null;
    }
  };

  // Reusable validation function that triggers the UI modal
  const validateUrlDomain = (targetUrl: string): boolean => {
    if (!selectedWebsite) return false;

    const itemUrl = targetUrl.trim();
    // Check if URL is valid and absolute
    if (!itemUrl.startsWith('http://') && !itemUrl.startsWith('https://')) {
      setValidationError({
        title: "Invalid URL Format",
        message: "Please enter a valid absolute URL starting with http:// or https://"
      });
      return false;
    }

    const siteHostname = getHostname(selectedWebsite.url);
    const itemHostname = getHostname(itemUrl);

    if (!siteHostname || !itemHostname || siteHostname !== itemHostname) {
      setValidationError({
        title: "Domain Mismatch",
        message: `The link you entered (${itemHostname}) does not match the selected website's domain (${siteHostname}).\n\nPlease ensure you are adding content for the correct website.`
      });
      return false;
    }
    return true;
  };

  const handleSaveEditor = async () => {
    if (!editor || !selectedWebsite) return;

    // 1. Basic Validation
    if (!editor.item.title) {
      alert("Please enter a title.");
      return;
    }
    if (!editor.item.url) {
      alert("Please enter a URL.");
      return;
    }

    // Check for duplicates
    const urlToCheck = editor.item.url.trim().toLowerCase();
    if (editor.type === 'page') {
      const isDuplicate = sitePages.some(p => p.id !== editor.item.id && p.url.trim().toLowerCase() === urlToCheck);
      if (isDuplicate) {
        alert("A page with this URL already exists for this website.");
        return;
      }
    } else {
      const isDuplicate = sitePosts.some(p => p.id !== editor.item.id && p.url?.trim().toLowerCase() === urlToCheck);
      if (isDuplicate) {
        alert("A post with this URL already exists for this website.");
        return;
      }
    }

    // 2. Strict Domain Validation (With Modal)
    if (!validateUrlDomain(editor.item.url)) {
      return; // Stop save on validation failure
    }

    // 3. ID Mismatch Check (Double check security)
    if (editor.item.websiteId !== selectedWebsite.id) {
      alert("Security Restriction: ID mismatch detected.");
      setEditor(null);
      return;
    }

    // 4. Permission Check
    const module = editor.type === 'page' ? ModuleKey.PAGES : ModuleKey.POSTS;
    if (!checkPermission(module, 'edit')) {
      alert("You don't have permission to edit this.");
      return;
    }

    // 5. Save Logic
    if (editor.type === 'page') {
      if (editor.isNew) {
        await MockService.addPage(editor.item as Page);
        setSitePages([...sitePages, editor.item as Page]);
      } else {
        await MockService.updatePage(editor.item as Page);
        const updatedPages = sitePages.map(p => p.id === editor.item.id ? (editor.item as Page) : p);
        setSitePages(updatedPages);
      }
    } else {
      // Auto-set publish date if publishing a post for the first time
      if (editor.item.status === 'published' && !(editor.item as Post).publishDate) {
        (editor.item as Post).publishDate = new Date().toISOString().split('T')[0];
      }

      if (editor.isNew) {
        await MockService.addPost(editor.item as Post);
        setSitePosts([...sitePosts, editor.item as Post]);
      } else {
        await MockService.updatePost(editor.item as Post);
        const updatedPosts = sitePosts.map(p => p.id === editor.item.id ? (editor.item as Post) : p);
        setSitePosts(updatedPosts);
      }
    }
    setEditor(null);
  };

  const handleAutoFill = async () => {
    if (!editor?.item.url) {
      alert("Please enter a URL first to fetch content.");
      return;
    }

    if (!selectedWebsite) return;

    // Strict Domain Validation (With Modal)
    if (!validateUrlDomain(editor.item.url)) {
      return; // Stop auto-fill on validation failure
    }

    setIsFetching(true);
    try {
      const scrapedData = await MockService.scrapePageData(editor.item.url);

      if ((!scrapedData.content || scrapedData.content.length === 0) && (!scrapedData.title)) {
        alert("Could not extract meaningful content. Please check the URL or try manually.");
      } else if (!scrapedData.content || scrapedData.content.length === 0) {
        alert("Metadata found, but couldn't find main article content paragraphs.");
      }

      setEditor(prev => {
        if (!prev) return null;

        const updates: any = {
          title: scrapedData.title || prev.item.title,
          metaTitle: scrapedData.metaTitle || prev.item.metaTitle,
          metaDescription: scrapedData.metaDescription || prev.item.metaDescription,
          content: scrapedData.content?.length ? scrapedData.content : prev.item.content,
          faqs: scrapedData.faqs?.length ? scrapedData.faqs : prev.item.faqs,
        };

        if (prev.type === 'page') {
          updates.keyword = scrapedData.keyword || (prev.item as Page).keyword;
        } else {
          const currentKeywords = (prev.item as Post).keywords || [];
          const newKeywords = scrapedData.keywords || [];
          updates.keywords = [...new Set([...currentKeywords, ...newKeywords])];
        }

        return {
          ...prev,
          item: { ...prev.item, ...updates }
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data. Ensure the URL is publicly accessible.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleListAutoFill = async (item: Page | Post) => {
    if (!selectedWebsite) return;

    // Strict Domain Validation (With Modal)
    if (item.url && !validateUrlDomain(item.url)) {
      return; // Stop auto-fill on validation failure
    }

    if (!item.url) {
      alert("Item has no URL to scrape.");
      return;
    }

    if (!window.confirm(`Auto-fill data for "${item.title || 'Untitled'}" from ${item.url}? This will overwrite existing content.`)) {
      return;
    }

    setIsFetching(true);
    try {
      const scrapedData = await MockService.scrapePageData(item.url);

      const updates: any = {
        title: scrapedData.title || item.title,
        metaTitle: scrapedData.metaTitle || item.metaTitle,
        metaDescription: scrapedData.metaDescription || item.metaDescription,
        content: scrapedData.content?.length ? scrapedData.content : item.content,
        faqs: scrapedData.faqs?.length ? scrapedData.faqs : item.faqs,
      };

      if ((item as Page).category) {
        // Logic for Page
        updates.keyword = scrapedData.keyword || (item as Page).keyword;
        await MockService.updatePageDetails(item.id, updates);

        // Refresh local state
        setSitePages(prev => prev.map(p => p.id === item.id ? { ...p, ...updates } : p));
      } else {
        // Logic for Post
        const currentKeywords = (item as Post).keywords || [];
        const newKeywords = scrapedData.keywords || [];
        updates.keywords = [...new Set([...currentKeywords, ...newKeywords])];
        await MockService.updatePostDetails(item.id, updates);

        // Refresh local state
        setSitePosts(prev => prev.map(p => p.id === item.id ? { ...p, ...updates } : p));
      }

      alert("Auto-fill complete!");
    } catch (err: any) {
      console.error("List Auto-fill failed:", err);
      alert(`Auto-fill failed: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCategoryChange = async (pageId: string, newCategory: string) => {
    try {
      await MockService.updatePageDetails(pageId, { category: newCategory as any });
      setSitePages(prev => prev.map(p => p.id === pageId ? { ...p, category: newCategory as any } : p));
    } catch (error: any) {
      console.error("Failed to update category:", error);
      alert("Failed to update category.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, type: 'page' | 'post') => {
    try {
      if (type === 'page') {
        await MockService.updatePageDetails(id, { status: newStatus as any });
        setSitePages(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      } else {
        await MockService.updatePostDetails(id, { status: newStatus as any });
        setSitePosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    }
  };

  const handleSaveSocials = async () => {
    if (!selectedWebsite) return;

    // Filter out empty URLs
    const validLinks = socialLinks.filter(l => l.url && l.url.trim() !== "");

    // Final check for duplicates before saving
    const urls = validLinks.map(l => l.url.trim().replace(/\/$/, '').toLowerCase());
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      setValidationError({
        title: "Duplicate Link Detected",
        message: "One or more social links are duplicates. Please ensure each platform URL is unique before saving."
      });
      return;
    }

    const updatedWebsite = { ...selectedWebsite, socialLinks: validLinks };
    await MockService.updateWebsite(updatedWebsite);
    await refreshWebsites();
    setIsSocialModified(false);
  };

  const updateEditorItem = (field: string, value: any) => {
    if (!editor) return;
    setEditor({
      ...editor,
      item: { ...editor.item, [field]: value }
    });
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        let value = row[fieldName];
        if (typeof value === 'object') value = JSON.stringify(value).replace(/"/g, "'");
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderEditor = (item: Page | Post, isPage: boolean) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
        {/* Editor Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditor(null)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {editor?.isNew ? `Create ${isPage ? 'Page' : 'Post'}` : `Edit ${isPage ? 'Page' : 'Post'}`}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-green-500' :
                  item.status === 'ready' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                <span className="text-xs text-gray-500 capitalize">{item.status}</span>
                <span className="text-gray-300">|</span>
                <p className="text-xs text-gray-500 max-w-[200px] truncate">
                  {item.title || 'Untitled Draft'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              {(['draft', 'ready', 'published'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateEditorItem('status', s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${item.status === s
                    ? s === 'published' ? 'bg-green-600 text-white shadow-sm'
                      : s === 'ready' ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <button
              onClick={handleSaveEditor}
              disabled={!(editor.type === 'page' ? canEditPages : canEditPosts)}
              className="bg-primary hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition text-sm disabled:opacity-50"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Basic Info & Meta */}
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Globe size={18} className="text-blue-500" /> Basic Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Display Name)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition"
                      value={item.title}
                      onChange={e => updateEditorItem('title', e.target.value)}
                      placeholder="e.g. Homepage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition"
                        value={item.url}
                        onChange={e => updateEditorItem('url', e.target.value)}
                        onBlur={() => {
                          if (item.url && !item.title) {
                            handleAutoFill();
                          }
                        }}
                        placeholder="https://example.com/page"
                      />
                      <button
                        onClick={handleAutoFill}
                        disabled={isFetching}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 p-2.5 rounded-lg transition disabled:opacity-50"
                        title="Auto-fill Data from URL"
                      >
                        {isFetching ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isPage ? 'Primary Keyword' : 'Keywords'}
                    </label>
                    {isPage ? (
                      <div className="space-y-3">
                        <input
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                          value={(item as Page).keyword || ''}
                          onChange={e => updateEditorItem('keyword', e.target.value)}
                          placeholder="Target Keyword"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Page Category</label>
                          <div className="flex flex-wrap gap-2">
                            {(['Main Page', 'Feature Page', 'Landing page'] as const).map(cat => (
                              <button
                                key={cat}
                                onClick={() => updateEditorItem('category', (item as Page).category === cat ? undefined : cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${(item as Page).category === cat
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                  }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <KeywordsEditor keywords={(item as Post).keywords} onChange={k => updateEditorItem('keywords', k)} />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                  <Shield size={18} className="text-purple-500" /> SEO Metadata
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      value={item.metaTitle || ''}
                      onChange={e => updateEditorItem('metaTitle', e.target.value)}
                      placeholder="SEO Title Tag"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2.5 h-32 resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      value={item.metaDescription || ''}
                      onChange={e => updateEditorItem('metaDescription', e.target.value)}
                      placeholder="SEO Description Meta Tag..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Content */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <FileText size={18} className="text-orange-500" /> Content Paragraphs
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <ContentEditor content={item.content} onChange={c => updateEditorItem('content', c)} />
              </div>
            </div>

            {/* Right Column: FAQ */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <Server size={18} className="text-green-500" /> FAQ Content
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <FaqEditor faqs={item.faqs} onChange={f => updateEditorItem('faqs', f)} />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderPagesTab = () => {
    if (!canViewPages) return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
        <Shield size={48} className="mx-auto mb-4 opacity-20" />
        <p>You don't have permission to view pages.</p>
      </div>
    );

    if (editor?.type === 'page') {
      return renderEditor(editor.item, true);
    }

    const sortedPages = [...sitePages]
      .filter(p => {
        const matchCategory = activePageCategory === 'all' || p.category === activePageCategory;
        const query = searchQuery.toLowerCase();
        const matchSearch = p.title.toLowerCase().includes(query) ||
          p.url.toLowerCase().includes(query) ||
          (p.keyword && p.keyword.toLowerCase().includes(query));
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchDate = isWithinRange(p.uploadedDate);
        return matchCategory && matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => {
        if (sortConfig) {
          const { key, direction } = sortConfig;
          let valA: any = '';
          let valB: any = '';

          if (key === 'info') {
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
          } else if (key === 'keyword') {
            valA = (a.keyword || '').toLowerCase();
            valB = (b.keyword || '').toLowerCase();
          } else if (key === 'category') {
            const catOrder = ['Main Page', 'Feature Page', 'Landing page'];
            valA = catOrder.indexOf(a.category as any);
            valB = catOrder.indexOf(b.category as any);
            if (valA === -1) valA = 99;
            if (valB === -1) valB = 99;
          } else if (key === 'status') {
            valA = statusSortOrder.indexOf(a.status as any);
            valB = statusSortOrder.indexOf(b.status as any);
          }

          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
        }

        // Default: Sort by Status priority
        const priorityA = statusSortOrder.indexOf(a.status as any);
        const priorityB = statusSortOrder.indexOf(b.status as any);
        return priorityA - priorityB;
      });

    const totalPages = Math.ceil(sortedPages.length / ITEMS_PER_PAGE);
    const paginatedPages = sortedPages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="space-y-6 flex flex-col h-full">
        {/* Scanner Result Card */}
        {scanResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-white p-2 rounded-lg ${scanResult.isGsc ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {scanResult.isGsc ? <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full" alt="G" /> : <Search size={20} />}
                </div>
                <div>
                  <h3 className={`font-bold ${scanResult.isGsc ? 'text-green-900' : 'text-blue-900'}`}>
                    {scanResult.isGsc ? 'Google Sync' : 'Domain Scan'} Complete
                  </h3>
                  <p className={`text-sm ${scanResult.isGsc ? 'text-green-700' : 'text-blue-700'}`}>
                    Found {scanResult.links.length} {scanResult.type === 'posts' ? 'articles' : 'pages'} on this domain.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScanResult(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                <button onClick={confirmBulkAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all">Add All to Dashboard</button>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto bg-white/50 rounded-lg p-3 border border-blue-100 flex flex-col gap-1">
              {scanResult.links.map((link, idx) => (
                <div key={idx} className="text-xs text-blue-600 font-mono flex items-center gap-2">
                  <span className="opacity-30">#{(idx + 1).toString().padStart(2, '0')}</span> {link}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="font-bold text-gray-700 shrink-0">Pages ({sortedPages.length})</h3>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:flex hidden">
                {(['all', 'Main Page', 'Feature Page', 'Landing page'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActivePageCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${activePageCategory === cat
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {canEditPages && (
                <button
                  onClick={() => handleScanDomain('pages')}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-200 shadow-sm transition disabled:opacity-50"
                  disabled={isScanning}
                >
                  {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} className="text-blue-500" />}
                  {isScanning ? 'Scanning...' : 'Scan Domain'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleRemoveDuplicates('pages')}
                  className="p-2 text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm"
                  title="Check & Remove Duplicates"
                >
                  <FileMinus size={18} />
                </button>
              )}
              <button onClick={() => downloadCSV(sortedPages, 'pages')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm" title="Export CSV"><Download size={18} /></button>
              {canEditPages && (
                <button onClick={handleAddPage} className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition">
                  <Plus size={18} /> Add Page
                </button>
              )}
            </div>
          </div>
          <div className="px-6 py-2">
            <BulkActionsToolbar
              type="pages"
              selectedCount={selectedPageIds.size}
              onStatusUpdate={(status) => handleBulkStatusUpdate('pages', status)}
              onDelete={() => handleBulkDelete('pages')}
              onCategoryUpdate={handleBulkCategoryUpdate}
              onAutoFill={() => handleBulkAutoFill('pages')}
              onMove={() => handleBulkMove('pages')}
              onAutoCategorize={handleBulkAutoCategorize}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                      checked={paginatedPages.length > 0 && selectedPageIds.size === paginatedPages.length}
                      onChange={() => {
                        if (selectedPageIds.size === paginatedPages.length) setSelectedPageIds(new Set());
                        else setSelectedPageIds(new Set(paginatedPages.map(p => p.id)));
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <button onClick={() => requestSort('info')} className="flex items-center gap-1 hover:text-accent transition-colors">
                      Page Info <ArrowUpDown size={12} className={sortConfig?.key === 'info' ? 'text-accent' : 'text-gray-300'} />
                    </button>
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Last Edited
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <button onClick={() => requestSort('category')} className="flex items-center gap-1 hover:text-accent transition-colors">
                      Category <ArrowUpDown size={12} className={sortConfig?.key === 'category' ? 'text-accent' : 'text-gray-300'} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 cursor-default">
                        Status <ArrowUpDown size={12} className="text-blue-500" />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none lowercase font-normal"
                      >
                        <option value="all">Any Status</option>
                        <option value="ready">Ready</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <button onClick={() => requestSort('keyword')} className="flex items-center gap-1 hover:text-accent transition-colors">
                      Target Keyword <ArrowUpDown size={12} className={sortConfig?.key === 'keyword' ? 'text-accent' : 'text-gray-300'} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPages.map(page => (
                  <tr key={page.id} className={`hover:bg-gray-50 transition group ${selectedPageIds.has(page.id) ? 'bg-accent/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                        checked={selectedPageIds.has(page.id)}
                        onChange={() => togglePageSelection(page.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <a href={page.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                        {page.url} <ExternalLink size={10} />
                      </a>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {page.lastEdited || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={page.category || 'Landing page'}
                        onChange={(e) => handleCategoryChange(page.id, e.target.value)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter cursor-pointer outline-none border-none appearance-none hover:bg-opacity-80 ${(page.category || 'Landing page') === 'Main Page' ? 'bg-purple-100 text-purple-700' :
                          (page.category || 'Landing page') === 'Feature Page' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-cyan-100 text-cyan-700'
                          }`}
                      >
                        <option value="Main Page">Main Page</option>
                        <option value="Feature Page">Feature Page</option>
                        <option value="Landing page">Landing Page</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={page.status}
                        onChange={(e) => handleStatusChange(page.id, e.target.value, 'page')}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer outline-none border-none appearance-none hover:bg-opacity-80 ${page.status === 'published' ? 'bg-green-100 text-green-700' :
                          page.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {page.keyword ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex items-center w-fit gap-1">
                          <Tag size={10} /> {page.keyword}
                        </span>
                      ) : <span className="text-gray-400 italic text-xs">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditor({ type: 'page', item: page })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={16} />
                        </button>

                        {canDelete && (
                          <button onClick={() => handleDeletePage(page.id, page.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleMovePageToPost(page)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Move to Posts"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedPages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">No pages found in this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedPages.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    );
  };

  const renderPostsTab = () => {
    if (!canViewPosts) return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
        <Shield size={48} className="mx-auto mb-4 opacity-20" />
        <p>You don't have permission to view posts.</p>
      </div>
    );

    if (editor?.type === 'post') {
      return renderEditor(editor.item, false);
    }

    const sortedPosts = [...sitePosts]
      .filter(p => {
        const query = searchQuery.toLowerCase();
        const matchSearch = p.title.toLowerCase().includes(query) ||
          p.url.toLowerCase().includes(query) ||
          (p.keywords && p.keywords.some(k => k.toLowerCase().includes(query)));
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchDate = isWithinRange(p.uploadedDate);
        return matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => {
        if (sortConfig) {
          const { key, direction } = sortConfig;
          let valA: any = '';
          let valB: any = '';

          if (key === 'info') {
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
          } else if (key === 'keyword' || key === 'keywords') {
            valA = (a.keywords || []).join(',').toLowerCase();
            valB = (b.keywords || []).join(',').toLowerCase();
          } else if (key === 'status') {
            valA = statusSortOrder.indexOf(a.status as any);
            valB = statusSortOrder.indexOf(b.status as any);
          }

          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
        }

        const priorityA = statusSortOrder.indexOf(a.status as any);
        const priorityB = statusSortOrder.indexOf(b.status as any);
        return priorityA - priorityB;
      });

    const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="space-y-6 flex flex-col h-full">
        {/* Scanner Result Card */}
        {scanResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-white p-2 rounded-lg ${scanResult.isGsc ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {scanResult.isGsc ? <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full" alt="G" /> : <Search size={20} />}
                </div>
                <div>
                  <h3 className={`font-bold ${scanResult.isGsc ? 'text-green-900' : 'text-blue-900'}`}>
                    {scanResult.isGsc ? 'Google Sync' : 'Domain Scan'} Complete
                  </h3>
                  <p className={`text-sm ${scanResult.isGsc ? 'text-green-700' : 'text-blue-700'}`}>
                    Found {scanResult.links.length} {scanResult.type === 'posts' ? 'articles' : 'pages'} on this domain.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScanResult(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                <button onClick={confirmBulkAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all">Add All to Dashboard</button>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto bg-white/50 rounded-lg p-3 border border-blue-100 flex flex-col gap-1">
              {scanResult.links.map((link, idx) => (
                <div key={idx} className="text-xs text-blue-600 font-mono flex items-center gap-2">
                  <span className="opacity-30">#{(idx + 1).toString().padStart(2, '0')}</span> {link}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="font-bold text-gray-700 shrink-0">Articles ({sortedPosts.length})</h3>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {canEditPosts && (
                <button
                  onClick={() => handleScanDomain('posts')}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-200 shadow-sm transition disabled:opacity-50"
                  disabled={isScanning}
                >
                  {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} className="text-blue-500" />}
                  {isScanning ? 'Scanning...' : 'Scan Domain'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleRemoveDuplicates('posts')}
                  className="p-2 text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm"
                  title="Check & Remove Duplicates"
                >
                  <FileMinus size={18} />
                </button>
              )}
              <button onClick={() => downloadCSV(sortedPosts, 'posts')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm" title="Export CSV"><Download size={18} /></button>
              <button onClick={handleAddPost} className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <Plus size={18} /> Add Post
              </button>
            </div>
          </div>
          <div className="px-6 py-2">
            <BulkActionsToolbar
              type="posts"
              selectedCount={selectedPostIds.size}
              onStatusUpdate={(status) => handleBulkStatusUpdate('posts', status)}
              onDelete={() => handleBulkDelete('posts')}
              onAutoFill={() => handleBulkAutoFill('posts')}
              onMove={() => handleBulkMove('posts')}
              onAutoCategorize={handleBulkAutoCategorize}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                      checked={paginatedPosts.length > 0 && selectedPostIds.size === paginatedPosts.length}
                      onChange={() => {
                        if (selectedPostIds.size === paginatedPosts.length) setSelectedPostIds(new Set());
                        else setSelectedPostIds(new Set(paginatedPosts.map(p => p.id)));
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <button onClick={() => requestSort('info')} className="flex items-center gap-1 hover:text-accent transition-colors">
                      Post Info <ArrowUpDown size={12} className={sortConfig?.key === 'info' ? 'text-accent' : 'text-gray-300'} />
                    </button>
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Last Edited
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 cursor-default">
                        Status <ArrowUpDown size={12} className="text-blue-500" />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none lowercase font-normal"
                      >
                        <option value="all">Any Status</option>
                        <option value="ready">Ready</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Published</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPosts.map(post => (
                  <tr key={post.id} className={`hover:bg-gray-50 transition group ${selectedPostIds.has(post.id) ? 'bg-accent/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                        checked={selectedPostIds.has(post.id)}
                        onChange={() => togglePostSelection(post.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <a href={post.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                        {post.url} <ExternalLink size={10} />
                      </a>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.lastEdited || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post.id, e.target.value, 'post')}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer outline-none border-none appearance-none hover:bg-opacity-80 ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.publishDate || <span className="text-gray-400 italic">Draft</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditor({ type: 'post', item: post })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={16} />
                        </button>

                        {canDelete && (
                          <button onClick={() => handleDeletePost(post.id, post.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleMovePostToPage(post)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Move to Pages"
                        >
                          <ArrowLeft size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedPosts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">No posts found. Start writing!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedPosts.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    );
  };

  const renderSocialTab = () => {
    try {
      if (!canViewSocial) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          <Shield size={48} className="mx-auto mb-4 opacity-20" />
          <p>You don't have permission to view social media links.</p>
        </div>
      );

      const updateSocialLink = (id: string, field: keyof SocialLink, value: any) => {
        setSocialLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
        setIsSocialModified(true);
      };

      const handleSort = (key: string) => {
        setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
      };

      const removeSocialLink = (id: string) => {
        const linkToRemove = socialLinks.find(l => l.id === id);
        if (!linkToRemove) return;

        setSocialLinks(prev => prev.filter(l => l.id !== id));
        if (linkToRemove.id) {
          setSelectedSocialIds(prev => {
            const next = new Set(prev);
            next.delete(linkToRemove.id);
            return next;
          });
        }
        setIsSocialModified(true);
      };

      const addSocialLink = () => {
        const newLink: SocialLink = {
          id: Math.random().toString(36).substr(2, 9),
          platform: 'other',
          url: '',
          uploadedDate: new Date().toISOString().split('T')[0],
          isWorkEnabled: false
        };
        setSocialLinks([...socialLinks, newLink]);
        setIsSocialModified(true);
      };

      const handleBulkImport = async () => {
        if (!bulkInput.trim()) return;
        if (!selectedWebsite) return;

        const urls = bulkInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u);
        const newLinks: SocialLink[] = urls.map(url => {
          let cleanUrl = url;
          if (!cleanUrl.match(/^https?:\/\//)) cleanUrl = `https://${cleanUrl}`;
          let platform: SocialLink['platform'] = 'other';
          try {
            const hostname = new URL(cleanUrl).hostname.toLowerCase();
            if (hostname.includes('facebook.com') || hostname.includes('fb.com')) platform = 'facebook';
            else if (hostname.includes('twitter.com') || hostname.includes('x.com')) platform = 'twitter';
            else if (hostname.includes('instagram.com')) platform = 'instagram';
            else if (hostname.includes('linkedin.com')) platform = 'linkedin';
            else if (hostname.includes('youtube.com')) platform = 'youtube';
          } catch (e) { }
          return {
            id: Math.random().toString(36).substr(2, 9),
            platform,
            url: cleanUrl,
            uploadedDate: new Date().toISOString().split('T')[0],
            isWorkEnabled: false
          };
        }).filter(link => !socialLinks.some(l => l.url.trim().toLowerCase() === link.url.trim().toLowerCase()));

        if (bulkWorkEnabled) {
          setIsUpdatingSocial(true);
          try {
            const finalLinks = [];
            for (const link of newLinks) {
              try {
                const { campaignId, templateId } = await MockService.upsertMicroworkersCampaign(selectedWebsite.id, link, 'social', bulkPositions);
                finalLinks.push({ ...link, isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId, targetPositions: bulkPositions });
              } catch (e: any) {
                console.error(`Failed to create campaign for ${link.url}`, e);
                if (e.campaignErrorData) {
                  setCampaignError(e.campaignErrorData);
                } else {
                  setCampaignError({
                    status: 'Unknown',
                    title: 'Campaign Creation Failed',
                    details: e.message || 'Unknown error occurred'
                  });
                }
                finalLinks.push(link);
              }
            }

            const updatedLinks = [...socialLinks, ...finalLinks];
            const updatedWebsite = { ...selectedWebsite, socialLinks: updatedLinks };
            await MockService.updateWebsite(updatedWebsite);

            setSocialLinks(updatedLinks);
            setIsSocialModified(false);
            await refreshWebsites();

          } catch (err: any) {
            alert("Error during bulk campaign creation: " + err.message);
          } finally {
            setIsUpdatingSocial(false);
          }
        } else {
          setSocialLinks(prev => [...prev, ...newLinks]);
          setIsSocialModified(true);
        }

        setBulkInput('');
        setIsBulkMode(false);
      };

      const toggleSelection = (id: string) => {
        setSelectedSocialIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      };

      const toggleAllSelection = () => {
        if (selectedSocialIds.size === socialLinks.length) {
          setSelectedSocialIds(new Set());
        } else {
          setSelectedSocialIds(new Set(socialLinks.map(l => l.id)));
        }
      };

      const handleBulkWorkToggle = async (enable: boolean) => {
        if (selectedSocialIds.size === 0 || !selectedWebsite) return;
        setIsUpdatingSocial(true);

        let capturedError: any = null;
        const updatedLinks = [...socialLinks];
        let hasChanges = false;

        for (const id of selectedSocialIds) {
          const idx = updatedLinks.findIndex(l => l.id === id);
          if (idx !== -1) {
            const link = updatedLinks[idx];

            if (enable && !link.isWorkEnabled) {
              try {
                const { campaignId, templateId } = await MockService.upsertMicroworkersCampaign(selectedWebsite.id, link, 'social', workTogglePositions);
                updatedLinks[idx] = { ...link, isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId, targetPositions: workTogglePositions };
                hasChanges = true;
              } catch (err: any) {
                console.error(`Failed to enable work for ${link.url}:`, err);
                if (!capturedError) capturedError = err;
              }
            } else if (!enable && link.isWorkEnabled) {
              updatedLinks[idx] = { ...link, isWorkEnabled: false, mwCampaignId: undefined };
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          setSocialLinks(updatedLinks);
          const updatedWebsite = { ...selectedWebsite, socialLinks: updatedLinks };
          try {
            await MockService.updateWebsite(updatedWebsite);
            await refreshWebsites();
            setIsSocialModified(false);
          } catch (saveErr: any) {
            console.error("Failed to save changes", saveErr);
            if (!capturedError) capturedError = saveErr;
          }
        }

        if (capturedError) {
          if (capturedError.campaignErrorData) {
            setCampaignError(capturedError.campaignErrorData);
          } else {
            alert("Operation completed with errors: " + capturedError.message);
          }
        }

        setIsUpdatingSocial(false);
      };

      const getPlatformIcon = (platform: string) => {
        switch (platform) {
          case 'facebook': return <Facebook size={18} className="text-blue-600" />;
          case 'twitter': return <Twitter size={18} className="text-sky-500" />;
          case 'instagram': return <Instagram size={18} className="text-pink-600" />;
          case 'linkedin': return <Linkedin size={18} className="text-blue-700" />;
          case 'youtube': return <Youtube size={18} className="text-red-600" />;
          default: return <LinkIcon size={18} className="text-gray-400" />;
        }
      };

      const filteredSocialLinks = (socialLinks || []).filter(l =>
        (l.url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.platform || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => {
        if (sortConfig?.key === 'platform') return sortConfig.direction === 'asc' ? (a.platform || '').localeCompare(b.platform || '') : (b.platform || '').localeCompare(a.platform || '');
        if (sortConfig?.key === 'url') return sortConfig.direction === 'asc' ? (a.url || '').localeCompare(b.url || '') : (b.url || '').localeCompare(a.url || '');
        if (sortConfig?.key === 'work') {
          // Sort by enabled, then by quantity
          if (a.isWorkEnabled !== b.isWorkEnabled) return sortConfig.direction === 'asc' ? (a.isWorkEnabled ? -1 : 1) : (a.isWorkEnabled ? 1 : -1);
          if (a.isWorkEnabled) return sortConfig.direction === 'asc' ? ((a.targetPositions || 0) - (b.targetPositions || 0)) : ((b.targetPositions || 0) - (a.targetPositions || 0));
          return 0;
        }
        return 0;
      });

      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
          {/* Social Toolbar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="font-bold text-gray-700 shrink-0">Social Media Links ({filteredSocialLinks.length})</h3>

              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search social links..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <BulkActionsToolbar
                type="social"
                selectedCount={selectedSocialIds.size}
                onStatusUpdate={(status) => handleBulkStatusUpdate('social', status)}
                onDelete={() => handleBulkDelete('social')}
              />
              {selectedSocialIds.size > 0 && (
                <div className="flex bg-blue-50 px-3 py-1 rounded-full border border-blue-100 items-center gap-3 animate-fade-in">
                  <span className="text-xs font-bold text-blue-700">Campaigns</span>
                  <div className="h-3 w-px bg-blue-200"></div>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-white rounded px-2 border border-blue-200" title="Set positions for new campaign">
                      <span className="text-[10px] text-gray-500 font-bold mr-1">QTY:</span>
                      <input
                        type="number"
                        className="w-10 text-[10px] border-none p-0 focus:ring-0 text-center font-bold text-gray-700"
                        value={workTogglePositions}
                        onChange={e => setWorkTogglePositions(Math.max(10, parseInt(e.target.value) || 30))}
                      />
                    </div>
                    <button
                      disabled={isUpdatingSocial}
                      onClick={() => handleBulkWorkToggle(true)}
                      className="text-[10px] font-bold uppercase text-green-600 hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Play size={10} /> Enable Work
                    </button>
                    <button
                      disabled={isUpdatingSocial}
                      onClick={() => handleBulkWorkToggle(false)}
                      className="text-[10px] font-bold uppercase text-yellow-600 hover:text-yellow-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Pause size={10} /> Disable Work
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkMode(!isBulkMode)}
                className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${isBulkMode ? 'bg-blue-600 text-white shadow-md' : 'text-blue-600 hover:bg-blue-50 border border-transparent'}`}
              >
                <Upload size={16} /> Bulk Import
              </button>
              <button onClick={addSocialLink} className="bg-primary text-white hover:bg-gray-800 text-sm font-medium flex items-center gap-1 px-4 py-1.5 rounded-lg transition shadow-sm">
                <Plus size={16} /> Add Link
              </button>
            </div>
          </div>

          {isBulkMode && (
            <div className="p-4 bg-blue-50/50 border-b border-blue-100 animate-scale-in">
              <label className="block text-sm font-bold text-blue-900 mb-2">Paste URLs (one per line)</label>

              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${bulkWorkEnabled ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                    {bulkWorkEnabled && <Check size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={bulkWorkEnabled} onChange={e => setBulkWorkEnabled(e.target.checked)} />
                  <span className="text-sm font-medium text-gray-700">Set Campaign for All</span>
                </label>

                {bulkWorkEnabled && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <label className="text-sm text-gray-600">Positions:</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={bulkPositions}
                      onChange={(e) => setBulkPositions(parseInt(e.target.value) || 30)}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                )}
              </div>

              <textarea
                className="w-full border border-blue-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none h-32 bg-white"
                placeholder="https://facebook.com/my-page&#10;https://twitter.com/my-handle"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setIsBulkMode(false)} className="px-4 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={handleBulkImport} className="bg-blue-600 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">Import Links</button>
              </div>
            </div>
          )}

          {/* Social Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 border-b border-gray-100 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={socialLinks.length > 0 && selectedSocialIds.size === socialLinks.length}
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th className="px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uploaded Date</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <button onClick={() => handleSort('work')} className="flex items-center gap-1 hover:text-gray-600">
                      Work Status <ArrowUpDown size={10} />
                    </button>
                  </th>
                  <th className="px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSocialLinks.map((link, idx) => (
                  <tr key={link.id || idx} className={`group hover:bg-gray-50/80 transition-colors ${selectedSocialIds.has(link.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedSocialIds.has(link.id)}
                        onChange={() => toggleSelection(link.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-100 shadow-sm">
                          {getPlatformIcon(link.platform)}
                        </div>
                        <select
                          className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer hover:bg-gray-200/50 rounded px-2 py-1"
                          value={link.platform}
                          onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value as any)}
                        >
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="youtube">YouTube</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        className="w-full bg-transparent border-none text-sm text-gray-600 focus:ring-0 placeholder:text-gray-300"
                        placeholder="https://platform.com/profile"
                        value={link.url}
                        onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {link.uploadedDate || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {link.isWorkEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <Play size={10} className="fill-current" /> Active ({link.targetPositions || 30})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          <Pause size={10} className="fill-current" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={link.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                          <ExternalLink size={16} />
                        </a>
                        <button onClick={() => removeSocialLink(link.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {
              socialLinks.length === 0 && !isBulkMode && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Share2 size={32} className="opacity-20" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">No Social Links Yet</p>
                  <p className="text-sm">Click "Add Link" or use "Bulk Import" to get started.</p>
                </div>
              )
            }
          </div >

          {isUpdatingSocial && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="text-sm font-bold text-gray-700 capitalize">Updating Campaigns...</p>
              </div>
            </div>
          )
          }
        </div >
      );
    } catch (err: any) {
      console.error("Crash in renderSocialTab:", err);
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          <h3 className="font-bold">Error Rendering Social Tab</h3>
          <p>{err.message || String(err)}</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {!selectedWebsite ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center p-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Globe size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Website Selected</h2>
          <p className="text-gray-500 max-w-sm mb-6">Select a website from the sidebar or add a new one to manage its pages, posts, and social links.</p>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
          >
            <Plus size={20} /> Add Your First Website
          </button>
        </div>
      ) : (
        <div className="max-w-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{selectedWebsite.name}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${selectedWebsite.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                  {selectedWebsite.status}
                </span>
              </div>
              <a href={selectedWebsite.url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:underline flex items-center gap-1 mt-1">
                {selectedWebsite.url} <ExternalLink size={12} />
              </a>
              <p className="text-sm text-gray-400 mt-1">{selectedWebsite.category}</p>
            </div>

            <div className="flex gap-2">
              {canEdit && (
                <>
                  <button
                    onClick={handleEditWebsite}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleSyncAll}
                    disabled={isSyncingAll}
                    className="bg-white border border-gray-200 hover:bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition shadow-sm disabled:opacity-50"
                    title="Refresh all connected GSC domains"
                  >
                    {isSyncingAll ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {isSyncingAll ? 'Syncing...' : 'Sync All'}
                  </button>
                  <button
                    onClick={handleFetchGscSites}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition shadow-sm"
                  >
                    <Search size={16} /> Import from GSC
                  </button>
                  <button
                    onClick={openAddModal}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                  >
                    <Plus size={16} /> New Site
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteWebsite}
                  className="bg-white border border-red-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                  title="Delete Website"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 max-w-md">
            {canViewPages && (
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'pages' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <LayoutGrid size={16} /> Pages
              </button>
            )}
            {canViewPosts && (
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <FileText size={16} /> Posts
              </button>
            )}
            {canViewSocial && (
              <button
                onClick={() => setActiveTab('social')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'social' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Share2 size={16} /> Social
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'pages' && renderPagesTab()}
          {activeTab === 'posts' && renderPostsTab()}
          {activeTab === 'social' && renderSocialTab()}
        </div>
      )}

      {/* Settings Modal - Also rendered here for edit mode access */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Website Settings' : 'Add New Website'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  required
                  type="url"
                  className="w-full border rounded p-2"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  onBlur={() => {
                    if (formData.url && !formData.name) {
                      try {
                        const hostname = new URL(formData.url).hostname.replace('www.', '').split('.')[0];
                        const capName = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                        setFormData(prev => ({ ...prev, name: capName }));
                      } catch (e) { }
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" className="w-full border rounded p-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full border rounded p-2" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50" disabled={isSaving}>Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-accent text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Error Modal */}
      {campaignError && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border-l-4 border-red-500">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Campaign Creation Failed</h2>
              </div>
              <button onClick={() => setCampaignError(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs font-bold text-red-500 uppercase mb-1">Status Code</p>
                <p className="text-sm font-mono text-red-800">{campaignError.status}</p>
              </div>

              {campaignError.errorTitle && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Error Head</p>
                  <p className="text-sm font-medium text-red-700">{campaignError.errorTitle}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Campaign Title</p>
                <p className="text-sm font-medium text-gray-800">{campaignError.title}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Error Details</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-40 overflow-y-auto">
                  <code className="text-xs text-gray-700 whitespace-pre-wrap font-mono break-all">
                    {campaignError.details}
                  </code>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setCampaignError(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-bold shadow-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{deleteConfirmation.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{deleteConfirmation.message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirmation.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSC Sync Error Modal */}
      {gscSyncError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{gscSyncError.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 whitespace-pre-wrap">{gscSyncError.message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setGscSyncError(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={gscSyncError.onFallback}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition"
              >
                Fallback to Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{validationError.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 whitespace-pre-wrap">{validationError.message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setValidationError(null)}
                className="bg-accent hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-bold shadow-md transition"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
      {/* GSC Property Browser Modal */}
      {isGscImportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Google Search Console Properties</h2>
                  <p className="text-xs text-gray-500">Select a property to import as a website.</p>
                </div>
              </div>
              <button onClick={() => setIsGscImportOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isFetchingSites ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p>Fetching properties from Google...</p>
                </div>
              ) : gscSites.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">
                  No properties found in this Google Search Console account.
                </div>
              ) : (
                gscSites.map((site, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-200 rounded-xl transition group shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                        <Globe size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate text-sm">{site.siteUrl}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{site.permissionLevel}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportGscSite(site.siteUrl)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition whitespace-nowrap"
                    >
                      Import Site
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsGscImportOpen(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}