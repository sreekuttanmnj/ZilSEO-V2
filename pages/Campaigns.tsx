import React, { useEffect, useState } from 'react';
import { useWebsite } from '../context/WebsiteContext';
import { useAuth } from '../context/AuthContext';
import { Page, Post, ModuleKey, Template } from '../types';
import { MockService } from '../services/mockService';
import { ExternalLink as LinkIcon, Play, Pause, ToggleLeft, ToggleRight, Loader2, Megaphone, Shield, Code, Eye, Save, ArrowLeft, Wand2 } from 'lucide-react';

export default function Campaigns() {
    const { selectedWebsite } = useWebsite();
    const { checkPermission } = useAuth();

    const canView = checkPermission(ModuleKey.CAMPAIGNS, 'view');
    const canEdit = checkPermission(ModuleKey.CAMPAIGNS, 'edit');

    const [activeTab, setActiveTab] = useState<'active' | 'templates'>('active');
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>({});

    // Template State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // Poll statuses
    useEffect(() => {
        const checkStatuses = async () => {
            if (document.visibilityState !== 'visible') return;

            const itemsWithCampaign = activeCampaigns.filter(c => c.campaignId && c.campaignId !== 'undefined' && c.isWorkEnabled);
            if (itemsWithCampaign.length === 0) return;

            for (const item of itemsWithCampaign) {
                const status = await MockService.getMicroworkersCampaignStatus(item.campaignId);
                if (campaignStatuses[item.campaignId] !== status) {
                    setCampaignStatuses(prev => ({ ...prev, [item.campaignId]: status }));
                }

                // Auto-disable in DB if finished
                if (item.isWorkEnabled && (status === 'FINISHED' || status === 'ENDED')) {
                    if (item.type === 'Page') {
                        await MockService.updatePageDetails(item.id, { isWorkEnabled: false });
                    } else if (item.type === 'Article') {
                        await MockService.updatePostDetails(item.id, { isWorkEnabled: false });
                    } else if (item.type === 'Social') {
                        await MockService.toggleSocialWork(selectedWebsite!.id, item.id, false);
                    }
                    loadCampaigns(); // Trigger refresh of the list
                }
            }
        };

        const hasActiveWork = activeCampaigns.some(c => c.isWorkEnabled);
        if (hasActiveWork) {
            checkStatuses();
            const interval = setInterval(checkStatuses, 60000); // 60s
            return () => clearInterval(interval);
        }
    }, [activeCampaigns]);

    useEffect(() => {
        if (canView) {
            if (activeTab === 'active') {
                loadCampaigns();
            } else {
                loadTemplates();
            }
        }
    }, [selectedWebsite, canView, activeTab]);

    const loadCampaigns = async () => {
        // In a real app, you might have a dedicated endpoint for campaigns.
        // Here we aggregate from pages and posts across the site.
        if (!selectedWebsite) return;

        const pages = await MockService.getPages(selectedWebsite.id);
        const posts = await MockService.getPosts(selectedWebsite.id);

        // Filter for items that have a campaign ID associated
        const campaigns = [
            ...pages.filter(p => p.mwCampaignId).map(p => ({
                id: p.id,
                title: p.title,
                type: 'Page',
                campaignId: p.mwCampaignId,
                isWorkEnabled: p.isWorkEnabled,
                keyword: p.keyword,
                targetUrl: p.url,
                raw: p
            })),
            ...posts.filter(p => p.mwCampaignId).map(p => ({
                id: p.id,
                title: p.title,
                type: 'Article',
                campaignId: p.mwCampaignId,
                isWorkEnabled: p.isWorkEnabled,
                keyword: p.searchQuery,
                targetUrl: p.url,
                raw: p
            })),
            ...(selectedWebsite.socialLinks || []).filter(s => s.mwCampaignId).map(s => ({
                id: s.id,
                title: `${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)} Profile`,
                type: 'Social',
                campaignId: s.mwCampaignId,
                isWorkEnabled: s.isWorkEnabled,
                keyword: s.platform,
                targetUrl: s.url,
                raw: s
            }))
        ];

        setActiveCampaigns(campaigns);
    };

    const loadTemplates = async () => {
        const tpls = await MockService.getTemplates();
        setTemplates(tpls);
    };

    const toggleWork = async (camp: any) => {
        if (!selectedWebsite || !canEdit) return;

        try {
            setLoadingIds(prev => new Set(prev).add(camp.id));

            // Toggle Logic
            const newState = !camp.isWorkEnabled;

            if (camp.type === 'Page') {
                await MockService.updatePageDetails(camp.id, { isWorkEnabled: newState });
            } else if (camp.type === 'Article') {
                await MockService.updatePostDetails(camp.id, { isWorkEnabled: newState });
            } else if (camp.type === 'Social') {
                await MockService.toggleSocialWork(selectedWebsite.id, camp.id, newState);
            }

            // Refresh local list
            await loadCampaigns();

        } catch (error: any) {
            console.error(error);
            alert(`Failed to update campaign: ${error.message}`);
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(camp.id);
                return next;
            });
        }
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate || !canEdit) return;
        try {
            await MockService.updateTemplate(editingTemplate.id, { content: editingTemplate.content });
            alert('Template saved successfully!');
            await loadTemplates();
            setEditingTemplate(null);
        } catch (e: any) {
            console.error(e);
            alert('Failed to save template: ' + e.message);
        }
    };

    if (!canView) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <Shield size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-500">You do not have permission to view campaigns.</p>
            </div>
        );
    }

    if (!selectedWebsite) {
        return (
            <div className="p-10 text-center text-gray-500">
                Please select a website to view campaigns.
            </div>
        );
    }

    // --- TEMPLATE EDITOR VIEW ---
    if (activeTab === 'templates' && editingTemplate) {
        return (
            <div className="p-6 h-full flex flex-col max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setEditingTemplate(null)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Editing: {editingTemplate.name}</h2>
                            <p className="text-xs text-gray-500 font-mono">ID: {editingTemplate.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 mr-2 hidden sm:inline-block">
                            Available Placeholders: {editingTemplate.placeholders.map(p => `\${${p}}`).join(', ')}
                        </span>
                        <button
                            onClick={handleSaveTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
                    {/* Left: Code Editor */}
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Code size={14} /> HTML Instructions Template
                            </div>
                            <button className="text-gray-400 hover:text-blue-600 transition" title="Auto-fill Template">
                                <Wand2 size={14} />
                            </button>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                            value={editingTemplate.content}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                            spellCheck={false}
                        />
                    </div>

                    {/* Right: Preview */}
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <Eye size={14} /> Instructions Preview
                        </div>
                        <div className="flex-1 bg-gray-50 relative">
                            {/* Render inside iframe to isolate styles */}
                            <iframe
                                title="Preview"
                                className="w-full h-full border-none"
                                srcDoc={editingTemplate.content
                                    // Replace placeholders with dummy data for preview
                                    .replace(/\${keyword}/g, '<span style="background:#ffeb3b">TARGET_KEYWORD</span>')
                                    .replace(/\${targetText}/g, 'Example Title Text')
                                    .replace(/\${landingDomain}/g, 'example.com')
                                    .replace(/\${endPage}/g, '2')
                                    .replace(/\${platform}/g, 'Twitter')
                                    .replace(/\${targetUrl}/g, 'https://example.com/post')
                                    .replace(/\${articleTitle}/g, 'Sample Article Title')
                                    .replace(/\${targetDomain}/g, 'example.com')
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
                        {!canEdit && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium">
                                <Shield size={12} /> View-only mode
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Active Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Templates / Instructions
                    </button>
                </div>
            </div>

            {activeTab === 'active' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Source Content</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Target Keyword</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Microworkers Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeCampaigns.map((camp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{camp.title}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="bg-blue-50 text-blue-600 px-1 rounded text-[10px] uppercase">{camp.type}</span>
                                                    <a href={camp.targetUrl} target="_blank" className="hover:underline flex items-center gap-1">
                                                        Link <LinkIcon size={8} />
                                                    </a>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {camp.keyword || <span className="text-gray-400 italic">No keyword</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {camp.isWorkEnabled ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <Play size={10} className="fill-current" /> Running
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Pause size={10} className="fill-current" /> Paused
                                                    </span>
                                                )}
                                                {campaignStatuses[camp.campaignId] && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${campaignStatuses[camp.campaignId] === 'FINISHED' || campaignStatuses[camp.campaignId] === 'ENDED'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {campaignStatuses[camp.campaignId]}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleWork(camp)}
                                                disabled={loadingIds.has(camp.id) || !canEdit || (camp.isWorkEnabled && (campaignStatuses[camp.campaignId] === 'FINISHED' || campaignStatuses[camp.campaignId] === 'ENDED'))}
                                                className={`transition-colors duration-200 ${camp.isWorkEnabled ? 'text-accent' : 'text-gray-300'} ${(!canEdit || (camp.isWorkEnabled && (campaignStatuses[camp.campaignId] === 'FINISHED' || campaignStatuses[camp.campaignId] === 'ENDED'))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={!canEdit ? "Permission Denied" : (camp.isWorkEnabled && (campaignStatuses[camp.campaignId] === 'FINISHED' || campaignStatuses[camp.campaignId] === 'ENDED')) ? "Campaign Finished" : camp.isWorkEnabled ? "Pause Campaign" : "Resume Campaign"}
                                            >
                                                {loadingIds.has(camp.id) ? (
                                                    <Loader2 size={32} className="animate-spin text-gray-400" />
                                                ) : (
                                                    camp.isWorkEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeCampaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-400 italic">
                                            No active campaigns. Go to the "Pages" or "Articles" to start a new one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(tpl => (
                        <div key={tpl.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{tpl.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs uppercase font-semibold">
                                    {tpl.type.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                Customize instructions for this campaign type. Uses placeholders like {tpl.placeholders.slice(0, 2).map(p => `\${${p}}`).join(', ')}...
                            </p>
                            <button
                                onClick={() => setEditingTemplate(tpl)}
                                disabled={!canEdit}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors disabled:opacity-50"
                            >
                                <Code size={16} /> Edit & Preview
                            </button>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-400 italic">
                            No templates found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}