
export enum ModuleKey {
  WEBSITES = 'websites',
  GSC_CONNECTION = 'gsc_connection',
  PAGES = 'pages',
  POSTS = 'posts',
  SOCIAL = 'social',
  SEO_TRACKING = 'seo_tracking',
  CAMPAIGNS = 'campaigns',
  WORK = 'work',
  ADMIN = 'admin',
}

export interface Permission {
  module: ModuleKey;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  permissions: Permission[];
  avatar?: string;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'other';
  url: string;
  isWorkEnabled?: boolean;
  mwCampaignId?: string;
  mwTemplateId?: string;
  targetPositions?: number;
  uploadedDate?: string;
  status?: 'published' | 'draft' | 'ready';
}

export interface Website {
  id: string;
  user_id?: string;
  name: string;
  url: string;
  category: string;
  notes: string;
  status: 'active' | 'inactive' | 'maintenance';
  socialLinks: SocialLink[];
  // GSC Integration
  gscConnected?: boolean;
  gscEmail?: string;
  accessToken?: string; // OAuth2 Access Token for real API calls
  refreshToken?: string; // OAuth2 Refresh Token for long-term access
  lastScraped?: string; // ISO Date string of last GSC fetch
}

// Existing internal tracking types
export interface KeywordTarget {
  id: string;
  websiteId: string;
  keyword: string;
  targetUrl: string;
  tags: string[];
}

export interface KeywordRanking {
  id: string;
  targetId: string;
  date: string;
  position: number;
  searchQuery: string;
  pagePosition: number;
  pagesAvailable: number; // indexed/found
}

// New GSC Data Types
export interface GscDailyMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  positionChange: number;
}

export interface GscPageData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  positionChange: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Page {
  id: string;
  websiteId: string;
  url: string;
  title: string;
  status: 'published' | 'draft' | 'ready';
  links: PageLink[];

  // SEO & Content Fields
  keyword?: string; // Acts as default Search Query
  pagePosition?: string; // Text field for MW
  resultText?: string; // Text field for MW

  metaTitle?: string;
  metaDescription?: string;
  isWorkEnabled?: boolean; // Toggle state for MW
  mwCampaignId?: string; // Microworkers Campaign ID
  mwTemplateId?: string; // Microworkers Template ID

  faqs?: FaqItem[];
  content?: string[]; // Array of paragraphs
  category?: 'Main Page' | 'Feature Page' | 'Landing page';
  uploadedDate?: string;
  lastEdited?: string;
}

export interface Post {
  id: string;
  websiteId: string;
  title: string; // Acts as H1
  url?: string;
  status: 'published' | 'draft' | 'ready';
  publishDate: string;
  uploadedDate?: string;
  lastEdited?: string;

  // SEO & Content Fields
  keywords?: string[];
  searchQuery?: string; // Specific query for MW
  pagePosition?: string; // Text field for MW
  resultText?: string; // Text field for MW

  metaTitle?: string;
  metaDescription?: string;
  isWorkEnabled?: boolean; // Toggle state for MW
  mwCampaignId?: string; // Microworkers Campaign ID
  mwTemplateId?: string; // Microworkers Template ID

  faqs?: FaqItem[];
  content?: string[]; // Array of paragraphs
}

export interface ExternalLink {
  id: string;
  websiteId: string;
  title: string; // The campaign title
  keyword: string; // Search keyword
  articleTitle: string; // Article title fragment to locate
  landingPageDomain: string; // Target domain to find in article
  isWorkEnabled: boolean;
  mwCampaignId?: string;
  mwTemplateId?: string;
}

export interface PageLink {
  id: string;
  anchorText: string;
  url: string;
  type: 'internal' | 'external' | 'social';
  status: 'ok' | 'broken' | 'redirect';
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  websiteId?: string;
  assignedToUserId: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'completed' | 'needs_revision' | 'rejected' | 'done';
  priority: 'low' | 'medium' | 'high';
  proofLink?: string;
  proofs?: { question: string, answer: string }[];
  fileProofs?: { url: string, name?: string }[];
  workerId?: string;
  mwCampaignId?: string;
  rejectionReason?: string;
  targetUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'search_post' | 'social_engagement' | 'external_link' | 'custom';
  content: string; // HTML content with placeholders like ${keyword}
  placeholders: string[]; // List of placeholders used e.g. ['keyword', 'targetText']
}
