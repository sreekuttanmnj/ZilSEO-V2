import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { ModuleKey, KeywordRanking, KeywordTarget, GscDailyMetric, GscQueryData, GscPageData } from '../types';
import { MockService } from '../services/mockService';
import {
  Plus, TrendingUp, Search, Layers, FileText, CheckCircle, Mail,
  LogOut, Loader2, ShieldCheck, TrendingDown, ArrowUp, ArrowDown,
  BarChart2, Filter, Download, RefreshCcw, Calendar, Key, AlertTriangle, ExternalLink, Trash2
} from 'lucide-react';

// Declare Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

type GscViewMode = 'queries' | 'pages' | 'opportunities' | 'losers';

// Configuration from user request
const GOOGLE_CLIENT_ID = '942118569270-m4g4ve0m8msgavauhfkpgdcq76tch116.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export default function Tracking() {
  const { checkPermission } = useAuth();
  const { selectedWebsite, refreshWebsites } = useWebsite();

  const [targets, setTargets] = useState<KeywordTarget[]>([]);
  const [rankings, setRankings] = useState<KeywordRanking[]>([]);

  // GSC Data State
  const [gscMetrics, setGscMetrics] = useState<GscDailyMetric[]>([]);
  const [gscQueries, setGscQueries] = useState<GscQueryData[]>([]);
  const [gscPages, setGscPages] = useState<GscPageData[]>([]);
  const [gscViewMode, setGscViewMode] = useState<GscViewMode>('queries');
  const [isLoadingGsc, setIsLoadingGsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // GSC UI State
  const [isGscModalOpen, setIsGscModalOpen] = useState(false);
  const [isConnectingGsc, setIsConnectingGsc] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'clicks', direction: 'desc' });
  const [authError, setAuthError] = useState<string | null>(null);

  // Manual Input State
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  // New Keyword State
  const [newKeyword, setNewKeyword] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);

  const canEdit = checkPermission(ModuleKey.SEO_TRACKING, 'edit');
  const canConnectGsc = checkPermission(ModuleKey.GSC_CONNECTION, 'edit');

  useEffect(() => {
    if (selectedWebsite) {
      loadData();
      if (selectedWebsite.gscConnected) {
        loadGscData(selectedWebsite.id);
      } else {
        setGscMetrics([]);
        setGscQueries([]);
        setGscPages([]);
        setDataError(null);
      }
    }
  }, [selectedWebsite]);

  const loadData = async () => {
    if (!selectedWebsite) return;
    const { targets: t, rankings: r } = await MockService.getTrackingData(selectedWebsite.id);
    setTargets(t);
    setRankings(r);
  };

  const loadGscData = async (websiteId: string) => {
    setIsLoadingGsc(true);
    setDataError(null);
    try {
      const data = await MockService.getGscAnalytics(websiteId);
      setGscMetrics(data.metrics);
      setGscQueries(data.queries);
      setGscPages(data.pages);
    } catch (err: any) {
      console.error("GSC Load Error:", err);
      // Check for 401 Unauthorized
      if (err.message && (err.message.includes('401') || err.message.includes('UNAUTHENTICATED'))) {
        setDataError("Authentication failed. Your access token may have expired or is invalid. Please disconnect and reconnect.");
      } else {
        setDataError("Failed to load data from Google Search Console. Ensure the website URL matches the GSC property.");
      }
      setGscMetrics([]);
      setGscQueries([]);
      setGscPages([]);
    } finally {
      setIsLoadingGsc(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedWebsite?.gscConnected) return;

    setIsRefreshing(true);
    try {
      await MockService.refreshGscData(selectedWebsite.id);
      await refreshWebsites();
      await loadGscData(selectedWebsite.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const authUrl = await MockService.getGscAuthUrl(selectedWebsite?.id);
      // Redirect current window to Google Auth
      window.location.href = authUrl;
    } catch (err: any) {
      console.error(err);
      setAuthError("Failed to initialize Google Sign-In. Try Manual Entry.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsite) return;

    setIsConnectingGsc(true);
    try {
      await MockService.connectGSC(
        selectedWebsite.id,
        manualEmail,
        manualToken
      );
      await refreshWebsites();
      setIsGscModalOpen(false);
      // Reset
      setManualToken('');
      setShowManualInput(false);
    } catch (err) {
      console.error(err);
      setAuthError("Invalid token or connection failed.");
    } finally {
      setIsConnectingGsc(false);
    }
  };

  const handleDisconnectGSC = async () => {
    if (!selectedWebsite) return;
    if (confirm('Are you sure you want to disconnect Google Search Console?')) {
      await MockService.disconnectGSC(selectedWebsite.id);
      await refreshWebsites();
      setDataError(null);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsite || !newKeyword) return;

    setIsAddingKeyword(true);
    try {
      const target: KeywordTarget = {
        id: Math.random().toString(36).substr(2, 9),
        websiteId: selectedWebsite.id,
        keyword: newKeyword,
        targetUrl: newTargetUrl || selectedWebsite.url,
        tags: []
      };
      await MockService.addTrackingTarget(target);
      setNewKeyword('');
      setNewTargetUrl('');
      loadData();
    } finally {
      setIsAddingKeyword(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('Delete this tracking keyword?')) return;
    await MockService.deleteTrackingTarget(id);
    loadData();
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredGscData = useMemo(() => {
    let data: any[] = [];

    if (gscViewMode === 'queries') {
      data = [...gscQueries];
    } else if (gscViewMode === 'pages') {
      data = [...gscPages];
    } else if (gscViewMode === 'opportunities') {
      data = gscQueries.filter(q => q.impressions > 1000 && (q.position > 10 || q.ctr < 2));
    } else if (gscViewMode === 'losers') {
      data = [...gscQueries, ...gscPages].filter(item => (item.positionChange || 0) < 0) as any[];
    }

    return data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [gscQueries, gscPages, gscViewMode, sortConfig]);

  // --- Enhanced Chart Component (With Grids) ---
  const Chart = ({ data }: { data: GscDailyMetric[] }) => {
    if (!data.length) return null;

    const height = 250;
    const width = 1000;
    const padding = 40;

    const maxClicks = Math.max(...data.map(d => d.clicks), 1) * 1.1;
    const maxImp = Math.max(...data.map(d => d.impressions), 1) * 1.1;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const getY = (val: number, max: number) => height - padding - (val / max) * (height - 2 * padding);

    const pointsClicks = data.map((d, i) => `${getX(i)},${getY(d.clicks, maxClicks)}`).join(' ');
    const pointsImp = data.map((d, i) => `${getX(i)},${getY(d.impressions, maxImp)}`).join(' ');

    // Generate Grid Lines
    const gridLinesX = [];
    const gridLinesY = [];
    const numY = 5;

    // Vertical Grids (Every 5th point)
    for (let i = 0; i < data.length; i += 5) {
      const x = getX(i);
      gridLinesX.push(
        <g key={`x-${i}`}>
          <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
          <text x={x} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#9ca3af">{data[i].date.split(',')[0]}</text>
        </g>
      );
    }

    // Horizontal Grids
    for (let i = 0; i <= numY; i++) {
      const y = padding + (i / numY) * (height - 2 * padding);
      const valClicks = Math.round(maxClicks - (i / numY) * maxClicks);
      gridLinesY.push(
        <g key={`y-${i}`}>
          <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
          <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{valClicks}</text>
        </g>
      );
    }

    return (
      <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 relative">
        <div className="absolute top-4 left-16 flex items-center gap-4 text-xs font-semibold z-10">
          <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Clicks</span>
          <span className="flex items-center gap-1 text-purple-400"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Impressions</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {gridLinesX}
          {gridLinesY}

          {/* Impressions Line */}
          <polyline points={pointsImp} fill="none" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.5" />

          {/* Clicks Line */}
          <polyline points={pointsClicks} fill="none" stroke="#3b82f6" strokeWidth="3" />

          {/* Dots for Clicks */}
          {data.map((d, i) => (
            <circle key={i} cx={getX(i)} cy={getY(d.clicks, maxClicks)} r="3" fill="white" stroke="#3b82f6" strokeWidth="2" className="hover:r-5 transition-all" />
          ))}
        </svg>
      </div>
    );
  };

  const OverviewCards = () => {
    if (!gscMetrics.length) {
      if (dataError) return null;
      return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg mb-6">No data available. Please verify your connection or refresh.</div>;
    }

    const totalClicks = gscMetrics.reduce((sum, d) => sum + d.clicks, 0);
    const totalImp = gscMetrics.reduce((sum, d) => sum + d.impressions, 0);
    const avgCtr = (totalClicks / totalImp) * 100 || 0;
    const avgPos = gscMetrics.reduce((sum, d) => sum + d.position, 0) / gscMetrics.length || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Impressions</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalImp.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Average CTR</p>
          <h3 className="text-2xl font-bold text-gray-900">{avgCtr.toFixed(1)}%</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Average Position</p>
          <h3 className="text-2xl font-bold text-gray-900">{avgPos.toFixed(1)}</h3>
        </div>
      </div>
    );
  };

  if (!selectedWebsite) {
    return <div className="p-10 text-center text-gray-500">Please select a website to view tracking data.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Performance</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {selectedWebsite.name}
            {selectedWebsite.gscConnected && (
              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-200">
                <ShieldCheck size={12} /> Google Search Console Connected
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedWebsite.gscConnected ? (
            <>
              <div className="flex items-center gap-3 bg-white border border-green-200 px-3 py-1.5 rounded-lg shadow-sm">
                <div className="text-xs">
                  <span className="block text-gray-400 font-medium uppercase tracking-wider text-[10px]">Connected As</span>
                  <span className="font-semibold text-gray-800">{selectedWebsite.gscEmail}</span>
                </div>
                {canConnectGsc && (
                  <button
                    onClick={handleDisconnectGSC}
                    className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-md transition"
                    title="Disconnect"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm font-medium transition disabled:opacity-70"
                  title="Refresh Data"
                >
                  <RefreshCcw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              )}
            </>
          ) : (
            canConnectGsc && (
              <button
                onClick={() => setIsGscModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium transition"
              >
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                Connect Search Console
              </button>
            )
          )}
        </div>
      </div>

      {/* Last Updated Indicator */}
      {selectedWebsite.gscConnected && selectedWebsite.lastScraped && (
        <div className="flex items-center justify-end text-xs text-gray-400 mb-4 gap-1">
          <Calendar size={12} /> Last synced: {new Date(selectedWebsite.lastScraped).toLocaleString()}
        </div>
      )}

      {!selectedWebsite.gscConnected ? (
        // Non-Connected View
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center text-center">
          <BarChart2 size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connect Google Search Console</h2>
          <p className="text-gray-500 max-w-md mb-8">
            Connect your Google account to view real clicks, impressions, and position data directly from Search Console.
          </p>
          {canConnectGsc && (
            <button
              onClick={() => setIsGscModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition"
            >
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 bg-white rounded-full border border-white" />
              Sync Data Now
            </button>
          )}
        </div>
      ) : (
        // Connected Dashboard View
        isLoadingGsc ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-gray-500">Fetching real data from Google...</p>
          </div>
        ) : dataError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-red-700 mb-2">Connection Issue</h3>
            <p className="text-red-600 max-w-lg mb-6">{dataError}</p>
            <div className="flex gap-4">
              <button
                onClick={handleDisconnectGSC}
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Disconnect & Reconnect
              </button>
              <button
                onClick={handleRefresh}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OverviewCards />
            <Chart data={gscMetrics} />

            {/* Data Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 flex justify-between items-center bg-gray-50">
                <div className="flex space-x-6 overflow-x-auto">
                  {[
                    { id: 'queries', label: 'Top Queries', icon: Search },
                    { id: 'pages', label: 'Top Pages', icon: FileText },
                    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
                    { id: 'losers', label: 'Rank Dropped', icon: TrendingDown },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGscViewMode(tab.id as GscViewMode)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition ${gscViewMode === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-2">
                  <Download size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 w-1/3">
                        {gscViewMode === 'pages' ? 'Page URL' : 'Search Query'}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('clicks')}>
                        <div className="flex items-center gap-1">Clicks {sortConfig.key === 'clicks' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('impressions')}>
                        <div className="flex items-center gap-1">Impressions {sortConfig.key === 'impressions' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('ctr')}>
                        <div className="flex items-center gap-1">CTR {sortConfig.key === 'ctr' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('position')}>
                        <div className="flex items-center gap-1">Position {sortConfig.key === 'position' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGscData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-xs" title={row.query || row.url}>
                            {row.query || row.url}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{row.clicks.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{row.impressions.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{row.ctr.toFixed(2)}%</td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${row.position < 3 ? 'text-green-600' : 'text-gray-800'}`}>
                              {row.position.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredGscData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                          No data matches current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Keyword Tracker */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" />
                  <h2 className="font-bold text-gray-800">Tracked Keywords</h2>
                </div>
                {canEdit && (
                  <form onSubmit={handleAddKeyword} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter keyword..."
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-100 outline-none"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Specific URL (optional)"
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-100 outline-none w-48"
                      value={newTargetUrl}
                      onChange={(e) => setNewTargetUrl(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isAddingKeyword}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {isAddingKeyword ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                      Track
                    </button>
                  </form>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Keyword</th>
                      <th className="px-6 py-3">Current Position</th>
                      <th className="px-6 py-3">Best Position</th>
                      <th className="px-6 py-3">History</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {targets.map(target => {
                      const targetRankings = rankings.filter(r => r.targetId === target.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const current = targetRankings[0];
                      const best = [...targetRankings].sort((a, b) => a.position - b.position)[0];

                      return (
                        <tr key={target.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{target.keyword}</div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{target.targetUrl}</div>
                          </td>
                          <td className="px-6 py-4">
                            {current ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${current.position <= 10 ? 'text-green-600' : 'text-gray-700'}`}>
                                  #{current.position}
                                </span>
                                {targetRankings.length > 1 && (
                                  <span className={`text-xs ${current.position < targetRankings[1].position ? 'text-green-500' : 'text-red-500'}`}>
                                    {current.position < targetRankings[1].position ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />}
                                    {Math.abs(current.position - targetRankings[1].position)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-sm italic">Never checked</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {best ? (
                              <span className="text-sm text-gray-500 font-medium">#{best.position}</span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 h-12 w-32">
                            {/* Simple Sparkline representation */}
                            <div className="flex items-end gap-0.5 h-full">
                              {[...targetRankings].reverse().slice(-10).map((r, i) => (
                                <div
                                  key={i}
                                  className="bg-blue-100 hover:bg-blue-200 transition-colors w-1.5"
                                  style={{ height: `${Math.max(100 - r.position, 5)}%` }}
                                  title={`Pos: ${r.position} on ${r.date}`}
                                ></div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canEdit && (
                              <button
                                onClick={() => handleDeleteKeyword(target.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {targets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                          No keywords being tracked yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* GSC Connect Modal */}
      {isGscModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Connect Google Search Console</h2>
              <p className="text-center text-gray-500 mb-6 text-sm">
                Authorize access to your Search Console data.
              </p>

              {authError && (
                <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded flex items-center gap-2">
                  <AlertTriangle size={16} /> {authError}
                </div>
              )}

              {!showManualInput ? (
                <>
                  <div className="flex gap-3 mb-4 mt-6">
                    <button
                      onClick={() => setIsGscModalOpen(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isConnectingGsc}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
                    >
                      {isConnectingGsc ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 bg-white rounded-full border border-white" />
                          Sign in
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Having trouble? Enter Access Token manually
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleManualSubmit}>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Access Token</label>
                    <input
                      type="password"
                      required
                      placeholder="ya29..."
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                    />
                    <div className="mt-2 text-[10px] text-gray-400">
                      Generate a token at <a href="https://developers.google.com/oauthplayground" target="_blank" className="text-blue-500 underline">OAuth Playground</a>.
                      <br />
                      Scope: <code>https://www.googleapis.com/auth/webmasters.readonly</code>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowManualInput(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isConnectingGsc}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      {isConnectingGsc ? <Loader2 className="animate-spin" size={16} /> : 'Connect Manually'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
