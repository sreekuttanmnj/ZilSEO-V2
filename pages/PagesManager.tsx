import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { Page, Post, SocialLink, ExternalLink as ExternalLinkType } from '../types';
import { MockService } from '../services/mockService';
import { FileText, Share2, Layout, ExternalLink, ToggleLeft, ToggleRight, Loader2, Globe, CheckCircle, Shield, Plus, Trash2, Link, ArrowUpDown, RefreshCw, Search } from 'lucide-react';
import { ModuleKey } from '../types';

// --- Helper Components (Defined outside) ---

const EditableInput = ({
  value,
  onChange,
  type = 'text',
  placeholder = ''
}: {
  value: string | number | undefined,
  onChange: (val: any) => void,
  type?: 'text' | 'number',
  placeholder?: string
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  const onBlur = () => {
    if (localValue !== value) {
      onChange(type === 'number' ? Number(localValue) : localValue);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type={type}
      value={localValue || ''}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-accent focus:outline-none py-1 px-1 transition-colors text-sm"
    />
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

export default function PagesManager() {
  const { selectedWebsite, refreshWebsites } = useWebsite();
  const { checkPermission } = useAuth();

  const canEditPages = checkPermission(ModuleKey.PAGES, 'edit');
  const canViewPages = checkPermission(ModuleKey.PAGES, 'view');

  const canEditPosts = checkPermission(ModuleKey.POSTS, 'edit');
  const canViewPosts = checkPermission(ModuleKey.POSTS, 'view');

  const canEditSocial = checkPermission(ModuleKey.SOCIAL, 'edit');
  const canViewSocial = checkPermission(ModuleKey.SOCIAL, 'view');

  // Data State
  const [sitePages, setSitePages] = useState<Page[]>([]);
  const [sitePosts, setSitePosts] = useState<Post[]>([]);
  const [siteExternalLinks, setSiteExternalLinks] = useState<ExternalLinkType[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<'pages' | 'articles' | 'social' | 'external'>('pages');
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [campaignPositions, setCampaignPositions] = useState<Record<string, number>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingRankings, setIsSyncingRankings] = useState(false);

  // Pagination and Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  const [statusSortOrder] = useState<('ready' | 'draft' | 'published')[]>(['ready', 'draft', 'published']);

  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'draft' | 'published'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

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

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, dateFilter]);

  useEffect(() => {
    if (selectedWebsite) {
      loadData(selectedWebsite.id);
    }
  }, [selectedWebsite]);

  // Poll Campaign Statuses
  useEffect(() => {
    const checkStatuses = async () => {
      if (document.visibilityState !== 'visible') return;

      const activeItems = [
        ...sitePages.filter(p => p.isWorkEnabled && p.mwCampaignId).map(p => ({ ...p, _type: 'page' })),
        ...sitePosts.filter(p => p.isWorkEnabled && p.mwCampaignId).map(p => ({ ...p, _type: 'post' })),
        ...siteExternalLinks.filter(p => p.isWorkEnabled && p.mwCampaignId).map(p => ({ ...p, _type: 'external' })),
        ...(selectedWebsite?.socialLinks?.filter(s => s.isWorkEnabled && s.mwCampaignId) || []).map(s => ({ ...s, _type: 'social' }))
      ];

      if (activeItems.length === 0) return;

      for (const item of activeItems) {
        if (!item.mwCampaignId || item.mwCampaignId === 'undefined' || item.mwCampaignId === 'null') continue;
        const status = await MockService.getMicroworkersCampaignStatus(item.mwCampaignId!);

        // Only update if status changed to avoid re-renders
        if (campaignStatuses[item.mwCampaignId!] !== status) {
          setCampaignStatuses(prev => ({ ...prev, [item.mwCampaignId!]: status }));
        }

        // Auto-disable in DB if finished
        if (item.isWorkEnabled && (status === 'FINISHED' || status === 'ENDED')) {
          console.log(`[MW] Campaign ${item.mwCampaignId} finished, auto-disabling work state.`);
          if (item._type === 'page') {
            await MockService.updatePageDetails(item.id, { isWorkEnabled: false });
            setSitePages(prev => prev.map(p => p.id === item.id ? { ...p, isWorkEnabled: false } : p));
          } else if (item._type === 'post') {
            await MockService.updatePostDetails(item.id, { isWorkEnabled: false });
            setSitePosts(prev => prev.map(p => p.id === item.id ? { ...p, isWorkEnabled: false } : p));
          } else if (item._type === 'external') {
            await MockService.updateExternalLinkDetails(item.id, { isWorkEnabled: false });
            setSiteExternalLinks(prev => prev.map(p => p.id === item.id ? { ...p, isWorkEnabled: false } : p));
          } else if (item._type === 'social') {
            await MockService.toggleSocialWork(selectedWebsite!.id, item.id, false);
            refreshWebsites();
          }
        }
      }
    };

    const hasActiveWork = sitePages.some(p => p.isWorkEnabled) ||
      sitePosts.some(p => p.isWorkEnabled) ||
      siteExternalLinks.some(p => p.isWorkEnabled) ||
      (selectedWebsite?.socialLinks?.some(s => s.isWorkEnabled));

    if (hasActiveWork && !loadingIds.size) {
      checkStatuses();
      const interval = setInterval(checkStatuses, 60000); // Check every 60s
      return () => clearInterval(interval);
    }
  }, [sitePages, sitePosts, siteExternalLinks, selectedWebsite, loadingIds]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadData = async (websiteId: string) => {
    const pages = await MockService.getPages(websiteId);
    const posts = await MockService.getPosts(websiteId);
    const external = await MockService.getExternalLinks(websiteId);

    // Filter only PUBLISHED content
    setSitePages(pages.filter(p => p.status === 'published'));
    setSitePosts(posts.filter(p => p.status === 'published'));
    setSiteExternalLinks(external);
  };

  const getPosition = (id: string) => campaignPositions[id] || 30;

  const getStatusBadge = (campaignId?: string) => {
    if (!campaignId) return null;
    const status = campaignStatuses[campaignId];
    if (!status) return <span className="text-xs text-gray-400">Loading...</span>;

    let color = 'bg-gray-100 text-gray-800';
    let label = status;
    if (status === 'RUNNING' || status === 'NOK') color = 'bg-green-100 text-green-800';
    if (status === 'FINISHED' || status === 'ENDED') color = 'bg-blue-100 text-blue-800';
    if (status === 'CANCELED' || status === 'PAUSED') color = 'bg-yellow-100 text-yellow-800';
    if (status === 'NOT_FOUND') {
      color = 'bg-red-100 text-red-800';
      label = 'NOT FOUND';
    }
    if (status === 'ERROR') {
      color = 'bg-red-100 text-red-800';
      label = 'API ERROR';
    }

    return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${color}`}>{label}</span>;
  };

  // --- Actions ---

  const togglePageWork = async (id: string, current: boolean | undefined, item: Page) => {
    if (!selectedWebsite || !canEditPages) return;
    const positions = getPosition(id);

    // Check campaign status
    const status = item.mwCampaignId ? campaignStatuses[item.mwCampaignId] : null;
    const isFinished = status === 'FINISHED' || status === 'ENDED';
    const isRunning = status === 'RUNNING' || status === 'NOK';
    const isPaused = status === 'PAUSED' || status === 'PAUSED_SYSTEM';

    if (!current) {
      // We are trying to ENABLE it (Turn ON).
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        let shouldCreateNew = !item.mwCampaignId;

        if (item.mwCampaignId) {
          try {
            // If it exists, determine whether to restart or resume
            if (isFinished) {
              console.log(`Restarting finished campaign ${item.mwCampaignId}...`);
              await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              setSuccessMessage(`Campaign restarted with ${positions} new positions`);
            } else {
              // It might be paused, system-paused, or something else. Try Resume first.
              console.log(`Attempting to resume existing campaign ${item.mwCampaignId}...`);
              await MockService.resumeMicroworkersCampaign(item.mwCampaignId);

              if (status === 'ENDED' || status === 'FINISHED') {
                await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              }
              setSuccessMessage(`Campaign active`);
            }
          } catch (mwError: any) {
            // If the campaign ID is dead (404), mark for new creation
            if (mwError.message.includes('DoesNotExist')) {
              console.warn(`Campaign ${item.mwCampaignId} no longer exists on MW. Creating fresh one...`);
              shouldCreateNew = true;
            } else {
              throw mwError; // Re-throw other errors
            }
          }
        }

        if (shouldCreateNew) {
          // Create new campaign (No existing ID or ID was dead)
          const { campaignId, templateId } = await MockService.upsertMicroworkersCampaign(selectedWebsite.id, item, 'page', positions);
          await MockService.updatePageDetails(id, { isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId });
          setSitePages(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId } : p));
          setSuccessMessage(`New campaign created with ${positions} positions`);
        } else {
          // Only update status if we reused the existing one
          await MockService.updatePageDetails(id, { isWorkEnabled: true });
          setSitePages(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true } : p));
        }

      } catch (error: any) {
        console.error(error);
        alert(`Failed to activate campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } else {
      // Disabling (Turn OFF) - Pause the campaign
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        // Pause the campaign on MW if it's currently running
        if (item.mwCampaignId && isRunning) {
          await MockService.pauseMicroworkersCampaign(item.mwCampaignId);
        }

        await MockService.updatePageDetails(id, { isWorkEnabled: false });
        setSitePages(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: false } : p));
        setSuccessMessage(`Campaign paused`);
      } catch (error: any) {
        console.error(error);
        alert(`Failed to pause campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const togglePostWork = async (id: string, current: boolean | undefined, item: Post) => {
    if (!selectedWebsite || !canEditPosts) return;
    const positions = getPosition(id);

    const status = item.mwCampaignId ? campaignStatuses[item.mwCampaignId] : null;
    const isFinished = status === 'FINISHED' || status === 'ENDED';
    const isRunning = status === 'RUNNING' || status === 'NOK';
    const isPaused = status === 'PAUSED' || status === 'PAUSED_SYSTEM';

    if (!current) {
      // Enable Logic (Turn ON)
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        let shouldCreateNew = !item.mwCampaignId;

        if (item.mwCampaignId) {
          try {
            // If it exists, determine whether to restart or resume
            if (isFinished) {
              console.log(`Restarting finished campaign ${item.mwCampaignId}...`);
              await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              setSuccessMessage(`Campaign restarted with ${positions} new positions`);
            } else {
              // It might be paused, system-paused, or something else. Try Resume first.
              console.log(`Attempting to resume existing campaign ${item.mwCampaignId}...`);
              await MockService.resumeMicroworkersCampaign(item.mwCampaignId);

              if (status === 'ENDED' || status === 'FINISHED') {
                await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              }
              setSuccessMessage(`Campaign active`);
            }
          } catch (mwError: any) {
            // If the campaign ID is dead (404), mark for new creation
            if (mwError.message.includes('DoesNotExist')) {
              console.warn(`Campaign ${item.mwCampaignId} no longer exists on MW. Creating fresh one...`);
              shouldCreateNew = true;
            } else {
              throw mwError; // Re-throw other errors
            }
          }
        }

        if (shouldCreateNew) {
          // Create new campaign (No existing ID or ID was dead)
          const { campaignId, templateId } = await MockService.upsertMicroworkersCampaign(selectedWebsite.id, item, 'post', positions);
          await MockService.updatePostDetails(id, { isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId });
          setSitePosts(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId } : p));
          setSuccessMessage(`New campaign created with ${positions} positions`);
        } else {
          // Only update status if we reused the existing one
          await MockService.updatePostDetails(id, { isWorkEnabled: true });
          setSitePosts(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true } : p));
        }

      } catch (error: any) {
        console.error(error);
        alert(`Failed to activate campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } else {
      // Disable Logic (Turn OFF) - Pause the campaign
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        // Pause the campaign on MW if it's currently running
        if (item.mwCampaignId && isRunning) {
          await MockService.pauseMicroworkersCampaign(item.mwCampaignId);
        }

        await MockService.updatePostDetails(id, { isWorkEnabled: false });
        setSitePosts(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: false } : p));
        setSuccessMessage(`Campaign paused`);
      } catch (error: any) {
        console.error(error);
        alert(`Failed to pause campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const toggleSocialWork = async (socialId: string, current: boolean | undefined) => {
    if (!selectedWebsite || !canEditSocial) return;
    const positions = getPosition(socialId);
    await MockService.toggleSocialWork(selectedWebsite.id, socialId, !current, positions);
    refreshWebsites(); // Refresh context to get updated social links
  };

  const handlePageUpdate = async (id: string, field: keyof Page, value: string | number) => {
    if (!canEditPages) return;

    const page = sitePages.find(p => p.id === id);
    if (!page) return;

    // Update the local state and database
    await MockService.updatePageDetails(id, { [field]: value });
    setSitePages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

    // If this is a keyword or resultText change and campaign is active, update the template
    if ((field === 'keyword' || field === 'resultText') && page.isWorkEnabled && page.mwTemplateId) {
      try {
        const updatedPage = { ...page, [field]: value };
        await MockService.updateMicroworkersTemplate(page.mwTemplateId, updatedPage, 'page');
        console.log(`Template ${page.mwTemplateId} updated with new ${field}`);
      } catch (error: any) {
        console.error(`Failed to update template:`, error);
        // Don't show alert, just log - the page update was successful
      }
    }
  };

  const handlePostUpdate = async (id: string, field: keyof Post, value: string | number) => {
    if (!canEditPosts) return;

    const post = sitePosts.find(p => p.id === id);
    if (!post) return;

    // Update the local state and database
    await MockService.updatePostDetails(id, { [field]: value });
    setSitePosts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

    // If this is a searchQuery or resultText change and campaign is active, update the template
    if ((field === 'searchQuery' || field === 'resultText') && post.isWorkEnabled && post.mwTemplateId) {
      try {
        const updatedpost = { ...post, [field]: value };
        await MockService.updateMicroworkersTemplate(post.mwTemplateId, updatedpost, 'post');
        console.log(`Template ${post.mwTemplateId} updated with new ${field}`);
      } catch (error: any) {
        console.error(`Failed to update template:`, error);
        // Don't show alert, just log - the post update was successful
      }
    }
  };

  const toggleExternalWork = async (id: string, current: boolean | undefined, item: ExternalLinkType) => {
    if (!selectedWebsite || !canEditPages) return;
    const positions = getPosition(id);

    const status = item.mwCampaignId ? campaignStatuses[item.mwCampaignId] : null;
    const isFinished = status === 'FINISHED' || status === 'ENDED';
    const isRunning = status === 'RUNNING' || status === 'NOK';
    const isPaused = status === 'PAUSED' || status === 'PAUSED_SYSTEM';

    if (!current) {
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        let shouldCreateNew = !item.mwCampaignId;

        if (item.mwCampaignId) {
          try {
            // If it exists, determine whether to restart or resume
            if (isFinished) {
              console.log(`Restarting finished campaign ${item.mwCampaignId}...`);
              await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              setSuccessMessage(`Campaign restarted with ${positions} new positions`);
            } else {
              console.log(`Attempting to resume existing campaign ${item.mwCampaignId}...`);
              await MockService.resumeMicroworkersCampaign(item.mwCampaignId);

              if (status === 'ENDED' || status === 'FINISHED') {
                await MockService.restartMicroworkersCampaign(item.mwCampaignId, positions);
              }
              setSuccessMessage(`Campaign active`);
            }
          } catch (mwError: any) {
            // If the campaign ID is dead (404), mark for new creation
            if (mwError.message.includes('DoesNotExist')) {
              console.warn(`Campaign ${item.mwCampaignId} no longer exists on MW. Creating fresh one...`);
              shouldCreateNew = true;
            } else {
              throw mwError; // Re-throw other errors
            }
          }
        }

        if (shouldCreateNew) {
          // Create new campaign (No existing ID or ID was dead)
          const { campaignId, templateId } = await MockService.upsertMicroworkersCampaign(selectedWebsite.id, item, 'external', positions);
          await MockService.updateExternalLinkDetails(id, { isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId });
          setSiteExternalLinks(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true, mwCampaignId: campaignId, mwTemplateId: templateId } : p));
          setSuccessMessage(`New campaign created with ${positions} positions`);
        } else {
          // Only update status if we reused the existing one
          await MockService.updateExternalLinkDetails(id, { isWorkEnabled: true });
          setSiteExternalLinks(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: true } : p));
        }

      } catch (error: any) {
        console.error(error);
        alert(`Failed to activate campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } else {
      try {
        setLoadingIds(prev => new Set(prev).add(id));

        // Pause the campaign on MW if it's currently running
        if (item.mwCampaignId && isRunning) {
          await MockService.pauseMicroworkersCampaign(item.mwCampaignId);
        }

        await MockService.updateExternalLinkDetails(id, { isWorkEnabled: false });
        setSiteExternalLinks(prev => prev.map(p => p.id === id ? { ...p, isWorkEnabled: false } : p));
        setSuccessMessage(`Campaign paused`);
      } catch (error: any) {
        console.error(error);
        alert(`Failed to pause campaign: ${error.message}`);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const syncRankingsFromGsc = async () => {
    if (!selectedWebsite || !selectedWebsite.gscConnected) {
      alert("Please connect Google Search Console first.");
      return;
    }

    setIsSyncingRankings(true);
    try {
      const { queries, pages } = await MockService.getGscAnalytics(selectedWebsite.id);
      console.log(`[Sync] Found ${pages.length} pages and ${queries.length} queries in GSC`);

      // 1. Update Pages
      const updatedPages = [...sitePages];
      let pageUpdates = 0;
      for (let i = 0; i < updatedPages.length; i++) {
        const p = updatedPages[i];
        // Match by URL
        const gscMatch = pages.find(gp => gp.url.replace(/\/$/, '') === p.url.replace(/\/$/, ''));
        if (gscMatch) {
          const newPos = Math.round(gscMatch.position).toString();
          if (p.pagePosition !== newPos) {
            updatedPages[i] = { ...p, pagePosition: newPos };
            await MockService.updatePageDetails(p.id, { pagePosition: newPos });
            pageUpdates++;
          }
        }
      }
      if (pageUpdates > 0) setSitePages(updatedPages);

      // 2. Update Posts
      const updatedPosts = [...sitePosts];
      let postUpdates = 0;
      for (let i = 0; i < updatedPosts.length; i++) {
        const p = updatedPosts[i];
        const gscMatch = pages.find(gp => gp.url.replace(/\/$/, '') === p.url.replace(/\/$/, ''));
        if (gscMatch) {
          const newPos = Math.round(gscMatch.position).toString();
          if (p.pagePosition !== newPos) {
            updatedPosts[i] = { ...p, pagePosition: newPos };
            await MockService.updatePostDetails(p.id, { pagePosition: newPos });
            postUpdates++;
          }
        }
      }
      if (postUpdates > 0) setSitePosts(updatedPosts);

      setSuccessMessage(`Sync complete: Updated ${pageUpdates} pages and ${postUpdates} posts.`);
    } catch (error: any) {
      console.error("Sync failed:", error);
      alert(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncingRankings(false);
    }
  };

  const handleExternalUpdate = async (id: string, field: keyof ExternalLinkType, value: string | number | boolean) => {
    if (!canEditPages) return;
    await MockService.updateExternalLinkDetails(id, { [field]: value });
    setSiteExternalLinks(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addExternalLink = async () => {
    if (!selectedWebsite || !canEditPages) return;
    const newLink: ExternalLinkType = {
      id: Math.random().toString(36).substr(2, 9),
      websiteId: selectedWebsite.id,
      title: 'New External Campaign',
      keyword: '',
      articleTitle: '',
      landingPageDomain: selectedWebsite.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      isWorkEnabled: false
    };
    await MockService.addExternalLink(newLink);
    setSiteExternalLinks(prev => [...prev, newLink]);
  };

  const deleteExternalLink = async (id: string) => {
    if (!canEditPages || !window.confirm("Delete this external campaign?")) return;
    await MockService.deleteExternalLink(id);
    setSiteExternalLinks(prev => prev.filter(p => p.id !== id));
  };

  // --- Main Render ---

  if (!selectedWebsite) {
    return (
      <div className="p-10 text-center text-gray-500">
        Please select a website from the top right to manage content.
      </div>
    );
  }

  const siteSocials = selectedWebsite.socialLinks || [];

  // Logic for Pages
  const sortedPages = [...sitePages]
    .filter(p => {
      const query = searchQuery.toLowerCase();
      const matchSearch = p.title.toLowerCase().includes(query) ||
        p.url.toLowerCase().includes(query) ||
        (p.keyword || '').toLowerCase().includes(query) ||
        (p.resultText || '').toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchDate = isWithinRange(p.uploadedDate);
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const priorityA = statusSortOrder.indexOf(a.status as any);
      const priorityB = statusSortOrder.indexOf(b.status as any);
      return priorityA - priorityB;
    });

  const totalPagesPages = Math.ceil(sortedPages.length / ITEMS_PER_PAGE);
  const paginatedPages = sortedPages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Logic for Articles (Posts)
  const sortedPosts = [...sitePosts]
    .filter(p => {
      const query = searchQuery.toLowerCase();
      const matchSearch = p.title.toLowerCase().includes(query) ||
        p.url.toLowerCase().includes(query) ||
        (p.searchQuery || '').toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchDate = isWithinRange(p.uploadedDate);
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const priorityA = statusSortOrder.indexOf(a.status as any);
      const priorityB = statusSortOrder.indexOf(b.status as any);
      return priorityA - priorityB;
    });

  const totalPagesPosts = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-6 w-full max-w-[98%] mx-auto relative">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right z-50">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
        {/* Header & Tabs */}
        <div className="border-b border-gray-200 px-6 pt-6 pb-0 bg-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedWebsite.name}</h1>
              <a href={selectedWebsite.url} target="_blank" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                {selectedWebsite.url} <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex space-x-6 overflow-x-auto no-scrollbar">
              {canViewPages && (
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'pages' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Layout size={16} /> Pages ({sitePages.length})
                </button>
              )}
              {canViewPosts && (
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'articles' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <FileText size={16} /> Articles ({sitePosts.length})
                </button>
              )}
              {canViewSocial && (
                <button
                  onClick={() => setActiveTab('social')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'social' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Share2 size={16} /> Social ({siteSocials.length})
                </button>
              )}
              {canViewPages && (
                <button
                  onClick={() => setActiveTab('external')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'external' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Link size={16} /> External ({siteExternalLinks.length})
                </button>
              )}
            </div>

            <div className="pb-3 md:pb-0 flex items-center gap-2">
              {selectedWebsite.gscConnected && (activeTab === 'pages' || activeTab === 'articles') && (
                <button
                  onClick={syncRankingsFromGsc}
                  disabled={isSyncingRankings}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isSyncingRankings ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  title="Auto-fill position column from Google Search Console"
                >
                  {isSyncingRankings ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Auto-fill Pos.
                </button>
              )}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none w-full md:w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-0">

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Page Title & URL</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      <div className="flex flex-col gap-1 items-center">
                        <span>Date</span>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value as any)}
                          className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none font-normal"
                        >
                          <option value="all">All</option>
                          <option value="today">Today</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                          <option value="custom">Range</option>
                        </select>
                        {dateFilter === 'custom' && (
                          <div className="flex flex-col gap-1">
                            <input type="date" value={customRange.from} onChange={e => setCustomRange({ ...customRange, from: e.target.value })} className="text-[10px] scale-90" />
                            <input type="date" value={customRange.to} onChange={e => setCustomRange({ ...customRange, to: e.target.value })} className="text-[10px] scale-90" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Pos.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Search Query</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Result (Text)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex items-center justify-center gap-1 cursor-default">
                          Status
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none font-normal"
                        >
                          <option value="all">Any</option>
                          <option value="ready">Ready</option>
                          <option value="draft">Draft</option>
                          <option value="published">Pub.</option>
                        </select>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Work Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Enable Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPages.map(page => (
                    <tr key={page.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900 mb-1">{page.title}</div>
                        <a href={page.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[300px] flex items-center gap-1">
                          {page.url} <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-gray-500">
                        {page.uploadedDate || '-'}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="w-20 mx-auto">
                          {canEditPages ? (
                            <EditableInput
                              type="text"
                              value={page.pagePosition}
                              onChange={(val) => handlePageUpdate(page.id, 'pagePosition', val)}
                              placeholder="-"
                            />
                          ) : (
                            <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{page.pagePosition || '-'}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {canEditPages ? (
                          <EditableInput
                            value={page.keyword}
                            onChange={(val) => handlePageUpdate(page.id, 'keyword', val)}
                            placeholder="Enter query..."
                          />
                        ) : (
                          <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{page.keyword || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {canEditPages ? (
                          <EditableInput
                            value={page.resultText}
                            onChange={(val) => handlePageUpdate(page.id, 'resultText', val)}
                            placeholder="Enter result text..."
                          />
                        ) : (
                          <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{page.resultText || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${page.status === 'published' ? 'bg-green-100 text-green-800' :
                          page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <input
                          type="number"
                          className="w-16 border-b border-gray-300 text-center bg-transparent focus:outline-none focus:border-accent"
                          value={campaignPositions[page.id] || 30}
                          onChange={(e) => setCampaignPositions(prev => ({ ...prev, [page.id]: parseInt(e.target.value) || 30 }))}
                          disabled={page.isWorkEnabled}
                        />
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button
                          onClick={() => togglePageWork(page.id, page.isWorkEnabled, page)}
                          disabled={loadingIds.has(page.id) || !canEditPages}
                          className={`transition-colors duration-200 ${page.isWorkEnabled ? 'text-accent' : 'text-gray-300'} ${(!canEditPages) ? 'cursor-not-allowed opacity-50' : ''}`}
                          title={(() => {
                            if (!canEditPages) return "Permission Denied";
                            const status = page.mwCampaignId ? campaignStatuses[page.mwCampaignId] : null;
                            if (page.isWorkEnabled) {
                              if (status === 'RUNNING' || status === 'NOK') return "Click to Pause Campaign";
                              if (status === 'FINISHED' || status === 'ENDED') return "Click to Restart Campaign";
                              return "Campaign Active - Click to Pause";
                            } else {
                              if (status === 'FINISHED' || status === 'ENDED') return "Click to Restart Campaign (reuses template)";
                              if (page.mwCampaignId) return "Click to Resume Campaign";
                              return "Click to Start New Campaign";
                            }
                          })()}
                        >
                          {loadingIds.has(page.id) ? (
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                          ) : (
                            page.isWorkEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />
                          )}
                        </button>
                        {page.mwCampaignId && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {getStatusBadge(page.mwCampaignId)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedPages.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 italic">No published pages found.</td></tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesPages}
                onPageChange={setCurrentPage}
                totalItems={sortedPages.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Article Title & URL</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      <div className="flex flex-col gap-1 items-center">
                        <span>Date</span>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value as any)}
                          className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none font-normal"
                        >
                          <option value="all">All</option>
                          <option value="today">Today</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                          <option value="custom">Range</option>
                        </select>
                        {dateFilter === 'custom' && (
                          <div className="flex flex-col gap-1">
                            <input type="date" value={customRange.from} onChange={e => setCustomRange({ ...customRange, from: e.target.value })} className="text-[10px] scale-90" />
                            <input type="date" value={customRange.to} onChange={e => setCustomRange({ ...customRange, to: e.target.value })} className="text-[10px] scale-90" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Pos.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Search Query</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Result (Text)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex items-center justify-center gap-1 cursor-default">
                          Status
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="text-[10px] bg-gray-50 border border-gray-100 rounded p-0.5 outline-none font-normal"
                        >
                          <option value="all">Any</option>
                          <option value="ready">Ready</option>
                          <option value="draft">Draft</option>
                          <option value="published">Pub.</option>
                        </select>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Work Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Enable Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPosts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900 mb-1">{post.title}</div>
                        <a href={post.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[300px] flex items-center gap-1">
                          {post.url} <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-gray-500">
                        {post.uploadedDate || '-'}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="w-20 mx-auto">
                          {canEditPosts ? (
                            <EditableInput
                              type="text"
                              value={post.pagePosition}
                              onChange={(val) => handlePostUpdate(post.id, 'pagePosition', val)}
                              placeholder="-"
                            />
                          ) : (
                            <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{post.pagePosition || '-'}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {canEditPosts ? (
                          <EditableInput
                            value={post.searchQuery}
                            onChange={(val) => handlePostUpdate(post.id, 'searchQuery', val)}
                            placeholder="Enter query..."
                          />
                        ) : (
                          <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{post.searchQuery || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {canEditPosts ? (
                          <EditableInput
                            value={post.resultText}
                            onChange={(val) => handlePostUpdate(post.id, 'resultText', val)}
                            placeholder="Enter result text..."
                          />
                        ) : (
                          <div className="py-1 px-1 text-sm text-gray-600 border-b border-transparent">{post.resultText || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <input
                          type="number"
                          className="w-16 border-b border-gray-300 text-center bg-transparent focus:outline-none focus:border-accent"
                          value={campaignPositions[post.id] || 30}
                          onChange={(e) => setCampaignPositions(prev => ({ ...prev, [post.id]: parseInt(e.target.value) || 30 }))}
                          disabled={post.isWorkEnabled}
                        />
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button
                          onClick={() => togglePostWork(post.id, post.isWorkEnabled, post)}
                          disabled={loadingIds.has(post.id) || !canEditPosts || (post.isWorkEnabled && (campaignStatuses[post.mwCampaignId!] === 'FINISHED' || campaignStatuses[post.mwCampaignId!] === 'ENDED'))}
                          className={`transition-colors duration-200 ${post.isWorkEnabled ? 'text-accent' : 'text-gray-300'} ${(!canEditPosts || (post.isWorkEnabled && (campaignStatuses[post.mwCampaignId!] === 'FINISHED' || campaignStatuses[post.mwCampaignId!] === 'ENDED'))) ? 'cursor-not-allowed opacity-50' : ''}`}
                          title={(campaignStatuses[post.mwCampaignId!] === 'FINISHED' || campaignStatuses[post.mwCampaignId!] === 'ENDED') ? "Campaign Finished" : !canEditPosts ? "Permission Denied" : post.isWorkEnabled ? "Campaign Running" : "Start Campaign"}
                        >
                          {loadingIds.has(post.id) ? (
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                          ) : (
                            post.isWorkEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />
                          )}
                        </button>
                        {post.isWorkEnabled && post.mwCampaignId && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {getStatusBadge(post.mwCampaignId)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedPosts.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 italic">No published articles found.</td></tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesPosts}
                onPageChange={setCurrentPage}
                totalItems={sortedPosts.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/4">Platform</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-1/3">Profile/Post URL</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Work Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Enable Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {siteSocials.filter(s =>
                    s.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.platform.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(social => (
                    <tr key={social.id || social.url} className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          {/* Icon logic simplified */}
                          <Share2 size={16} className="text-blue-500" />
                          <span className="font-medium capitalization">{social.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <a href={social.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          {social.url} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <input
                          type="number"
                          className="w-16 border-b border-gray-300 text-center bg-transparent focus:outline-none focus:border-accent"
                          value={campaignPositions[social.id] || 30}
                          onChange={(e) => setCampaignPositions(prev => ({ ...prev, [social.id]: parseInt(e.target.value) || 30 }))}
                          disabled={social.isWorkEnabled}
                        />
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button
                          onClick={() => social.id && toggleSocialWork(social.id, social.isWorkEnabled)}
                          disabled={loadingIds.has(social.id) || !canEditSocial || (social.isWorkEnabled && (campaignStatuses[social.mwCampaignId!] === 'FINISHED' || campaignStatuses[social.mwCampaignId!] === 'ENDED'))}
                          className={`transition-colors duration-200 ${social.isWorkEnabled ? 'text-accent' : 'text-gray-300'} ${(!canEditSocial || (social.isWorkEnabled && (campaignStatuses[social.mwCampaignId!] === 'FINISHED' || campaignStatuses[social.mwCampaignId!] === 'ENDED'))) ? 'cursor-not-allowed opacity-50' : ''}`}
                          title={(campaignStatuses[social.mwCampaignId!] === 'FINISHED' || campaignStatuses[social.mwCampaignId!] === 'ENDED') ? "Campaign Finished" : !canEditSocial ? "Permission Denied" : ""}
                        >
                          {loadingIds.has(social.id) ? (
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                          ) : (
                            social.isWorkEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />
                          )}
                        </button>
                        {social.isWorkEnabled && social.mwCampaignId && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {getStatusBadge(social.mwCampaignId)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {siteSocials.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-400 italic">No social links configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* External Links Tab */}
          {activeTab === 'external' && (
            <div className="overflow-x-auto">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-end">
                <button
                  onClick={addExternalLink}
                  className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm"
                >
                  <Plus size={16} /> Add External Link
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Campaign Title</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Search Keyword</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Article Title Fragment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Target Domain</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Work Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Enable Work</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {siteExternalLinks.filter(e =>
                    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.articleTitle.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(link => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top">
                        <EditableInput
                          value={link.title}
                          onChange={(val) => handleExternalUpdate(link.id, 'title', val)}
                          placeholder="e.g. Sabeer Nelli Article"
                        />
                      </td>
                      <td className="px-6 py-4 align-top">
                        <EditableInput
                          value={link.keyword}
                          onChange={(val) => handleExternalUpdate(link.id, 'keyword', val)}
                          placeholder="e.g. Sabeer Nelli"
                        />
                      </td>
                      <td className="px-6 py-4 align-top">
                        <EditableInput
                          value={link.articleTitle}
                          onChange={(val) => handleExternalUpdate(link.id, 'articleTitle', val)}
                          placeholder="Fragment to locate..."
                        />
                      </td>
                      <td className="px-6 py-4 align-top">
                        <EditableInput
                          value={link.landingPageDomain}
                          onChange={(val) => handleExternalUpdate(link.id, 'landingPageDomain', val)}
                          placeholder="e.g. onlinecheckwriter.com"
                        />
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <input
                          type="number"
                          className="w-16 border-b border-gray-300 text-center bg-transparent focus:outline-none focus:border-accent"
                          value={campaignPositions[link.id] || 30}
                          onChange={(e) => setCampaignPositions(prev => ({ ...prev, [link.id]: parseInt(e.target.value) || 30 }))}
                          disabled={link.isWorkEnabled}
                        />
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button
                          onClick={() => toggleExternalWork(link.id, link.isWorkEnabled, link)}
                          disabled={loadingIds.has(link.id) || !canEditPages || (link.isWorkEnabled && (campaignStatuses[link.mwCampaignId!] === 'FINISHED' || campaignStatuses[link.mwCampaignId!] === 'ENDED'))}
                          className={`transition-colors duration-200 ${link.isWorkEnabled ? 'text-accent' : 'text-gray-300'} ${(!canEditPages || (link.isWorkEnabled && (campaignStatuses[link.mwCampaignId!] === 'FINISHED' || campaignStatuses[link.mwCampaignId!] === 'ENDED'))) ? 'cursor-not-allowed opacity-50' : ''}`}
                          title={(campaignStatuses[link.mwCampaignId!] === 'FINISHED' || campaignStatuses[link.mwCampaignId!] === 'ENDED') ? "Campaign Finished" : ""}
                        >
                          {loadingIds.has(link.id) ? (
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                          ) : (
                            link.isWorkEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />
                          )}
                        </button>
                        {link.isWorkEnabled && link.mwCampaignId && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {getStatusBadge(link.mwCampaignId)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <button
                          onClick={() => deleteExternalLink(link.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Delete Link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {siteExternalLinks.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 italic">No external link campaigns created.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}