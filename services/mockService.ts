/// <reference types="vite/client" />
import { User, Website, KeywordTarget, KeywordRanking, Page, Post, WorkItem, ModuleKey, Permission, GscDailyMetric, GscQueryData, GscPageData, SocialLink, ExternalLink, Template } from '../types';
import { MwTemplates } from './mwTemplates';
import { SupabaseService } from './supabaseService';
import { supabase } from './supabaseClient';

// Initial Data Seeding
export const DEFAULT_PERMISSIONS: Permission[] = [
  { module: ModuleKey.WEBSITES, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.GSC_CONNECTION, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.SEO_TRACKING, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.PAGES, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.POSTS, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.SOCIAL, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.CAMPAIGNS, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.WORK, canView: true, canEdit: true, canDelete: false },
  { module: ModuleKey.ADMIN, canView: false, canEdit: false, canDelete: false },
];

export const ADMIN_PERMISSIONS: Permission[] = [
  { module: ModuleKey.WEBSITES, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.GSC_CONNECTION, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.SEO_TRACKING, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.PAGES, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.POSTS, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.SOCIAL, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.CAMPAIGNS, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.WORK, canView: true, canEdit: true, canDelete: true },
  { module: ModuleKey.ADMIN, canView: true, canEdit: true, canDelete: true },
];

const STORAGE_KEYS = {
  USERS: 'zilseo_data_users',
  WEBSITES: 'zilseo_data_websites',
  PAGES: 'zilseo_data_pages',
  POSTS: 'zilseo_data_posts',
  TARGETS: 'zilseo_data_targets',
  RANKINGS: 'zilseo_data_rankings',
  WORK: 'zilseo_data_work',
  EXTERNAL_LINKS: 'zilseo_data_external_links',
  TEMPLATES: 'zilseo_data_templates'
};

const loadData = <T>(key: string, defaultData: T): T => {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to parse stored data for ${key}`, e);
    }
  }
  return defaultData;
};

const saveData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ADMIN_PERMISSIONS,
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    permissions: DEFAULT_PERMISSIONS,
  }
];
const INITIAL_MOCK_USERS: User[] = loadData(STORAGE_KEYS.USERS, DEFAULT_USERS);

// Migration: Ensure all users have all permissions for newly added modules
const allModules = Object.values(ModuleKey);
INITIAL_MOCK_USERS.forEach(user => {
  const userModules = user.permissions.map(p => p.module);
  allModules.forEach(mod => {
    if (!userModules.includes(mod)) {
      // Default new modules to true for admin, false for regular users
      const isAdmin = user.role === 'admin';
      user.permissions.push({
        module: mod,
        canView: isAdmin,
        canEdit: isAdmin,
        canDelete: isAdmin
      });
    }
  });
});
saveData(STORAGE_KEYS.USERS, INITIAL_MOCK_USERS);

const MOCK_USERS: User[] = INITIAL_MOCK_USERS;

// --- Backend Proxy URL & API Key Configuration ---
const getInitialBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';

  // 1. Try Local Storage
  const stored = localStorage.getItem('zilseo_api_url');
  if (stored) return stored.replace(/\/$/, '');

  // 2. Environment logic
  const hostname = window.location.hostname;

  // If running locally
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // If running in a sandbox (HTTPS), we cannot default to http://localhost:3001 due to Mixed Content
  return '';
};

let BACKEND_URL = getInitialBackendUrl();
let MW_API_KEY = typeof window !== 'undefined' ? localStorage.getItem('mw_api_key') || '' : '';

const DEFAULT_WEBSITES: Website[] = [
  {
    id: 'w1',
    name: 'OCW',
    url: 'https://onlinecheckwriter.com/',
    category: 'Fintech',
    notes: 'All-in-one payments platform for businesses.',
    status: 'active',
    gscConnected: false,
    socialLinks: [
      { id: 's1', platform: 'facebook', url: 'https://www.facebook.com/OnlineCheckWriter', isWorkEnabled: false, uploadedDate: '2023-10-01' },
      { id: 's2', platform: 'twitter', url: 'https://twitter.com/OnlineCheckWrit', isWorkEnabled: false, uploadedDate: '2023-10-05' },
      { id: 's3', platform: 'linkedin', url: 'https://www.linkedin.com/company/onlinecheckwriter', isWorkEnabled: false, uploadedDate: '2023-10-10' },
      { id: 's4', platform: 'youtube', url: 'https://www.youtube.com/channel/UC-T8k8k', isWorkEnabled: false, uploadedDate: '2023-10-15' }
    ]
  }
];
const MOCK_WEBSITES: Website[] = loadData(STORAGE_KEYS.WEBSITES, DEFAULT_WEBSITES);

const DEFAULT_PAGES: Page[] = [
  {
    id: 'p1',
    websiteId: 'w1',
    url: 'https://onlinecheckwriter.com/',
    title: 'Online Check Writer: #1 Check Printing Software',
    status: 'published',
    keyword: 'online check writer',
    pagePosition: "1",
    resultText: 'Print Checks Instantly',
    metaTitle: 'Online Check Writer - Print Checks Online Instantly',
    metaDescription: 'Best check printing software. Print checks on blank stock paper instantly. ACH, Payroll, and more.',
    isWorkEnabled: false,
    mwCampaignId: undefined, // Reset
    faqs: [
      { id: 'f1', question: 'Is Online Check Writer free?', answer: 'We offer a 15-day free trial.' },
      { id: 'f2', question: 'Can I print checks on blank paper?', answer: 'Yes, you can print on blank stock paper using any printer.' }
    ],
    content: [
      'Online Check Writer is the best check printing software in the market.',
      'It allows you to print checks instantly on blank stock paper using any printer.',
      'We also support ACH payments, payroll management, and more.'
    ],
    links: [
      { id: 'l1', anchorText: 'Features', url: 'https://onlinecheckwriter.com/features', type: 'internal', status: 'ok' }
    ],
    uploadedDate: '2023-09-01'
  },
  {
    id: 'p2',
    websiteId: 'w1',
    url: 'https://onlinecheckwriter.com/pricing',
    title: 'Pricing Plans',
    status: 'published',
    keyword: 'check printing pricing',
    pagePosition: "2",
    resultText: 'Affordable Plans',
    metaTitle: 'Pricing - Online Check Writer',
    metaDescription: 'Check out our affordable pricing plans for businesses of all sizes.',
    isWorkEnabled: false,
    faqs: [],
    content: ['Choose the plan that fits your business needs. No hidden fees.'],
    links: [],
    uploadedDate: '2023-09-05'
  },
  {
    id: 'p3',
    websiteId: 'w1',
    url: 'https://onlinecheckwriter.com/features',
    title: 'Features',
    status: 'published',
    keyword: 'check software features',
    pagePosition: "3",
    resultText: 'All-in-one Payments',
    metaTitle: 'Features - ACH, Wire, Checks',
    metaDescription: 'Explore our wide range of payment features.',
    isWorkEnabled: false,
    faqs: [],
    content: ['From check printing to digital wallets, we have it all.'],
    links: [],
    uploadedDate: '2023-09-10'
  }
];
const MOCK_PAGES: Page[] = loadData(STORAGE_KEYS.PAGES, DEFAULT_PAGES);

const DEFAULT_POSTS: Post[] = [
  {
    id: 'post1',
    websiteId: 'w1',
    title: 'How to Print Checks at Home',
    url: 'https://onlinecheckwriter.com/blog/print-checks-at-home',
    keywords: ['print checks at home', 'check printing'],
    searchQuery: 'how to print checks',
    status: 'published',
    publishDate: '2023-11-10',
    uploadedDate: '2023-11-10',
    pagePosition: "3",
    resultText: 'Guide to Printing Checks',
    isWorkEnabled: false,
    mwCampaignId: undefined, // Reset
    metaTitle: 'How to Print Checks at Home Easily',
    metaDescription: 'Learn how to print valid checks from the comfort of your home.',
    faqs: [
      { id: 'pf1', question: 'Do I need special ink?', answer: 'No, standard ink works for most banks.' }
    ],
    content: [
      'Printing checks at home is easier than you think.',
      'All you need is a printer and blank stock paper.',
      'Follow this guide to get started in minutes.'
    ]
  },
  {
    id: 'post2',
    websiteId: 'w1',
    title: 'ACH vs Wire Transfer: What is the Difference?',
    url: 'https://onlinecheckwriter.com/blog/ach-vs-wire',
    keywords: ['ach vs wire', 'payment methods'],
    searchQuery: 'ach vs wire',
    status: 'draft',
    publishDate: '',
    uploadedDate: '2023-12-01',
    pagePosition: "0",
    resultText: '',
    isWorkEnabled: false,
    metaTitle: '',
    metaDescription: '',
    faqs: [],
    content: []
  }
];
const MOCK_POSTS: Post[] = loadData(STORAGE_KEYS.POSTS, DEFAULT_POSTS);

const DEFAULT_TARGETS: KeywordTarget[] = [
  {
    id: 't1',
    websiteId: 'w1',
    keyword: 'print checks online',
    targetUrl: 'https://onlinecheckwriter.com/',
    tags: ['commercial', 'priority']
  },
  {
    id: 't2',
    websiteId: 'w1',
    keyword: 'check printing software',
    targetUrl: 'https://onlinecheckwriter.com/',
    tags: ['commercial']
  }
];
const MOCK_TARGETS: KeywordTarget[] = loadData(STORAGE_KEYS.TARGETS, DEFAULT_TARGETS);

const DEFAULT_RANKINGS: KeywordRanking[] = [
  {
    id: 'r1',
    targetId: 't1',
    date: new Date().toISOString(),
    position: 1,
    searchQuery: 'print checks online',
    pagePosition: 1,
    pagesAvailable: 1500000
  },
  {
    id: 'r2',
    targetId: 't2',
    date: new Date().toISOString(),
    position: 3,
    searchQuery: 'best check printing software',
    pagePosition: 1,
    pagesAvailable: 500000
  }
];
const MOCK_RANKINGS: KeywordRanking[] = loadData(STORAGE_KEYS.RANKINGS, DEFAULT_RANKINGS);

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl_search_visit',
    name: 'Google: Search + Visit + Share',
    type: 'search_post',
    content: MwTemplates.getSearchPostTemplate('${keyword}', '${targetText}', '${landingDomain}'),
    placeholders: ['keyword', 'targetText', 'landingDomain', 'endPage']
  },
  {
    id: 'tpl_social_engage',
    name: 'Social Media Engagement',
    type: 'social_engagement',
    content: MwTemplates.getSocialEngagementTemplate('${platform}', '${targetUrl}'),
    placeholders: ['platform', 'targetUrl']
  },
  {
    id: 'tpl_external_link',
    name: 'External Link Hunt',
    type: 'external_link',
    content: MwTemplates.getExternalLinkTemplate('${keyword}', '${articleTitle}', '${targetDomain}'),
    placeholders: ['keyword', 'articleTitle', 'targetDomain']
  }
];
const MOCK_TEMPLATES: Template[] = loadData(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);

const DEFAULT_WORK: WorkItem[] = [
  {
    id: 'wk1',
    title: 'Optimize Homepage Meta',
    description: 'Update meta description to include "ACH payments" and "Payroll"',
    assignedToUserId: '2',
    dueDate: '2023-12-01',
    status: 'todo',
    priority: 'high',
    websiteId: 'w1'
  },
  {
    id: 'wk2',
    title: 'Post on Facebook',
    description: 'Share the latest blog post on the official Facebook page.',
    assignedToUserId: 'worker_1',
    dueDate: '2023-12-25',
    status: 'completed',
    priority: 'medium',
    websiteId: 'w1',
    proofLink: 'https://www.facebook.com/OnlineCheckWriter/posts/123456789',
    workerId: 'MW_9921'
  },
  {
    id: 'wk3',
    title: 'Search and Click: "print checks online"',
    description: 'Search for "print checks online" on Google, find OnlineCheckWriter.com, and stay for 2 minutes.',
    assignedToUserId: 'worker_2',
    dueDate: '2023-12-26',
    status: 'completed',
    priority: 'high',
    websiteId: 'w1',
    proofLink: 'https://imgur.com/gallery/screenshot-proof-123',
    workerId: 'MW_8812'
  }
];
const MOCK_WORK: WorkItem[] = loadData(STORAGE_KEYS.WORK, DEFAULT_WORK);

const DEFAULT_EXTERNAL_LINKS: ExternalLink[] = [
  {
    id: 'ex1',
    websiteId: 'w1',
    title: 'Sabeer Nelli Article Campaign',
    keyword: 'Sabeer Nelli',
    articleTitle: 'The Human Advantage: How Sabeer Nelli Made Real ...',
    landingPageDomain: 'onlinecheckwriter.com',
    isWorkEnabled: false
  }
];
const MOCK_EXTERNAL_LINKS: ExternalLink[] = loadData(STORAGE_KEYS.EXTERNAL_LINKS, DEFAULT_EXTERNAL_LINKS);

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper for fetch with better error handling
const fetchWithNetworkCheck = async (url: string, options?: RequestInit) => {
  // Validate Backend Configuration
  if (!BACKEND_URL) {
    throw new Error("Backend URL Not Configured. Please go to Admin > Server Connection and enter your Sandbox Server URL.");
  }

  // Attach MW API Key to headers if present
  const headers = new Headers(options?.headers || {});
  if (MW_API_KEY) {
    headers.set('X-MW-User-Key', MW_API_KEY);
  }

  const finalOptions = { ...options, headers };

  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error: any) {
    // This catches network errors like ERR_CONNECTION_REFUSED
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.cause) {
      // Check if mixed content might be an issue (HTTPS frontend -> HTTP backend)
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isLocalBackend = url.includes('localhost') || url.includes('127.0.0.1');

      if (isHttps && isLocalBackend) {
        throw new Error(`Mixed Content Error: Cannot access local backend (${url}) from an HTTPS environment (Sandbox). Please configure the secure Sandbox URL in Admin.`);
      }

      throw new Error(`Network Error: Cannot connect to backend at ${url}. Ensure the server is running and the URL is correct.`);
    }
    throw error;
  }
};

export const MockService = {
  isSupabaseActive: () => {
    return !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';
  },

  getBackendUrl: () => BACKEND_URL,

  setBackendUrl: (url: string) => {
    BACKEND_URL = url.replace(/\/$/, '');
    localStorage.setItem('zilseo_api_url', BACKEND_URL);
  },

  getMwApiKey: () => MW_API_KEY,

  setMwApiKey: (key: string) => {
    MW_API_KEY = key.trim();
    localStorage.setItem('mw_api_key', MW_API_KEY);
  },

  getUsers: async (): Promise<User[]> => {
    if (MockService.isSupabaseActive()) {
      return SupabaseService.getUsers();
    }
    await delay(300);
    return MOCK_USERS;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User | undefined> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updateUser(userId, updates);
      return;
    }
    await delay(300);
    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index !== -1) {
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
      saveData(STORAGE_KEYS.USERS, MOCK_USERS);
      return MOCK_USERS[index];
    }
    return undefined;
  },

  updateUserPermissions: async (userId: string, permissions: Permission[]): Promise<User | undefined> => {
    return MockService.updateUser(userId, { permissions });
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.deleteUser(userId);
      return;
    }
    await delay(300);
    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index !== -1) {
      MOCK_USERS.splice(index, 1);
      saveData(STORAGE_KEYS.USERS, MOCK_USERS);
    }
  },

  addUser: async (name: string, email: string, role: 'admin' | 'user', password?: string): Promise<User> => {
    if (MockService.isSupabaseActive()) {
      return SupabaseService.addUser(name, email, role, password);
    }
    await delay(300);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      password, // Store password
      permissions: role === 'admin' ? [...ADMIN_PERMISSIONS] : [...DEFAULT_PERMISSIONS]
    };
    MOCK_USERS.push(newUser);
    saveData(STORAGE_KEYS.USERS, MOCK_USERS);
    return newUser;
  },

  getWebsites: async (userId?: string, role?: string): Promise<Website[]> => {
    if (MockService.isSupabaseActive()) {
      // For Admins, we don't pass the userId to the DB so they see all sites
      // For standard users, we pass their ID to filter
      const filterId = role === 'admin' ? undefined : userId;
      return SupabaseService.getWebsites(filterId);
    }
    await delay(200);
    if (role === 'admin') return MOCK_WEBSITES;
    if (userId) return MOCK_WEBSITES.filter(w => w.user_id === userId);
    return MOCK_WEBSITES;
  },

  addWebsite: async (website: Website, userId?: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.addWebsite(website, userId);
      return;
    }
    await delay(200);
    const newSite = { ...website, user_id: userId };
    MOCK_WEBSITES.push(newSite);
    saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
  },

  updateWebsite: async (website: Website): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updateWebsite(website);
      return;
    }
    await delay(200);
    const index = MOCK_WEBSITES.findIndex(w => w.id === website.id);
    if (index !== -1) {
      MOCK_WEBSITES[index] = website;
      saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
    }
  },

  deleteWebsite: async (id: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.deleteWebsite(id);
      return;
    }
    await delay(200);
    const index = MOCK_WEBSITES.findIndex(w => w.id === id);
    if (index !== -1) {
      MOCK_WEBSITES.splice(index, 1);
      saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
    }
  },

  connectGSC: async (websiteId: string, email: string, accessToken?: string, refreshToken?: string): Promise<void> => {
    // Basic Mock delay
    await delay(500);

    const websites = await MockService.getWebsites();
    const site = websites.find(w => w.id === websiteId);
    if (!site) throw new Error("Website not found");

    site.gscConnected = true;
    site.gscEmail = email;
    // Store the real tokens, ensuring no Bearer prefix and no whitespace
    site.accessToken = accessToken ? accessToken.replace(/^Bearer\s+/i, '').trim() : undefined;
    site.refreshToken = refreshToken;
    site.lastScraped = new Date().toISOString();

    if (MockService.isSupabaseActive()) {
      await SupabaseService.updateWebsite(site);
    } else {
      saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
    }
  },

  disconnectGSC: async (websiteId: string): Promise<void> => {
    await delay(400);
    const websites = await MockService.getWebsites();
    const site = websites.find(w => w.id === websiteId);
    if (site) {
      site.gscConnected = false;
      site.gscEmail = undefined;
      site.accessToken = undefined;
      site.lastScraped = undefined;

      if (MockService.isSupabaseActive()) {
        await SupabaseService.updateWebsite(site);
      } else {
        saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
      }
    }
  },

  refreshGscData: async (websiteId: string): Promise<void> => {
    const websites = await MockService.getWebsites();
    const site = websites.find(w => w.id === websiteId);
    if (site) {
      site.lastScraped = new Date().toISOString();
      if (MockService.isSupabaseActive()) {
        await SupabaseService.updateWebsite(site);
      } else {
        saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
      }
    }
  },

  getGscAuthUrl: async (state?: string): Promise<string> => {
    let url = `${BACKEND_URL}/api/gsc/auth-url`;
    if (state) url += `?state=${encodeURIComponent(state)}`;
    const response = await fetchWithNetworkCheck(url);
    if (!response.ok) throw new Error("Failed to get GSC Auth URL");
    const data = await response.json();
    return data.url;
  },

  handleGscCallback: async (code: string): Promise<any> => {
    const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/gsc/callback?code=${code}`);
    if (!response.ok) throw new Error("GSC Callback failed");
    return response.json();
  },

  listGscSites: async (accessToken: string, refreshToken?: string): Promise<any[]> => {
    const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/gsc/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken })
    });
    if (!response.ok) throw new Error("Failed to fetch GSC sites");
    const data = await response.json();

    // Auto-update access token if refreshed
    if (data._metainfo?.newAccessToken) {
      localStorage.setItem('gsc_access_token', data._metainfo.newAccessToken);
    }

    return data.sites || [];
  },

  syncGscPages: async (websiteId: string): Promise<string[]> => {
    const websites = await MockService.getWebsites();
    const site = websites.find(w => w.id === websiteId);
    if (!site || !site.accessToken) throw new Error("GSC not connected for this website");

    // We need to resolve the property URL first (it could be sc-domain: or https://)
    let workingSiteUrl = site.url;

    // Attempt to fetch pages from backend
    const fetchPages = async (url: string) => {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/gsc/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: url,
          accessToken: site.accessToken,
          refreshToken: site.refreshToken
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`GSC Sync Failed: ${err}`);
      }

      const data = await response.json();

      // Auto-update access token if refreshed
      if (data._metainfo?.newAccessToken) {
        console.log("GSC Access Token auto-refreshed (Pages). Updating storage...");
        site.accessToken = data._metainfo.newAccessToken;
        if (MockService.isSupabaseActive()) {
          SupabaseService.updateWebsite(site).catch(e => console.error("Failed to persist refreshed token:", e));
        } else {
          saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
        }
      }

      return data.pages || [];
    };

    try {
      try {
        return await fetchPages(workingSiteUrl);
      } catch (err: any) {
        if (err.message.includes('403') || err.message.includes('404')) {
          const hostname = new URL(site.url).hostname.replace(/^www\./, '');
          workingSiteUrl = `sc-domain:${hostname}`;
          return await fetchPages(workingSiteUrl);
        }
        throw err;
      }
    } catch (error: any) {
      console.error("GSC Sync Error:", error);
      throw error;
    }
  },

  syncAllGscData: async (): Promise<{ success: number, failure: number }> => {
    let success = 0;
    let failure = 0;
    const websites = await MockService.getWebsites();
    for (const site of websites) {
      if (site.gscConnected && site.accessToken) {
        try {
          const pages = await MockService.syncGscPages(site.id);
          if (pages.length > 0) {
            await MockService.bulkAddPages(site.id, pages);
          }
          success++;
        } catch (err) {
          console.error(`Failed to sync site ${site.name}:`, err);
          failure++;
        }
      }
    }
    return { success, failure };
  },

  // REAL GSC API LOGIC
  getGscAnalytics: async (websiteId: string): Promise<{
    metrics: GscDailyMetric[],
    queries: GscQueryData[],
    pages: GscPageData[]
  }> => {

    const websites = await MockService.getWebsites();
    const site = websites.find(w => w.id === websiteId);

    if (!site || !site.accessToken) {
      console.error("Missing Access Token or Site ID");
      return { metrics: [], queries: [], pages: [] };
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Helper to perform the fetch with error handling
    const fetchGscData = async (siteUrl: string, dimensions: string[], rowLimit: number) => {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/gsc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteUrl,
          startDate,
          endDate,
          dimensions,
          rowLimit,
          accessToken: site.accessToken,
          refreshToken: site.refreshToken
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();

      // Auto-update access token if refreshed
      if (data._metainfo?.newAccessToken) {
        console.log("GSC Access Token auto-refreshed. Updating storage...");
        site.accessToken = data._metainfo.newAccessToken;
        if (MockService.isSupabaseActive()) {
          SupabaseService.updateWebsite(site).catch(e => console.error("Failed to persist refreshed token:", e));
        } else {
          saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
        }
      }

      return data;
    };

    try {
      let workingSiteUrl = site.url;

      // 1. Fetch Metrics (Date Dimension)
      // We use this first call to validate the property URL format (URL-prefix vs Domain property)
      let metricsJson;
      try {
        metricsJson = await fetchGscData(workingSiteUrl, ['date'], 30);
      } catch (err: any) {
        if (err.message.includes('403') || err.message.includes('404')) {
          const urlObj = new URL(site.url);
          const hostname = urlObj.hostname;
          const rootHostname = hostname.replace(/^www\./, '');
          const slashedUrl = site.url.endsWith('/') ? site.url : `${site.url}/`;
          const unslashedUrl = site.url.replace(/\/$/, '');

          const variations = [
            `sc-domain:${rootHostname}`,
            slashedUrl,
            unslashedUrl,
            `https://www.${rootHostname}/`,
            `http://${rootHostname}/`,
            `http://www.${rootHostname}/`
          ];

          let success = false;
          for (const variant of variations) {
            if (variant === workingSiteUrl) continue;
            try {
              console.log(`GSC Mismatch: Trying variant ${variant}`);
              metricsJson = await fetchGscData(variant, ['date'], 30);
              workingSiteUrl = variant;
              success = true;
              break;
            } catch (vErr) { /* continue */ }
          }
          if (!success) throw err;
        } else {
          throw err;
        }
      }

      const metrics: GscDailyMetric[] = (metricsJson && metricsJson.rows || []).map((row: any) => ({
        date: new Date(row.keys[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr * 100,
        position: row.position
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 2. Fetch Queries
      let queries: GscQueryData[] = [];
      try {
        const queriesJson = await fetchGscData(workingSiteUrl, ['query'], 100);
        queries = (queriesJson.rows || []).map((row: any) => ({
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr * 100,
          position: row.position,
          positionChange: 0
        }));
      } catch (qErr) {
        console.warn("Failed to fetch GSC queries:", qErr);
      }

      // 3. Fetch Pages
      let pages: GscPageData[] = [];
      try {
        const pagesJson = await fetchGscData(workingSiteUrl, ['page'], 100);
        pages = (pagesJson.rows || []).map((row: any) => ({
          url: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr * 100,
          position: row.position,
          positionChange: 0
        }));
      } catch (pErr) {
        console.warn("Failed to fetch GSC pages:", pErr);
      }

      return { metrics, queries, pages };

    } catch (error) {
      console.error("Failed to fetch real GSC data:", error);
      throw error;
    }
  },

  toggleSocialWork: async (websiteId: string, socialId: string, isActive: boolean, positions: number = 30): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      // 1. Get current link state from Supabase
      let { data: link, error: fetchErr } = await supabase
        .from('social_links')
        .select('*')
        .eq('id', socialId)
        .single();

      if (fetchErr || !link) {
        // If not found by ID, try to find by URL + WebsiteID to be more resilient
        const { data: altLink, error: altErr } = await supabase
          .from('social_links')
          .select('*')
          .eq('website_id', websiteId)
          .eq('url', socialId) // socialId might actually be the URL in some cases
          .maybeSingle();

        if (altErr || !altLink) {
          console.error("Failed to find social link in Supabase:", fetchErr || altErr);
          throw new Error("Social link not found in database. Please ensure the link is saved first.");
        }
        // Use the found altLink
        link = altLink;
      }

      const socialLink: SocialLink = {
        id: link.id,
        platform: link.platform,
        url: link.url,
        isWorkEnabled: link.is_work_enabled,
        mwCampaignId: link.mw_campaign_id
      };

      if (isActive) {
        const { campaignId, templateId } = await MockService.createMicroworkersCampaign(websiteId, socialLink, 'social', positions);
        const { error: updateErr } = await supabase
          .from('social_links')
          .update({
            is_work_enabled: true,
            mw_campaign_id: campaignId,
            mw_template_id: templateId
          })
          .eq('id', socialId);
        if (updateErr) throw updateErr;
      } else {
        const { error: updateErr } = await supabase
          .from('social_links')
          .update({ is_work_enabled: false })
          .eq('id', socialId);
        if (updateErr) throw updateErr;
      }
      return;
    }

    // Fallback to Mock Storage
    const site = MOCK_WEBSITES.find(w => w.id === websiteId);
    if (!site) return;

    if (!site.socialLinks) site.socialLinks = [];
    const link = site.socialLinks.find(s => s.id === socialId);

    if (link) {
      if (isActive) {
        const { campaignId, templateId } = await MockService.createMicroworkersCampaign(websiteId, link, 'social', positions);
        link.isWorkEnabled = true;
        link.mwCampaignId = campaignId;
        link.mwTemplateId = templateId;
        link.targetPositions = positions;
      } else {
        link.isWorkEnabled = false;
        link.mwCampaignId = undefined;
      }
      saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
    }
  },

  getMwCategories: async (): Promise<string> => {
    try {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const categories = data.items || data.categories || [];

      // Category 10 is SEO & Web Traffic. Subcategory 1001 is typically "Search, Click & Engage"
      // We return 1001 as a string because server.js now handles the parsing.
      return "1001";
    } catch (e: any) {
      return "1001"; // Fallback to 1001
    }
  },

  // Get Campaign Status
  getMicroworkersCampaignStatus: async (campaignId: string): Promise<string> => {
    // Strict validation to prevent 404 floods
    if (!campaignId || campaignId === 'undefined' || campaignId === 'null' || campaignId.length < 3) return 'NO_CAMPAIGN';

    // Fix for Malformed IDs (JSON strings)
    let safeId = campaignId;
    if (campaignId.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(campaignId);
        safeId = parsed.campaignId || parsed.id || campaignId;
        console.warn(`[MW] Fixed malformed campaign ID: ${campaignId} -> ${safeId}`);
      } catch (e) { }
    }

    try {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${safeId}`);
      if (response.status === 404) return 'NOT_FOUND';
      if (!response.ok) return 'UNKNOWN';

      try {
        const data = await response.json();
        return data.status || 'UNKNOWN';
      } catch (jsonErr) {
        console.warn(`Invalid JSON from Campaign Status API for ${campaignId}. Response might be HTML (frontend fallback?).`);
        return 'UNKNOWN';
      }
    } catch (e) {
      console.error(`Error fetching campaign status for ${campaignId}:`, e);
      return 'ERROR';
    }
  },

  // Stop Campaign Implementation
  stopMicroworkersCampaign: async (campaignId: string): Promise<void> => {
    try {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}/stop`, {
        method: 'PUT'
      });
      if (!response.ok) {
        console.error("Failed to stop campaign", await response.text());
      }
    } catch (e) {
      console.error("Error stopping campaign:", e);
    }
  },

  // Restart Campaign Implementation
  restartMicroworkersCampaign: async (campaignId: string, positions: number = 30): Promise<void> => {
    console.log(`[MW] Restarting campaign ${campaignId}...`);
    const res = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}/restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionsToAdd: positions })
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`DoesNotExist: Campaign ${campaignId} was not found on MW.`);
      }
      const errData = await res.json();
      const errorMsg = errData.error || JSON.stringify(errData);

      // Gracefully handle if it doesn't need restarting or is already active
      if (errorMsg.includes('CampaignIsNotPaused') || errorMsg.includes('CampaignIsActive')) {
        console.log(`Campaign ${campaignId} doesn't require restart (possibly already active).`);
        return;
      }
      throw new Error(`Failed to restart campaign: ${errorMsg}`);
    }

    // Also attempt to enable auto refill on restart to satisfy "keep on running" requirement
    try {
      await MockService.updateMicroworkersCampaign(campaignId, { autoRefillPositions: true });
    } catch (e) {
      console.warn(`Failed to enable auto refill for restarted campaign ${campaignId}:`, e);
    }
  },

  pauseMicroworkersCampaign: async (campaignId: string): Promise<void> => {
    console.log(`[MW] Pausing campaign ${campaignId}...`);
    const res = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}/pause`, {
      method: 'PUT'
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`DoesNotExist: Campaign ${campaignId} was not found on MW.`);
      }
      const errData = await res.json();
      const errorMsg = errData.error || JSON.stringify(errData);

      // Gracefully handle if already paused
      if (errorMsg.includes('CampaignIsAlreadyPaused') || errorMsg.includes('already paused')) {
        console.log(`Campaign ${campaignId} was already paused.`);
        return;
      }
      throw new Error(`Failed to pause campaign: ${errorMsg}`);
    }
  },

  resumeMicroworkersCampaign: async (campaignId: string): Promise<void> => {
    console.log(`[MW] Resuming campaign ${campaignId}...`);
    const res = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}/resume`, {
      method: 'PUT'
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`DoesNotExist: Campaign ${campaignId} was not found on MW.`);
      }
      const errData = await res.json();
      const errorMsg = errData.error || JSON.stringify(errData);

      // Gracefully handle if not actually paused
      if (errorMsg.includes('CampaignIsNotPaused') || errorMsg.includes('not paused')) {
        console.log(`Campaign ${campaignId} is not paused (possibly already running or finished).`);
        return;
      }
      throw new Error(`Failed to resume campaign: ${errorMsg}`);
    }
  },

  updateMicroworkersCampaign: async (campaignId: string, updates: any): Promise<void> => {
    console.log(`[MW] Updating campaign ${campaignId}...`, updates);
    const res = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[MW] Failed to update campaign ${campaignId}:`, errText);
      throw new Error(`Failed to update campaign: ${errText}`);
    }
  },

  // Update Template Content (Smart - handles all types)
  updateMicroworkersTemplate: async (templateId: string, item: Page | Post | SocialLink | ExternalLink, type: 'page' | 'post' | 'social' | 'external'): Promise<void> => {
    try {
      let htmlCode = '';

      if (type === 'social') {
        const link = item as SocialLink;
        htmlCode = MwTemplates.getSocialEngagementTemplate(link.platform, link.url);
      } else if (type === 'external') {
        const link = item as ExternalLink;
        htmlCode = MwTemplates.getExternalLinkTemplate(link.keyword, link.articleTitle, link.landingPageDomain);
      } else {
        const itemData = item as Page | Post;
        const keyword = type === 'page' ? (itemData as Page).keyword || '' : (itemData as Post).searchQuery || '';
        const targetText = itemData.resultText || '';
        const itemUrl = itemData.url || 'https://example.com';
        const urlObj = new URL(itemUrl);
        const landingDomain = urlObj.hostname;
        htmlCode = MwTemplates.getSearchPostTemplate(keyword, targetText, landingDomain);
      }

      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlCode: htmlCode,
          cssSection: "",
          jsSection: ""
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update template", errorText);
        throw new Error(`Failed to update template: ${errorText}`);
      }
      console.log(`Template ${templateId} updated successfully`);
    } catch (e: any) {
      console.error("Error updating template:", e);
      throw e;
    }
  },

  // Smart Campaign Manager - Updates existing campaign if exists, creates new if not
  upsertMicroworkersCampaign: async (
    websiteId: string,
    item: Page | Post | SocialLink | ExternalLink,
    type: 'page' | 'post' | 'social' | 'external',
    positions: number = 30
  ): Promise<{ campaignId: string, templateId: string, isNewCampaign: boolean }> => {
    // Check if campaign already exists
    const existingCampaignId = (item as any).mwCampaignId;
    const existingTemplateId = (item as any).mwTemplateId;

    if (existingCampaignId && existingTemplateId) {
      console.log(`[MW] Campaign ${existingCampaignId} exists, updating template and positions...`);

      try {
        // Update template with new content
        await MockService.updateMicroworkersTemplate(existingTemplateId, item, type);

        // Update campaign to ensure it has enough positions and auto-refill is enabled
        await MockService.updateMicroworkersCampaign(existingCampaignId, {
          availablePositions: positions,
          autoRefillPositions: true
        });

        console.log(`[MW] Campaign ${existingCampaignId} updated successfully`);
        return { campaignId: existingCampaignId, templateId: existingTemplateId, isNewCampaign: false };
      } catch (error: any) {
        console.warn(`[MW] Failed to update existing campaign, will create new one:`, error.message);
        // If update fails, fall through to create new campaign
      }
    }

    // Create new campaign
    console.log(`[MW] Creating new campaign for ${type}...`);
    const result = await MockService.createMicroworkersCampaign(websiteId, item, type, positions);
    return { ...result, isNewCampaign: true };
  },

  rateMicroworkersTask: async (campaignId: string, taskId: string, rating: 'OK' | 'NOK' | 'REVISE', reason?: string): Promise<void> => {
    console.log(`[MW] Rating task ${taskId} in campaign ${campaignId} as ${rating}...`);
    const res = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${campaignId}/tasks/${taskId}/rate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, reason, comment: reason })
    });

    if (!res.ok) {
      const text = await res.text();
      let errorMsg = text;
      try {
        const json = JSON.parse(text);
        errorMsg = json.error || json.message || text;
      } catch (e) { }

      console.error(`[MW] Failed to rate task ${taskId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  },

  // Microworkers API Integration
  createMicroworkersCampaign: async (websiteId: string, item: Page | Post | SocialLink | ExternalLink, type: 'page' | 'post' | 'social' | 'external', positions: number = 30): Promise<{ campaignId: string, templateId: string }> => {
    let keyword = '';
    let targetText = '';
    let title = '';
    let htmlCode = '';

    if (type === 'social') {
      const link = item as SocialLink;
      title = `Social Engagement: ${link.platform}`;
      htmlCode = MwTemplates.getSocialEngagementTemplate(link.platform, link.url);
    } else if (type === 'external') {
      const link = item as ExternalLink;
      title = link.title || `External Article: ${link.keyword}`;
      htmlCode = MwTemplates.getExternalLinkTemplate(link.keyword, link.articleTitle, link.landingPageDomain);
    } else {
      const itemData = item as Page | Post;
      keyword = type === 'page' ? (itemData as Page).keyword || '' : (itemData as Post).searchQuery || '';
      targetText = itemData.resultText || '';

      if (!keyword) throw new Error("Search Query/Keyword is required to start a campaign.");
      // if (!targetText) throw new Error("Result Text is required.");

      const itemUrl = itemData.url || 'https://example.com';
      const urlObj = new URL(itemUrl);
      const landingDomain = urlObj.hostname;

      title = `Google: Search + Visit + Share`;
      htmlCode = MwTemplates.getSearchPostTemplate(keyword, targetText, landingDomain);
    }

    try {
      console.log("Step 0: Defining Category ID...");
      // Map internal types to MW v2 Category IDs
      // 10 = SEO & Web Traffic (for Search + Visit tasks)
      // 23 = Social Media (for Engagement tasks)
      let safeCategoryId = "1001"; // SEO & Web Traffic
      if (type === 'social') {
        safeCategoryId = "2314"; // Social Media Engagement
      }
      console.log(`Using Category ID: ${safeCategoryId} for type ${type}`);

      console.log("Step 1: Creating Template...");
      const templateRes = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${title} - Template ${Date.now()}`,
          htmlCode: htmlCode,
          cssSection: "",
          jsSection: ""
        })
      });

      if (!templateRes.ok) {
        const err = await templateRes.json();
        throw new Error(`Template Creation Failed: ${JSON.stringify(err)}`);
      }
      const templateData = await templateRes.json();
      const templateId = templateData.id;

      console.log("Step 2: Creating Campaign...", { positions });
      const campaignPayload = {
        title: title,
        description: `Perform task: ${title}`,
        categoryId: safeCategoryId,
        availablePositions: positions,
        minutesToFinish: 15,
        paymentPerTask: 0.15,
        speed: 1000,
        ttr: 7,
        internationalZone: { id: "int", excludedCountries: [] },
        internalTemplate: {
          id: templateId,
          ratingMethodId: 3
        },
        qtRequired: false
      };

      const campaignRes = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignPayload)
      });

      if (!campaignRes.ok) {
        const errText = await campaignRes.text();
        let errData;
        try { errData = JSON.parse(errText); } catch (e) { errData = { error: errText }; }
        console.error("Campaign Creation Failed Response:", errData);

        let errorTitle = errData.title || "Error";
        let errorDetails = errData.detail || errData.message || JSON.stringify(errData, null, 2);

        if (errData.violations && Array.isArray(errData.violations) && errData.violations.length > 0) {
          const v = errData.violations[0];
          errorTitle = v.title || errorTitle;
          errorDetails = v.detail || errorDetails;

          // If there's a pointer (field name), prepend it
          if (v.pointer) {
            errorDetails = `Field ${v.pointer}: ${errorDetails}`;
          }
        }

        const error = new Error(`Campaign Creation Failed`);
        (error as any).campaignErrorData = {
          status: campaignRes.status,
          title: title,
          errorTitle: errorTitle,
          details: errorDetails
        };
        throw error;
      }

      const campaignData = await campaignRes.json();
      if (!campaignData || !campaignData.id) {
        throw new Error("Campaign created but no ID was returned from MW.");
      }

      console.log("Campaign Created Successfully:", campaignData.id);

      // ENABLE AUTO REFILL - To keep the campaign running as requested by user
      try {
        console.log(`Step 3: Enabling autoRefillPositions and ensuring positions for ${campaignData.id}...`);
        await MockService.updateMicroworkersCampaign(String(campaignData.id), {
          autoRefillPositions: true,
          availablePositions: positions // Ensure positions are set
        });
        console.log(`[MW] Auto-refill enabled and positions set to ${positions}`);
      } catch (e) {
        console.warn("Failed to enable auto refill, but campaign was created:", e);
      }

      return { campaignId: String(campaignData.id), templateId: String(templateId) };

    } catch (error: any) {
      console.error("MW Integration Error:", error);
      throw new Error(error.message || "Failed to communicate with Microworkers API");
    }
  },

  // Pages
  getPages: async (websiteId?: string): Promise<Page[]> => {
    if (MockService.isSupabaseActive() && websiteId) {
      return SupabaseService.getPages(websiteId);
    }
    await delay(200);
    if (websiteId) return MOCK_PAGES.filter(p => p.websiteId === websiteId);
    return MOCK_PAGES;
  },

  addPage: async (page: Page): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.addPage(page);
      return;
    }
    await delay(200);
    if (!page.uploadedDate) page.uploadedDate = new Date().toISOString().split('T')[0];
    MOCK_PAGES.push(page);
    saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
  },

  updatePage: async (updatedPage: Page): Promise<void> => {
    updatedPage.lastEdited = new Date().toISOString().split('T')[0];
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updatePage(updatedPage);
      return;
    }
    await delay(200);
    const index = MOCK_PAGES.findIndex(p => p.id === updatedPage.id);
    if (index !== -1) {
      MOCK_PAGES[index] = updatedPage;
      saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
    }
  },

  updatePageDetails: async (pageId: string, updates: Partial<Page>): Promise<void> => {
    updates.lastEdited = new Date().toISOString().split('T')[0];
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updatePageDetails(pageId, updates);
      return;
    }
    const page = MOCK_PAGES.find(p => p.id === pageId);
    if (page) {
      Object.assign(page, updates);
      saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
    }
  },

  deletePage: async (id: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.deletePage(id);
      return;
    }
    await delay(200);
    const index = MOCK_PAGES.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_PAGES.splice(index, 1);
      saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
    }
  },

  // Posts
  getPosts: async (websiteId: string): Promise<Post[]> => {
    if (MockService.isSupabaseActive()) {
      return SupabaseService.getPosts(websiteId);
    }
    await delay(200);
    return MOCK_POSTS.filter(p => p.websiteId === websiteId);
  },

  addPost: async (post: Post): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.addPost(post);
      return;
    }
    await delay(200);
    if (!post.uploadedDate) post.uploadedDate = new Date().toISOString().split('T')[0];
    MOCK_POSTS.push(post);
    saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
  },

  deletePost: async (id: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.deletePost(id);
      return;
    }
    await delay(200);
    const index = MOCK_POSTS.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_POSTS.splice(index, 1);
      saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
    }
  },

  updatePost: async (updatedPost: Post): Promise<void> => {
    updatedPost.lastEdited = new Date().toISOString().split('T')[0];
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updatePost(updatedPost);
      return;
    }
    await delay(200);
    const index = MOCK_POSTS.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      MOCK_POSTS[index] = updatedPost;
      saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
    }
  },

  updatePostDetails: async (postId: string, updates: Partial<Post>): Promise<void> => {
    updates.lastEdited = new Date().toISOString().split('T')[0];
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updatePostDetails(postId, updates);
      return;
    }
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (post) {
      Object.assign(post, updates);
      saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
    }
  },

  // External Links
  getExternalLinks: async (websiteId: string): Promise<ExternalLink[]> => {
    if (MockService.isSupabaseActive()) {
      return SupabaseService.getExternalLinks(websiteId);
    }
    await delay(200);
    return MOCK_EXTERNAL_LINKS.filter(p => p.websiteId === websiteId);
  },

  addExternalLink: async (link: ExternalLink): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.addExternalLink(link);
      return;
    }
    await delay(200);
    MOCK_EXTERNAL_LINKS.push(link);
    saveData(STORAGE_KEYS.EXTERNAL_LINKS, MOCK_EXTERNAL_LINKS);
  },

  updateExternalLinkDetails: async (id: string, updates: Partial<ExternalLink>): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.updateExternalLinkDetails(id, updates);
      return;
    }
    const link = MOCK_EXTERNAL_LINKS.find(p => p.id === id);
    if (link) {
      Object.assign(link, updates);
      saveData(STORAGE_KEYS.EXTERNAL_LINKS, MOCK_EXTERNAL_LINKS);
    }
  },

  deleteExternalLink: async (id: string): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.deleteExternalLink(id);
      return;
    }
    await delay(200);
    const index = MOCK_EXTERNAL_LINKS.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_EXTERNAL_LINKS.splice(index, 1);
      saveData(STORAGE_KEYS.EXTERNAL_LINKS, MOCK_EXTERNAL_LINKS);
    }
  },

  crawlWebsite: async (url: string): Promise<string[]> => {
    try {
      const response = await fetchWithNetworkCheck(`${BACKEND_URL}/api/crawl?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("Crawl failed on server");
      const data = await response.json();
      return data.links || [];
    } catch (error) {
      console.error("Crawl error:", error);
      throw error;
    }
  },

  bulkAddPages: async (websiteId: string, urls: string[]): Promise<void> => {
    await delay(500);

    if (MockService.isSupabaseActive()) {
      const existing = await SupabaseService.getPages(websiteId);
      for (const url of urls) {
        if (!existing.find(p => p.url === url)) {
          await SupabaseService.addPage({
            id: `p_auto_${Math.random().toString(36).substr(2, 9)}`,
            websiteId,
            url,
            title: 'Auto Scanned Page',
            status: 'ready',
            uploadedDate: new Date().toISOString().split('T')[0],
            links: [],
            faqs: [],
            content: [],
            category: 'Landing page'
          });
        }
      }
      return;
    }

    urls.forEach(url => {
      // Avoid duplicates
      const exists = MOCK_PAGES.find(p => p.websiteId === websiteId && p.url === url);
      if (!exists) {
        MOCK_PAGES.push({
          id: `p_auto_${Math.random().toString(36).substr(2, 9)}`,
          websiteId,
          url,
          title: 'Auto Scanned Page',
          status: 'ready',
          uploadedDate: new Date().toISOString().split('T')[0],
          links: [],
          faqs: [],
          content: [],
          category: 'Landing page'
        });
      }
    });
    saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
  },

  bulkAddPosts: async (websiteId: string, urls: string[]): Promise<void> => {
    await delay(500);

    if (MockService.isSupabaseActive()) {
      const existing = await SupabaseService.getPosts(websiteId);
      for (const url of urls) {
        if (!existing.find(p => p.url === url)) {
          await SupabaseService.addPost({
            id: `post_auto_${Math.random().toString(36).substr(2, 9)}`,
            websiteId,
            title: url.split('/').filter(Boolean).pop() || 'Untitled Post',
            url,
            status: 'ready',
            uploadedDate: new Date().toISOString().split('T')[0],
            publishDate: new Date().toISOString().split('T')[0]
          });
        }
      }
      return;
    }

    urls.forEach(url => {
      // Avoid duplicates
      const exists = MOCK_POSTS.find(p => p.websiteId === websiteId && p.url === url);
      if (!exists) {
        MOCK_POSTS.push({
          id: `post_auto_${Math.random().toString(36).substr(2, 9)}`,
          websiteId,
          title: url.split('/').filter(Boolean).pop() || 'Untitled Post',
          url,
          status: 'ready',
          uploadedDate: new Date().toISOString().split('T')[0],
          publishDate: new Date().toISOString().split('T')[0]
        });
      }
    });
    saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
  },

  scrapePageData: async (url: string): Promise<any> => {
    // 1. URL Normalization
    let targetUrl = url.trim();
    if (!targetUrl.match(/^https?:\/\//i)) {
      targetUrl = 'https://' + targetUrl;
    }

    // 2. Proxy Rotation
    const proxies = [
      // Local Backend (Prioritize this as it has proper headers and is less likely to be blocked)
      (u: string) => `${BACKEND_URL}/api/scrape?url=${encodeURIComponent(u)}`,
      // AllOrigins (Raw HTML)
      (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      // CodeTabs (JSON wrapper usually, but raw also works with /proxy)
      (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
      // Fallback CORS Proxy
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];

    let html = '';
    let fetchError = null;

    for (const proxyGen of proxies) {
      try {
        const proxyUrl = proxyGen(targetUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          // Basic HTML validation
          if (text && (text.includes('<html') || text.includes('<body') || text.length > 100)) {
            html = text;
            break;
          }
        }
      } catch (e: any) {
        // Ignore individual proxy failures
        fetchError = e;
      }
    }

    if (!html) {
      throw new Error(`Auto-fill failed: Could not fetch content from ${targetUrl}. This might be due to CORS restrictions or the website blocking automated access. Error: ${fetchError?.message || 'Unknown'}`);
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Metadata
      const rawTitleTag = doc.querySelector('title')?.innerText || doc.title || '';
      const h1Tag = doc.querySelector('h1')?.innerText || '';

      const metaTitle = h1Tag || rawTitleTag; // Swapped: used to be SEO title

      const realSeoTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
        rawTitleTag;

      const title = realSeoTitle || h1Tag; // Swapped: used to be H1

      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
        '';

      const keywordsStr = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      let keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);

      // Fallback: Use Title words if no meta keywords found
      if (keywords.length === 0 && (title || metaTitle)) {
        const sourceText = title || metaTitle || '';
        // Simple stopword filter could be added, but length > 3 is a basic heuristic
        keywords = sourceText.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
      }

      const keyword = keywords[0] || '';

      // 2. Content Extraction (Heuristic)
      let content: string[] = [];

      // Selectors to try for main content
      const contentSelectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.entry-content',
        '#content',
        '.main-content',
        'main',
        '#main',
        '.post',
        '.blog-post'
      ];

      let contentContainer: Element | null = null;
      for (const selector of contentSelectors) {
        const el = doc.querySelector(selector);
        if (el) {
          contentContainer = el;
          break;
        }
      }

      // Fallback: use body if no container found, but filter heavily
      const targetContainer = contentContainer || doc.body;
      const paragraphs = targetContainer.querySelectorAll('p, li, h2, h3, h4, h5, h6');

      content = Array.from(paragraphs)
        .filter(p => !p.closest('nav') && !p.closest('header') && !p.closest('footer') && !p.closest('.sidebar'))
        .map(p => {
          const text = p.textContent?.trim() || '';
          const tagName = p.tagName.toLowerCase();

          // Heuristics to decide if we keep this line
          const isHeading = tagName.startsWith('h');
          const isLongEnough = text.length > 25; // Relaxed filter from 50
          const isMeaningful = text.length > 5 && isHeading; // Keep short headings

          if (isLongEnough || isMeaningful) return text;
          return null;
        })
        .filter((text): text is string => text !== null);

      // Limit to first 30 paragraphs to avoid overloading
      content = content.slice(0, 30);

      // 3. FAQ Extraction (Schema.org JSON-LD)
      const faqs: any[] = [];
      const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

      scripts.forEach(script => {
        try {
          const json = JSON.parse(script.textContent || '{}');

          // Handle array of schemas or single object
          const schemas = Array.isArray(json) ? json : [json];

          schemas.forEach(schema => {
            if (schema['@type'] === 'FAQPage' && Array.isArray(schema.mainEntity)) {
              schema.mainEntity.forEach((entity: any) => {
                if (entity['@type'] === 'Question' && entity.acceptedAnswer) {
                  faqs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    question: entity.name,
                    answer: entity.acceptedAnswer.text?.replace(/<[^>]*>/g, '') || entity.acceptedAnswer.text
                  });
                }
              });
            }
          });
        } catch (e) {
          // Ignore parse errors
        }
      });

      // 4. Heuristic FAQ extraction (if JSON-LD found nothing or very little)
      if (faqs.length < 2) {
        // Look for common FAQ patterns: H2/H3/H4 containing "?" or <strong> followed by text
        const headings = targetContainer.querySelectorAll('h2, h3, h4, strong');
        headings.forEach(h => {
          const text = h.textContent?.trim() || '';
          if (text.includes('?') && text.length > 10 && text.length < 200) {
            // Potential question. Next sibling or next paragraph might be the answer.
            let answer = '';
            let next = h.nextElementSibling;

            // Look for next P tag
            while (next && next.tagName !== 'P' && next.tagName !== 'DIV') {
              next = next.nextElementSibling;
            }

            if (next) {
              answer = next.textContent?.trim() || '';
            }

            if (answer.length > 20) {
              // Avoid duplicates from JSON-LD
              if (!faqs.some(f => f.question === text)) {
                faqs.push({
                  id: Math.random().toString(36).substr(2, 9),
                  question: text,
                  answer: answer
                });
              }
            }
          }
        });
      }

      // 5. Content Type Detection (Page vs Post/Article)
      const detectContentType = (): 'page' | 'post' => {
        let pageScore = 0;
        let postScore = 0;

        // URL Pattern Analysis
        const urlPath = targetUrl.toLowerCase();
        const pathSegments = urlPath.split('/').filter(s => s.length > 0);
        const lastSegment = pathSegments[pathSegments.length - 1] || '';

        // Post indicators in URL
        const postUrlPatterns = [
          /\/blog\//i, /\/article\//i, /\/post\//i, /\/news\//i,
          /-(202[0-9]|20[3-9][0-9])[-\/]?/,  // Year patterns (2020-2099)
          /\d{4}\/\d{2}\/\d{2}/,              // Date format in URL
          /\/(how|what|why|when|where|guide|tips|best)-/i  // Article-style keywords
        ];

        // Page indicators in URL  
        const pageUrlPatterns = [
          /\/features?\/?$/i, /\/pricing\/?$/i, /\/contact\/?$/i,
          /\/about\/?$/i, /\/services?\/?$/i, /\/products?\/?$/i,
          /^[^\/]*\.[^\/]+\/[^\/]+\/?$/  // Short URLs (domain.com/something/)
        ];

        postUrlPatterns.forEach(pattern => {
          if (pattern.test(urlPath)) postScore += 2;
        });

        pageUrlPatterns.forEach(pattern => {
          if (pattern.test(urlPath)) pageScore += 2;
        });

        // URL length heuristic (longer URLs often indicate articles)
        if (lastSegment.length > 40) postScore += 1;
        else if(lastSegment.length < 20) pageScore += 1;

  // Check for publication date in metadata
  const pubDateSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="publish_date"]',
    'meta[name="date"]',
    'time[pubdate]',
    'time[datetime]',
    '.published-date',
    '.post-date',
    '.entry-date'
  ];

  let hasPublishDate = false;
  for(const selector of pubDateSelectors) {
    const el = doc.querySelector(selector);
    if (el) {
      const dateValue = el.getAttribute('content') || el.getAttribute('datetime') || el.textContent || '';
      if (dateValue && /20\d{2}/.test(dateValue)) {
        hasPublishDate = true;
        break;
      }
    }
  }
        if(hasPublishDate) postScore += 3;

  // Check for article type in schema.org
  const articleTypes = ['article', 'blogposting', 'newsarticle'];
  const schemas = doc.querySelectorAll('script[type="application/ld+json"]');
  schemas.forEach(script => {
    try {
      const json = JSON.parse(script.textContent || '{}');
const schemas = Array.isArray(json) ? json : [json];
schemas.forEach(schema => {
  const type = (schema['@type'] || '').toLowerCase();
  if (articleTypes.includes(type)) postScore += 3;
  else if (type === 'webpage') pageScore += 1;
});
          } catch (e) { }
        });

// Check for blog/article indicators in HTML
const hasArticleTag = doc.querySelector('article') !== null;
const hasBlogClass = html.match(/class="[^"]*\b(blog|post|article|entry)\b[^"]*"/i);
const hasCategoryTags = doc.querySelectorAll('.category, .tag, .categories, .tags').length > 0;
const hasAuthor = doc.querySelector('meta[name="author"]') ||
  doc.querySelector('[rel="author"]') ||
  doc.querySelector('.author, .by-author, .post-author');

if (hasArticleTag) postScore += 1;
if (hasBlogClass) postScore += 1;
if (hasCategoryTags) postScore += 2;
if (hasAuthor) postScore += 1;

// Check content length (articles tend to be longer)
if (content.length > 15) postScore += 1;
        else if (content.length < 10) pageScore += 1;

// Check for common page identifiers
const pageIndicators = ['pricing', 'contact', 'about', 'services', 'products',
  'features', 'demo', 'signup', 'login', 'register'];
const titleLower = (title || '').toLowerCase();
const h1Lower = h1Tag.toLowerCase();

pageIndicators.forEach(indicator => {
  if (titleLower.includes(indicator) || h1Lower.includes(indicator)) {
    pageScore += 2;
  }
});

// Final decision
console.log(`[Content Type Detection] URL: ${targetUrl} | Page Score: ${pageScore} | Post Score: ${postScore}`);
return postScore > pageScore ? 'post' : 'page';
      };

const detectedType = detectContentType();

return {
  title,
  metaTitle,
  metaDescription,
  keywords,
  keyword,
  content,
  faqs,
  contentType: detectedType  // Add detected type
};
    } catch (error) {
  console.error("Auto-fill parsing error:", error);
  throw error;
}
  },

// Detect content type from URL only (fast, no scraping)
detectContentTypeFromUrl: (url: string): 'page' | 'post' => {
  const urlPath = url.toLowerCase();
  const pathSegments = urlPath.split('/').filter(s => s.length > 0);
  const lastSegment = pathSegments[pathSegments.length - 1] || '';

  let pageScore = 0;
  let postScore = 0;

  // Post indicators in URL
  const postUrlPatterns = [
    /\/blog\//i, /\/article\//i, /\/post\//i, /\/news\//i,
    /-(202[0-9]|20[3-9][0-9])[-\/]?/,  // Year patterns (2020-2099)
    /\d{4}\/\d{2}\/\d{2}/,              // Date format in URL
    /\/(how|what|why|when|where|guide|tips|best|top)-/i  // Article-style keywords
  ];

  // Page indicators in URL
  const pageUrlPatterns = [
    /\/features?\/?$/i, /\/pricing\/?$/i, /\/contact\/?$/i,
    /\/about\/?$/i, /\/services?\/?$/i, /\/products?\/?$/i,
    /\/demo\/?$/i, /\/signup\/?$/i, /\/login\/?$/i
  ];

  postUrlPatterns.forEach(pattern => {
    if (pattern.test(urlPath)) postScore += 2;
  });

  pageUrlPatterns.forEach(pattern => {
    if (pattern.test(urlPath)) pageScore += 2;
  });

  // URL segment count (articles often have more segments)
  if (pathSegments.length > 3) postScore += 1;
    else if (pathSegments.length <= 2) pageScore += 1;

  // URL length heuristic (longer URLs often indicate articles)
  if (lastSegment.length > 40) postScore += 1;
    else if (lastSegment.length < 20) pageScore += 1;

  // Check for common page keywords in last segment
  const pageKeywords = ['pricing', 'contact', 'about', 'services', 'products',
    'features', 'demo', 'signup', 'login', 'register', 'tool', 'calculator'];
  pageKeywords.forEach(keyword => {
    if (lastSegment.includes(keyword)) pageScore += 2;
  });

  console.log(`[URL Detection] ${url} | Page: ${pageScore} | Post: ${postScore}`);
  return postScore > pageScore ? 'post' : 'page';
},

// Tracking
getTrackingData: async (websiteId?: string): Promise<{ targets: KeywordTarget[], rankings: KeywordRanking[] }> => {
  if (MockService.isSupabaseActive() && websiteId) {
    const targets = await SupabaseService.getKeywordTargets(websiteId);
    const targetIds = targets.map(t => t.id);
    const rankings = await SupabaseService.getKeywordRankings(targetIds);
    return { targets, rankings };
  }
  await delay(200);
  return {
    targets: websiteId ? MOCK_TARGETS.filter(t => t.websiteId === websiteId) : MOCK_TARGETS,
    rankings: MOCK_RANKINGS
  };
},

  addTrackingTarget: async (target: KeywordTarget): Promise<void> => {
    if (MockService.isSupabaseActive()) {
      await SupabaseService.addKeywordTarget(target);
      return;
    }
    MOCK_TARGETS.push(target);
    saveData(STORAGE_KEYS.TARGETS, MOCK_TARGETS);
  },

    deleteTrackingTarget: async (id: string): Promise<void> => {
      if (MockService.isSupabaseActive()) {
        await SupabaseService.deleteKeywordTarget(id);
        return;
      }
      const index = MOCK_TARGETS.findIndex(t => t.id === id);
      if (index !== -1) {
        MOCK_TARGETS.splice(index, 1);
        saveData(STORAGE_KEYS.TARGETS, MOCK_TARGETS);
      }
    },

      // Work
      getWorkItems: async (websiteId?: string): Promise<WorkItem[]> => {
        if (MockService.isSupabaseActive()) {
          return SupabaseService.getWorkItems(websiteId);
        }
        await delay(200);
        return MOCK_WORK;
      },

        syncWorkTasks: async (websiteId?: string): Promise<void> => {
          let campaigns: { id: string, sourceTitle: string, sourceUrl?: string, websiteId: string }[] = [];

          const fetchCampaignsForSite = async (sid: string) => {
            let site: Website | undefined;
            if (MockService.isSupabaseActive()) {
              const sites = await SupabaseService.getWebsites();
              site = sites.find(w => w.id === sid);
            } else {
              site = MOCK_WEBSITES.find(w => w.id === sid);
            }
            if (!site) return [];

            const currentCamps: typeof campaigns = [];
            const pages = await MockService.getPages(sid);
            pages.filter(p => p.mwCampaignId).forEach(p => currentCamps.push({ id: p.mwCampaignId!, sourceTitle: p.title, sourceUrl: p.url, websiteId: sid }));

            const posts = await MockService.getPosts(sid);
            posts.filter(p => p.mwCampaignId).forEach(p => currentCamps.push({ id: p.mwCampaignId!, sourceTitle: p.title, sourceUrl: p.url, websiteId: sid }));

            if (site.socialLinks) {
              site.socialLinks.filter(s => s.mwCampaignId).forEach(s => {
                currentCamps.push({ id: s.mwCampaignId!, sourceTitle: `${s.platform} Profile`, sourceUrl: s.url, websiteId: sid });
              });
            }

            const externals = await MockService.getExternalLinks(sid);
            externals.filter(e => e.mwCampaignId).forEach(e => {
              let url = e.landingPageDomain;
              if (url && !url.startsWith('http')) url = 'https://' + url;
              currentCamps.push({ id: e.mwCampaignId!, sourceTitle: e.title, sourceUrl: url, websiteId: sid });
            });

            return currentCamps;
          };

          // 1. Fetch ALL currently active campaigns from Microworkers to verify what's "Live"
          let liveCampaignIds = new Set<string>();
          try {
            const liveRes = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns`);
            if (liveRes.ok) {
              const liveData = await liveRes.json();
              const items = liveData.items || liveData.campaigns || [];
              items.forEach((c: any) => {
                // Consider RUNNING, FINISHED, PAUSED, and STOPPED as valid for checking tasks
                // Basically anything that isn't deleted or rejected
                if (['RUNNING', 'FINISHED', 'PAUSED', 'STOPPED'].includes(c.status)) {
                  liveCampaignIds.add(c.id);
                }
              });
              console.log(`[MW Sync] Verified ${liveCampaignIds.size} live campaigns from API.`);
            }
          } catch (e) {
            console.warn("[MW Sync] Could not fetch live campaign list, falling back to all known IDs.", e);
          }

          if (websiteId) {
            campaigns = await fetchCampaignsForSite(websiteId);
          } else {
            const sites = await (MockService.isSupabaseActive() ? SupabaseService.getWebsites() : Promise.resolve(MOCK_WEBSITES));
            for (const s of sites) {
              const c = await fetchCampaignsForSite(s.id);
              campaigns.push(...c);
            }
          }

          // Filter: Only sync campaigns that are actually in the "Live" list from MW
          // This solves the 404 issue for deleted/archived campaigns
          if (liveCampaignIds.size > 0) {
            const originalCount = campaigns.length;
            campaigns = campaigns.filter(c => liveCampaignIds.has(c.id));
            console.log(`[MW Sync] Filtered ${originalCount} down to ${campaigns.length} live campaigns.`);
          } else if (!websiteId) {
            // If Global Sync and we couldn't fetch live IDs, 
            // DON'T fallback to all known campaigns because it will trigger 404s for old ones.
            console.warn("[MW Sync] No live campaigns found from API. Skipping global sync to avoid 404 errors.");
            return;
          }

          if (campaigns.length === 0) return;

          try {
            for (const camp of campaigns) {
              console.log(`[MW Sync] Fetching tasks for campaign: ${camp.id} (${camp.sourceTitle})`);

              let mwTasks: any[] = [];
              let fetchSuccess = false;

              // For "Only Live Tasks", we primarily care about SUBMITTED (NOTRATED)
              // If the user wants to see finished/rated ones, they are in the 'Reviewed' section
              const statusFilters = ['SUBMITTED', 'REVISION_NEEDED'];

              for (const statusFilter of statusFilters) {
                try {
                  const url = statusFilter
                    ? `${BACKEND_URL}/api/mw/campaigns/${camp.id}/tasks?status=${statusFilter}&limit=100`
                    : `${BACKEND_URL}/api/mw/campaigns/${camp.id}/tasks?limit=100`;

                  console.log(`[MW Sync] Trying: ${url}`);
                  const response = await fetchWithNetworkCheck(url);

                  if (response.ok) {
                    const data = await response.json();

                    // Robust task detection (MW v2 uses 'items' or 'slots', v1 used 'tasks')
                    let tasks: any[] = [];
                    if (Array.isArray(data)) {
                      tasks = data;
                    } else if (data.items && Array.isArray(data.items)) {
                      tasks = data.items;
                    } else if (data.slots && Array.isArray(data.slots)) {
                      tasks = data.slots;
                    } else if (data.tasks && Array.isArray(data.tasks)) {
                      tasks = data.tasks;
                    }

                    // Merge tasks (avoid duplicates by ID)
                    tasks.forEach((task: any) => {
                      const taskId = task.id || task.taskId || task.TId;
                      if (taskId) {
                        const existingIndex = mwTasks.findIndex(t => (t.id === taskId || t.taskId === taskId));
                        if (existingIndex === -1) {
                          mwTasks.push(task);
                        } else {
                          // Update existing if new data has status or proofs
                          mwTasks[existingIndex] = { ...mwTasks[existingIndex], ...task };
                        }
                      }
                    });

                    fetchSuccess = true;
                  } else {
                    console.warn(`[MW Sync] Failed with status "${statusFilter}": ${response.status}`);
                  }
                } catch (err: any) {
                  console.warn(`[MW Sync] Error with status "${statusFilter}": ${err.message}`);
                }
              }

              if (!fetchSuccess || mwTasks.length === 0) {
                console.log(`[MW Sync] No tasks found for campaign ${camp.id}`);
                continue;
              }

              for (const mwTask of mwTasks) {
                const mwTaskRealId = mwTask.id || mwTask.taskId || mwTask.TId;
                const mwId = `mw_${mwTaskRealId}`;

                const { data: existing } = await supabase.from('work_items').select('*').eq('id', mwId).maybeSingle();

                // Map MW status to internal WorkItem status
                const mwStatusOriginal = (mwTask.status || '').toUpperCase();
                let mappedStatus: WorkItem['status'] = 'completed'; // Default to Need Review

                if (['RATED', 'APPROVED', 'FINISHED', 'DONE'].includes(mwStatusOriginal)) mappedStatus = 'done';
                else if (['DENIED', 'REJECTED'].includes(mwStatusOriginal)) mappedStatus = 'rejected';
                else if (['REVISION_NEEDED', 'REVISE'].includes(mwStatusOriginal)) mappedStatus = 'needs_revision';
                else if (['QUIT', 'SYSTEM_REJECTED'].includes(mwStatusOriginal)) mappedStatus = 'todo'; // Or remove?

                // Logic to determine if we need to fetch details or update status
                // Update if: New task, missing proof, or status changed on MW
                const isNew = !existing;
                const missingProof = !existing?.proof_link;
                const statusChanged = existing && existing.status !== mappedStatus && existing.status === 'completed'; // Only auto-update if it was pending review

                if (isNew || missingProof || statusChanged) {
                  let fullTask = mwTask;
                  if (isNew || missingProof) {
                    try {
                      const detailRes = await fetchWithNetworkCheck(`${BACKEND_URL}/api/mw/campaigns/${camp.id}/tasks/${mwTaskRealId}`);
                      if (detailRes.ok) {
                        fullTask = await detailRes.json();
                      }
                    } catch (e) {
                      console.warn(`[MW Sync] Could not fetch details for ${mwId}`);
                    }
                  }

                  let workerId = fullTask.workerId || fullTask.worker_id || 'unknown';
                  if (workerId === 'unknown' && typeof mwTaskRealId === 'string') {
                    const parts = mwTaskRealId.split('_');
                    if (parts.length >= 3) workerId = parts[2];
                  }

                  // Comprehensive proof extractor for all Microworkers campaign types
                  const collectAllProofs = (taskObj: any) => {
                    const textProofs: { question: string, answer: string }[] = [];
                    const fileProofs: { url: string, name?: string }[] = [];

                    // 1. Check for TTV structured answers
                    const rawAnswers = taskObj.answers || taskObj.items || [];
                    if (Array.isArray(rawAnswers)) {
                      rawAnswers.forEach((ans: any, idx: number) => {
                        const q = ans.title || ans.question || `Proof ${idx + 1}`;
                        const a = ans.value || ans.text || ans.answer || '';
                        if (a) textProofs.push({ question: q, answer: String(a) });
                      });
                    } else if (typeof rawAnswers === 'object' && rawAnswers !== null) {
                      // Sometimes it's a map
                      Object.entries(rawAnswers).forEach(([key, val]) => {
                        textProofs.push({ question: key, answer: String(val) });
                      });
                    }

                    // 2. Check for file proofs
                    const rawFiles = taskObj.fileProofs || taskObj.files || [];
                    if (Array.isArray(rawFiles)) {
                      rawFiles.forEach((f: any) => {
                        const url = typeof f === 'string' ? f : (f.url || f.link);
                        if (url) fileProofs.push({ url, name: f.filename || f.name || 'Screenshot' });
                      });
                    }

                    // 3. Fallback: Search the object for anything that looks like a proof URL if empty
                    if (textProofs.length === 0 && fileProofs.length === 0) {
                      const search = (item: any) => {
                        if (!item) return;
                        if (typeof item === 'string') {
                          const val = item.trim();
                          if (/^https?:\/\//i.test(val)) {
                            if (val.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i) || val.includes('snipboard.io') || val.includes('prnt.sc')) {
                              fileProofs.push({ url: val, name: 'Proof Link' });
                            } else {
                              textProofs.push({ question: 'Proof', answer: val });
                            }
                          } else if (val.length > 5 && val.includes(' ') && !val.includes('_')) {
                            textProofs.push({ question: 'Proof', answer: val });
                          }
                        } else if (Array.isArray(item)) {
                          item.forEach(search);
                        } else if (typeof item === 'object') {
                          Object.values(item).forEach(search);
                        }
                      };
                      search(taskObj);
                    }

                    return { textProofs, fileProofs };
                  };

                  const extracted = collectAllProofs(fullTask);
                  const proofLink = extracted.fileProofs[0]?.url || extracted.textProofs[0]?.answer || '';

                  // Debug info if proof is missing
                  let debugInfo = '';
                  if (!proofLink) {
                    const keys = Object.keys(fullTask).filter(k => !['description', 'id'].includes(k));
                    debugInfo = `\n[No proof found. Keys: ${keys.join(', ')}]`;
                  }

                  const newItem: WorkItem = {
                    id: mwId,
                    websiteId: camp.websiteId,
                    title: `Verify: ${camp.sourceTitle}`,
                    description: `Worker ${workerId} submitted proof for ${camp.sourceTitle}${debugInfo}`,
                    status: mappedStatus,
                    priority: 'medium',
                    assignedToUserId: 'worker',
                    dueDate: fullTask.submittedAt?.split('T')[0] || fullTask.date || new Date().toISOString().split('T')[0],
                    workerId: workerId,
                    proofLink: proofLink,
                    proofs: extracted.textProofs,
                    fileProofs: extracted.fileProofs,
                    mwCampaignId: camp.id,
                    targetUrl: camp.sourceUrl
                  };

                  const { error: saveErr } = await supabase.from('work_items').upsert([{
                    id: newItem.id,
                    website_id: newItem.websiteId,
                    title: newItem.title,
                    description: newItem.description,
                    status: newItem.status,
                    priority: newItem.priority,
                    assigned_to_user_id: newItem.assignedToUserId,
                    due_date: newItem.dueDate,
                    worker_id: newItem.workerId,
                    proof_link: newItem.proofLink,
                    proofs: newItem.proofs,
                    file_proofs: newItem.fileProofs,
                    mw_campaign_id: newItem.mwCampaignId,
                    target_url: newItem.targetUrl
                  }]);

                  if (saveErr) {
                    console.error(`[MW Sync] Supabase Save Error for ${mwId}:`, saveErr);
                  } else {
                    console.log(`[MW Sync] Saved task ${mwId} (Status: ${newItem.status})`);
                  }
                }
              }
            }
            if (!MockService.isSupabaseActive()) {
              saveData(STORAGE_KEYS.WORK, MOCK_WORK);
            }
          } catch (error) {
            console.error("Failed to sync Microworkers tasks:", error);
            throw error;
          }
        },

          addWorkItem: async (item: WorkItem): Promise<void> => {
            if (MockService.isSupabaseActive()) {
              await supabase.from('work_items').insert([{
                id: item.id.includes('-') ? item.id : undefined,
                website_id: item.websiteId,
                title: item.title,
                description: item.description,
                assigned_to_user_id: item.assignedToUserId,
                due_date: item.dueDate,
                status: item.status,
                priority: item.priority,
                proof_link: item.proofLink,
                worker_id: item.workerId,
                mw_campaign_id: item.mwCampaignId,
                rejection_reason: item.rejectionReason
              }]);
              return;
            }
            MOCK_WORK.push(item);
          },

            updateWorkItemStatus: async (id: string, status: WorkItem['status'], reason?: string, campaignId?: string): Promise<void> => {
              // 1. If it's a Microworkers task (starts with mw_), try to rate it on MW
              if (id.startsWith('mw_')) {
                // Use provided campaignId or try to find it in existing tasks
                let finalCampId = campaignId;
                if (!finalCampId && MockService.isSupabaseActive()) {
                  const { data } = await supabase.from('work_items').select('mw_campaign_id').eq('id', id).maybeSingle();
                  finalCampId = data?.mw_campaign_id;
                }

                if (finalCampId) {
                  const mwTaskId = id.replace('mw_', '');
                  let rating: 'OK' | 'NOK' | 'REVISE' | null = null;
                  if (status === 'done') rating = 'OK';
                  if (status === 'rejected') rating = 'NOK';
                  if (status === 'needs_revision') rating = 'REVISE';

                  if (rating) {
                    try {
                      await MockService.rateMicroworkersTask(finalCampId, mwTaskId, rating, reason);
                    } catch (e: any) {
                      console.error("MW Rating failed:", e);
                      throw new Error(`Failed to rate task on Microworkers: ${e.message}`);
                    }
                  }
                } else {
                  console.warn(`[MW] Could not find campaign ID for task ${id}, skipping MW rating.`);
                }
              }

              if (MockService.isSupabaseActive()) {
                await SupabaseService.updateWorkItemStatus(id, status, reason);
                return;
              }
              const item = MOCK_WORK.find(w => w.id === id);
              if (item) {
                item.status = status;
                if (reason) item.rejectionReason = reason;
                saveData(STORAGE_KEYS.WORK, MOCK_WORK);
              }
            },

              deleteWorkItem: async (id: string): Promise<void> => {
                if (MockService.isSupabaseActive()) {
                  await SupabaseService.deleteWorkItem(id);
                  return;
                }
                const idx = MOCK_WORK.findIndex(w => w.id === id);
                if (idx !== -1) {
                  MOCK_WORK.splice(idx, 1);
                  saveData(STORAGE_KEYS.WORK, MOCK_WORK);
                }
              },

                // --- Templates ---
                getTemplates: async (): Promise<Template[]> => {
                  // Note: Templates are currently only local/mock based because Supabase schema might not have it yet.
                  await delay(100);
                  return MOCK_TEMPLATES;
                },

                  getTemplate: async (id: string): Promise<Template | undefined> => {
                    await delay(100);
                    return MOCK_TEMPLATES.find(t => t.id === id);
                  },

                    updateTemplate: async (id: string, updates: Partial<Template>): Promise<void> => {
                      await delay(200);
                      const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
                      if (index !== -1) {
                        MOCK_TEMPLATES[index] = { ...MOCK_TEMPLATES[index], ...updates };
                        saveData(STORAGE_KEYS.TEMPLATES, MOCK_TEMPLATES);
                      }
                    },



                      // Bulk Actions
                      bulkUpdateStatus: async (ids: string[], status: 'published' | 'draft' | 'ready', type: 'pages' | 'posts' | 'social', websiteId?: string): Promise<void> => {
                        if (type === 'pages') {
                          if (MockService.isSupabaseActive()) {
                            const { error } = await supabase.from('pages').update({ status }).in('id', ids);
                            if (error) throw error;
                            return;
                          }
                          ids.forEach(id => {
                            const p = MOCK_PAGES.find(x => x.id === id);
                            if (p) p.status = status;
                          });
                          saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
                        } else if (type === 'posts') {
                          if (MockService.isSupabaseActive()) {
                            const { error } = await supabase.from('posts').update({ status }).in('id', ids);
                            if (error) throw error;
                            return;
                          }
                          ids.forEach(id => {
                            const p = MOCK_POSTS.find(x => x.id === id);
                            if (p) p.status = status;
                          });
                          saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
                        } else if (type === 'social' && websiteId) {
                          if (MockService.isSupabaseActive()) {
                            const { error } = await supabase.from('social_links').update({ status }).in('id', ids);
                            if (error) throw error;
                            return;
                          }
                          const site = MOCK_WEBSITES.find(w => w.id === websiteId);
                          if (site && site.socialLinks) {
                            ids.forEach(id => {
                              const s = site.socialLinks!.find(x => x.id === id);
                              if (s) s.status = status;
                            });
                          }
                          saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
                        }
                      },

                        bulkDelete: async (ids: string[], type: 'pages' | 'posts' | 'social', websiteId?: string): Promise<void> => {
                          if (type === 'pages') {
                            if (MockService.isSupabaseActive()) {
                              const { error } = await supabase.from('pages').delete().in('id', ids);
                              if (error) throw error;
                              return;
                            }
                            ids.forEach(id => {
                              const idx = MOCK_PAGES.findIndex(x => x.id === id);
                              if (idx !== -1) MOCK_PAGES.splice(idx, 1);
                            });
                            saveData(STORAGE_KEYS.PAGES, MOCK_PAGES);
                          } else if (type === 'posts') {
                            if (MockService.isSupabaseActive()) {
                              const { error } = await supabase.from('posts').delete().in('id', ids);
                              if (error) throw error;
                              return;
                            }
                            ids.forEach(id => {
                              const idx = MOCK_POSTS.findIndex(x => x.id === id);
                              if (idx !== -1) MOCK_POSTS.splice(idx, 1);
                            });
                            saveData(STORAGE_KEYS.POSTS, MOCK_POSTS);
                          } else if (type === 'social' && websiteId) {
                            if (MockService.isSupabaseActive()) {
                              const { error } = await supabase.from('social_links').delete().in('id', ids);
                              if (error) throw error;
                              return;
                            }
                            const site = MOCK_WEBSITES.find(w => w.id === websiteId);
                            if (site && site.socialLinks) {
                              ids.forEach(id => {
                                const idx = site.socialLinks!.findIndex(x => x.id === id);
                                if (idx !== -1) site.socialLinks!.splice(idx, 1);
                              });
                            }
                            saveData(STORAGE_KEYS.WEBSITES, MOCK_WEBSITES);
                          }
                        }
};