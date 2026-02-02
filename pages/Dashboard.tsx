import React, { useEffect, useState } from 'react';
import { useWebsite } from '../context/WebsiteContext';
import { MockService } from '../services/mockService';
import { GscDailyMetric, GscQueryData } from '../types';
import { TrendingUp, TrendingDown, Users, Target, MousePointer2, BarChart3, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { selectedWebsite } = useWebsite();
    const [metrics, setMetrics] = useState<GscDailyMetric[]>([]);
    const [queries, setQueries] = useState<GscQueryData[]>([]);
    const [loading, setLoading] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);

    useEffect(() => {
        if (selectedWebsite) {
            loadDashboardData();
        }
    }, [selectedWebsite]);

    const loadDashboardData = async () => {
        if (!selectedWebsite) return;
        setLoading(true);
        try {
            // Load global work tasks to check for pending ones
            const allTasks = await MockService.getWorkItems();
            setPendingTasksCount(allTasks.filter(t => t.status === 'completed').length);

            if (selectedWebsite) {
                // Load content stats
                const sitePages = await MockService.getPages(selectedWebsite.id);
                const sitePosts = await MockService.getPosts(selectedWebsite.id);
                setPages(sitePages);
                setPosts(sitePosts);

                // Load GSC data if connected
                if (selectedWebsite.gscConnected) {
                    const data = await MockService.getGscAnalytics(selectedWebsite.id);
                    setMetrics(data.metrics);
                    setQueries(data.queries);
                }
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSum = (key: keyof GscDailyMetric) => {
        return metrics.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
    };

    const currentClicks = getSum('clicks');
    const currentImpressions = getSum('impressions');
    const avgPos = metrics.length ? (metrics.reduce((acc, m) => acc + m.position, 0) / metrics.length).toFixed(1) : '-';

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of {selectedWebsite?.name || 'your projects'}' performance.</p>
                </div>

                {pendingTasksCount > 0 && (
                    <a
                        href="/work"
                        className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl animate-pulse hover:bg-red-100 transition-colors"
                    >
                        <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                            <Target size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-red-600 uppercase">Action Required</div>
                            <div className="text-sm font-bold text-gray-900">{pendingTasksCount} Tasks to Verify</div>
                        </div>
                    </a>
                )}
            </div>

            {/* Content Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Total Pages</div>
                    <div className="text-3xl font-bold text-gray-900">{pages.length}</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">{pages.filter(p => p.status === 'published').length} Published</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Landing Pages</div>
                    <div className="text-3xl font-bold text-gray-900">{pages.filter(p => p.category === 'Landing page').length}</div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Conversion Focus</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Blog Posts</div>
                    <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
                    <div className="text-xs text-purple-600 mt-1 font-medium">{posts.filter(p => p.status === 'published').length} Published</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Drafts</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {pages.filter(p => p.status === 'draft').length + posts.filter(p => p.status === 'draft').length}
                    </div>
                    <div className="text-xs text-orange-500 mt-1 font-medium">Need Review</div>
                </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" /> SEO Performance
            </h2>

            {!selectedWebsite?.gscConnected ? (
                <div className="bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 p-8 text-center">
                    <div className="w-12 h-12 bg-white text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="text-md font-bold text-gray-900 mb-1">Connect Search Console</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                        Link your Google Search Console account to see real-time clicks, impressions, and ranking data here.
                    </p>
                    <a
                        href="/tracking"
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
                    >
                        Go to Tracking
                    </a>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-sm">Syncing GSC data...</p>
                </div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MousePointer2 size={24} />
                                </div>
                                <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={14} /> +12%
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Clicks</h3>
                            <p className="text-2xl font-bold text-gray-900">{currentClicks.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={14} /> +8%
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Impressions</h3>
                            <p className="text-2xl font-bold text-gray-900">{currentImpressions.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Target size={24} />
                                </div>
                                <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                                    <TrendingDown size={14} /> -0.2
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Avg. Position</h3>
                            <p className="text-2xl font-bold text-gray-900">{avgPos}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Queries Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-bottom border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Top Performing Keywords</h3>
                                <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">View All</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/50 border-b border-gray-100">
                                            <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-[10px]">Query</th>
                                            <th className="text-right px-5 py-3 font-semibold text-gray-500 uppercase text-[10px]">Clicks</th>
                                            <th className="text-right px-5 py-3 font-semibold text-gray-500 uppercase text-[10px]">Pos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {queries.slice(0, 8).map((q, i) => (
                                            <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3 font-medium text-gray-700 truncate max-w-[200px]">{q.query}</td>
                                                <td className="px-5 py-3 text-right text-gray-600">{q.clicks.toLocaleString()}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className={`${q.position <= 3 ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'} px-2 py-0.5 rounded text-[11px] font-bold`}>
                                                        {q.position.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Placeholder for Performance Chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <BarChart3 className="text-gray-300" size={32} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">Weekly Visibility Trend</h4>
                            <p className="text-xs text-gray-400 mb-6">Historical ranking performance visualizations coming soon.</p>

                            <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-full h-8 bg-white rounded border border-gray-100 flex items-center px-3">
                                            <div className={`h-2 rounded bg-blue-${i * 100 + 300} opacity-50`} style={{ width: `${90 - (i * 15)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
