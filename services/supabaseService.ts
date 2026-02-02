import { supabase } from './supabaseClient';
import { Website, Page, Post, WorkItem, SocialLink, Permission, User, ExternalLink, KeywordTarget, KeywordRanking } from '../types';
import { ADMIN_PERMISSIONS, DEFAULT_PERMISSIONS } from './mockService';

export const SupabaseService = {
    // --- Websites ---
    getWebsites: async (userId?: string): Promise<Website[]> => {
        try {
            let query = supabase
                .from('websites')
                .select('*, social_links(*)');

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Supabase getWebsites error:", error);
                return [];
            }

            return (data || []).map(w => ({
                id: w.id,
                name: w.name,
                url: w.url,
                category: w.category,
                notes: w.notes,
                status: w.status,
                gscConnected: w.gsc_connected,
                gscEmail: w.gsc_email,
                accessToken: w.access_token,
                refreshToken: w.refresh_token,
                lastScraped: w.last_scraped,
                socialLinks: (w.social_links || []).map((sl: any) => ({
                    id: sl.id,
                    platform: sl.platform,
                    url: sl.url,
                    isWorkEnabled: !!sl.is_work_enabled,
                    mwCampaignId: sl.mw_campaign_id
                }))
            }));
        } catch (err) {
            console.error("Supabase Service unreachable:", err);
            return [];
        }
    },

    addWebsite: async (website: Website, userId?: string): Promise<Website> => {
        const { data, error } = await supabase
            .from('websites')
            .insert([{
                user_id: userId,
                name: website.name,
                url: website.url,
                category: website.category,
                notes: website.notes,
                status: website.status || 'active',
                gsc_connected: website.gscConnected,
                gsc_email: website.gscEmail,
                access_token: website.accessToken,
                refresh_token: website.refreshToken
            }])
            .select();

        if (error) {
            console.error("Supabase Save Error:", error);
            throw new Error(`${error.message} (${error.code})`);
        }

        if (!data || data.length === 0) {
            throw new Error("Database did not return any data after saving.");
        }

        return data[0];
    },

    updateWebsite: async (website: Website): Promise<void> => {
        // 1. Update basic info
        const { error: siteError } = await supabase
            .from('websites')
            .update({
                name: website.name,
                url: website.url,
                category: website.category,
                notes: website.notes,
                status: website.status,
                gsc_connected: website.gscConnected,
                gsc_email: website.gscEmail,
                access_token: website.accessToken,
                refresh_token: website.refreshToken,
                last_scraped: website.lastScraped
            })
            .eq('id', website.id);

        if (siteError) throw siteError;

        // 2. Sync social links
        if (website.socialLinks) {
            // Get current links to identify deletions
            const { data: existingLinks } = await supabase
                .from('social_links')
                .select('id')
                .eq('website_id', website.id);

            const newIds = website.socialLinks
                .map(l => l.id)
                .filter(id => id && id.includes('-')); // Only UUIDs

            if (existingLinks) {
                const idsToDelete = existingLinks
                    .map(l => l.id)
                    .filter(id => !newIds.includes(id));

                if (idsToDelete.length > 0) {
                    await supabase
                        .from('social_links')
                        .delete()
                        .in('id', idsToDelete);
                }
            }

            const linksToSync = website.socialLinks.filter(l => l.url && l.url.trim() !== "");

            for (const link of linksToSync) {
                const { error: socialError } = await supabase
                    .from('social_links')
                    .upsert({
                        id: (link.id && link.id.includes('-')) ? link.id : undefined,
                        website_id: website.id,
                        platform: link.platform,
                        url: link.url,
                        is_work_enabled: link.isWorkEnabled,
                        mw_campaign_id: link.mwCampaignId
                    });
                if (socialError) console.warn("Social link sync error:", socialError);
            }
        }
    },

    deleteWebsite: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('websites')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Pages ---
    getPages: async (websiteId: string): Promise<Page[]> => {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('website_id', websiteId);

            if (error) {
                console.error("Supabase getPages error:", error);
                return [];
            }
            return (data || []).map(p => ({
                ...p,
                websiteId: p.website_id,
                isWorkEnabled: p.is_work_enabled,
                mwCampaignId: p.mw_campaign_id,
                mwTemplateId: p.mw_template_id,
                pagePosition: p.page_position,
                resultText: p.result_text,
                metaTitle: p.meta_title,
                metaDescription: p.meta_description
            }));
        } catch (err) {
            return [];
        }
    },

    addPage: async (page: Page): Promise<void> => {
        // If the ID is a short mock ID (no hyphens), generate a real UUID
        const finalId = page.id.includes('-') ? page.id : crypto.randomUUID();

        const { error } = await supabase
            .from('pages')
            .insert([{
                id: finalId,
                website_id: page.websiteId,
                url: page.url,
                title: page.title,
                status: page.status,
                keyword: page.keyword,
                category: page.category,
                page_position: page.pagePosition,
                result_text: page.resultText,
                meta_title: page.metaTitle,
                meta_description: page.metaDescription,
                content: page.content,
                faqs: page.faqs,
                links: page.links,
                is_work_enabled: page.isWorkEnabled,
                mw_campaign_id: page.mwCampaignId,
                mw_template_id: page.mwTemplateId
            }]);
        if (error) {
            console.error("Supabase addPage Error:", error);
            throw error;
        }
    },

    updatePage: async (page: Page): Promise<void> => {
        const payload: any = {
            url: page.url,
            title: page.title,
            status: page.status,
            keyword: page.keyword,
            category: page.category,
            page_position: page.pagePosition,
            result_text: page.resultText,
            meta_title: page.metaTitle,
            meta_description: page.metaDescription,
            content: page.content,
            faqs: page.faqs,
            links: page.links,
            is_work_enabled: page.isWorkEnabled,
            mw_campaign_id: page.mwCampaignId,
            mw_template_id: page.mwTemplateId,
            last_edited: page.lastEdited
        };

        const { error } = await supabase
            .from('pages')
            .update(payload)
            .eq('id', page.id);

        if (error) {
            // Retry without last_edited if column missing
            if (error.code === 'PGRST204' && error.message.includes('last_edited')) {
                delete payload.last_edited;
                const { error: retryError } = await supabase.from('pages').update(payload).eq('id', page.id);
                if (retryError) throw retryError;
                return;
            }
            throw error;
        }
    },

    updatePageDetails: async (id: string, details: Partial<Page>): Promise<void> => {
        const mapped: any = { ...details };
        if (details.pagePosition !== undefined) {
            mapped.page_position = details.pagePosition;
            delete mapped.pagePosition;
        }
        if (details.resultText !== undefined) {
            mapped.result_text = details.resultText;
            delete mapped.resultText;
        }
        if (details.metaTitle !== undefined) {
            mapped.meta_title = details.metaTitle;
            delete mapped.metaTitle;
        }
        if (details.metaDescription !== undefined) {
            mapped.meta_description = details.metaDescription;
            delete mapped.metaDescription;
        }
        if (details.isWorkEnabled !== undefined) {
            mapped.is_work_enabled = details.isWorkEnabled;
            delete mapped.isWorkEnabled;
        }
        if (details.mwCampaignId !== undefined) {
            mapped.mw_campaign_id = details.mwCampaignId;
            delete mapped.mwCampaignId;
        }
        if (details.mwTemplateId !== undefined) {
            mapped.mw_template_id = details.mwTemplateId;
            delete mapped.mwTemplateId;
        }
        if (details.websiteId !== undefined) {
            mapped.website_id = details.websiteId;
            delete mapped.websiteId;
        }
        if (details.content !== undefined) {
            mapped.content = details.content;
            // No need to delete usually if key matches, but 'content' in Page is 'content' in DB?
            // If DB column is 'content', then 'mapped.content' is correct because we did { ...details }.
            // However, to be safe and explicit like others:
            // mapped.content = details.content; (already there from spread)
        }
        if (details.faqs !== undefined) {
            mapped.faqs = details.faqs;
        }
        if (details.lastEdited !== undefined) {
            mapped.last_edited = details.lastEdited;
            delete mapped.lastEdited;
        }

        const { error } = await supabase
            .from('pages')
            .update(mapped)
            .eq('id', id);

        if (error) {
            if (error.code === 'PGRST204' && error.message.includes('last_edited')) {
                delete mapped.last_edited;
                const { error: retryError } = await supabase.from('pages').update(mapped).eq('id', id);
                if (retryError) throw retryError;
                return;
            }
            throw error;
        }
    },

    deletePage: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('pages')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Posts ---
    getPosts: async (websiteId: string): Promise<Post[]> => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('website_id', websiteId);

        if (error) throw error;
        return (data || []).map(p => ({
            ...p,
            websiteId: p.website_id,
            publishDate: p.publish_date,
            isWorkEnabled: p.is_work_enabled,
            mwCampaignId: p.mw_campaign_id,
            mwTemplateId: p.mw_template_id,
            pagePosition: p.page_position,
            resultText: p.result_text,
            metaTitle: p.meta_title,
            metaDescription: p.meta_description,
            searchQuery: p.search_query
        }));
    },

    addPost: async (post: Post): Promise<void> => {
        // If the ID is a short mock ID (no hyphens), generate a real UUID
        const finalId = post.id.includes('-') ? post.id : crypto.randomUUID();

        const { error } = await supabase
            .from('posts')
            .insert([{
                id: finalId,
                website_id: post.websiteId,
                url: post.url,
                title: post.title,
                status: post.status,
                publish_date: post.publishDate || null,
                keywords: post.keywords,
                search_query: post.searchQuery,
                page_position: post.pagePosition,
                result_text: post.resultText,
                meta_title: post.metaTitle,
                meta_description: post.metaDescription,
                content: post.content,
                faqs: post.faqs,
                is_work_enabled: post.isWorkEnabled,
                mw_campaign_id: post.mwCampaignId,
                mw_template_id: post.mwTemplateId
            }]);
        if (error) {
            console.error("Supabase addPost Error:", error);
            throw error;
        }
    },

    updatePost: async (post: Post): Promise<void> => {
        const payload: any = {
            url: post.url,
            title: post.title,
            status: post.status,
            publish_date: post.publishDate || null,
            keywords: post.keywords,
            search_query: post.searchQuery,
            page_position: post.pagePosition,
            result_text: post.resultText,
            meta_title: post.metaTitle,
            meta_description: post.metaDescription,
            is_work_enabled: post.isWorkEnabled,
            mw_campaign_id: post.mwCampaignId,
            mw_template_id: post.mwTemplateId,
            last_edited: post.lastEdited
        };

        const { error } = await supabase
            .from('posts')
            .update(payload)
            .eq('id', post.id);

        if (error) {
            if (error.code === 'PGRST204' && error.message.includes('last_edited')) {
                delete payload.last_edited;
                const { error: retryError } = await supabase.from('posts').update(payload).eq('id', post.id);
                if (retryError) throw retryError;
                return;
            }
            throw error;
        }
    },

    updatePostDetails: async (id: string, details: Partial<Post>): Promise<void> => {
        const mapped: any = { ...details };
        if (details.publishDate !== undefined) {
            mapped.publish_date = details.publishDate || null;
            delete mapped.publishDate;
        }
        if (details.searchQuery !== undefined) {
            mapped.search_query = details.searchQuery;
            delete mapped.searchQuery;
        }
        if (details.pagePosition !== undefined) {
            mapped.page_position = details.pagePosition;
            delete mapped.pagePosition;
        }
        if (details.content !== undefined) {
            mapped.content = details.content;
        }
        if (details.faqs !== undefined) {
            mapped.faqs = details.faqs;
        }
        if (details.resultText !== undefined) {
            mapped.result_text = details.resultText;
            delete mapped.resultText;
        }
        if (details.metaTitle !== undefined) {
            mapped.meta_title = details.metaTitle;
            delete mapped.metaTitle;
        }
        if (details.metaDescription !== undefined) {
            mapped.meta_description = details.metaDescription;
            delete mapped.metaDescription;
        }
        if (details.isWorkEnabled !== undefined) {
            mapped.is_work_enabled = details.isWorkEnabled;
            delete mapped.isWorkEnabled;
        }
        if (details.mwCampaignId !== undefined) {
            mapped.mw_campaign_id = details.mwCampaignId;
            delete mapped.mwCampaignId;
        }
        if (details.mwTemplateId !== undefined) {
            mapped.mw_template_id = details.mwTemplateId;
            delete mapped.mwTemplateId;
        }
        if (details.websiteId !== undefined) {
            mapped.website_id = details.websiteId;
            delete mapped.websiteId;
        }
        if (details.lastEdited !== undefined) {
            mapped.last_edited = details.lastEdited;
            delete mapped.lastEdited;
        }

        const { error } = await supabase
            .from('posts')
            .update(mapped)
            .eq('id', id);

        if (error) {
            if (error.code === 'PGRST204' && error.message.includes('last_edited')) {
                delete mapped.last_edited;
                const { error: retryError } = await supabase.from('posts').update(mapped).eq('id', id);
                if (retryError) throw retryError;
                return;
            }
            throw error;
        }
    },

    deletePost: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Work Items ---
    getWorkItems: async (websiteId?: string): Promise<WorkItem[]> => {
        let query = supabase.from('work_items').select('*');
        if (websiteId) query = query.eq('website_id', websiteId);

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(w => ({
            ...w,
            websiteId: w.website_id,
            assignedToUserId: w.assigned_to_user_id,
            dueDate: w.due_date,
            proofLink: w.proof_link,
            proofs: w.proofs,
            fileProofs: w.file_proofs,
            workerId: w.worker_id,
            mwCampaignId: w.mw_campaign_id,
            rejectionReason: w.rejection_reason,
            targetUrl: w.target_url
        }));
    },

    updateWorkItemStatus: async (id: string, status: WorkItem['status'], reason?: string): Promise<void> => {
        const { error } = await supabase
            .from('work_items')
            .update({
                status,
                rejection_reason: reason
            })
            .eq('id', id);
        if (error) throw error;
    },

    deleteWorkItem: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('work_items')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- External Links ---
    getExternalLinks: async (websiteId: string): Promise<ExternalLink[]> => {
        const { data, error } = await supabase
            .from('external_links')
            .select('*')
            .eq('website_id', websiteId);

        if (error) throw error;
        return (data || []).map(p => ({
            ...p,
            websiteId: p.website_id,
            articleTitle: p.article_title,
            landingPageDomain: p.landing_page_domain,
            isWorkEnabled: p.is_work_enabled,
            mwCampaignId: p.mw_campaign_id,
            mwTemplateId: p.mw_template_id
        }));
    },

    addExternalLink: async (link: ExternalLink): Promise<void> => {
        const { error } = await supabase
            .from('external_links')
            .insert([{
                website_id: link.websiteId,
                title: link.title,
                keyword: link.keyword,
                article_title: link.articleTitle,
                landing_page_domain: link.landingPageDomain,
                is_work_enabled: link.isWorkEnabled,
                mw_campaign_id: link.mwCampaignId,
                mw_template_id: link.mwTemplateId
            }]);
        if (error) throw error;
    },

    updateExternalLinkDetails: async (id: string, details: Partial<ExternalLink>): Promise<void> => {
        const mapped: any = { ...details };
        if (details.websiteId !== undefined) {
            mapped.website_id = details.websiteId;
            delete mapped.websiteId;
        }
        if (details.articleTitle !== undefined) {
            mapped.article_title = details.articleTitle;
            delete mapped.articleTitle;
        }
        if (details.landingPageDomain !== undefined) {
            mapped.landing_page_domain = details.landingPageDomain;
            delete mapped.landingPageDomain;
        }
        if (details.isWorkEnabled !== undefined) {
            mapped.is_work_enabled = details.isWorkEnabled;
            delete mapped.isWorkEnabled;
        }
        if (details.mwCampaignId !== undefined) {
            mapped.mw_campaign_id = details.mwCampaignId;
            delete mapped.mwCampaignId;
        }
        if (details.mwTemplateId !== undefined) {
            mapped.mw_template_id = details.mwTemplateId;
            delete mapped.mwTemplateId;
        }

        const { error } = await supabase
            .from('external_links')
            .update(mapped)
            .eq('id', id);
        if (error) throw error;
    },

    deleteExternalLink: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('external_links')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- SEO Tracking ---
    getKeywordTargets: async (websiteId: string): Promise<KeywordTarget[]> => {
        const { data, error } = await supabase
            .from('keyword_targets')
            .select('*')
            .eq('website_id', websiteId);

        if (error) throw error;
        return (data || []).map(t => ({
            id: t.id,
            websiteId: t.website_id,
            keyword: t.keyword,
            targetUrl: t.target_url,
            tags: t.tags || []
        }));
    },

    getKeywordRankings: async (targetIds: string[]): Promise<KeywordRanking[]> => {
        if (targetIds.length === 0) return [];
        const { data, error } = await supabase
            .from('keyword_rankings')
            .select('*')
            .in('target_id', targetIds);

        if (error) throw error;
        return (data || []).map(r => ({
            id: r.id,
            targetId: r.target_id,
            date: r.date,
            position: r.position,
            searchQuery: r.search_query,
            pagePosition: r.page_position,
            pagesAvailable: r.pages_available
        }));
    },

    addKeywordTarget: async (target: KeywordTarget): Promise<void> => {
        const { error } = await supabase
            .from('keyword_targets')
            .insert([{
                website_id: target.websiteId,
                keyword: target.keyword,
                target_url: target.targetUrl,
                tags: target.tags
            }]);
        if (error) throw error;
    },

    deleteKeywordTarget: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('keyword_targets')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Users & Permissions ---
    getUsers: async (): Promise<User[]> => {
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*, permissions(*)');

        if (profileError) throw profileError;

        return (profiles || []).map(p => ({
            id: p.id,
            name: p.full_name || p.email.split('@')[0],
            email: p.email,
            role: p.role,
            permissions: (p.permissions || []).map((perm: any) => ({
                module: perm.module,
                canView: perm.can_view,
                canEdit: perm.can_edit,
                canDelete: perm.can_delete
            }))
        }));
    },

    updateUser: async (userId: string, updates: Partial<User>): Promise<void> => {
        const mapped: any = {};
        if (updates.name) mapped.full_name = updates.name;
        if (updates.role) mapped.role = updates.role;
        if (updates.email) mapped.email = updates.email;

        if (Object.keys(mapped).length > 0) {
            const { error } = await supabase
                .from('profiles')
                .update(mapped)
                .eq('id', userId);
            if (error) throw error;
        }

        if (updates.permissions) {
            // Simple sync: delete all and re-insert
            await supabase.from('permissions').delete().eq('user_id', userId);
            const { error: permError } = await supabase
                .from('permissions')
                .insert(updates.permissions.map(p => ({
                    user_id: userId,
                    module: p.module,
                    can_view: p.canView,
                    can_edit: p.canEdit,
                    can_delete: p.canDelete
                })));
            if (permError) throw permError;
        }
    },

    deleteUser: async (userId: string): Promise<void> => {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        if (error) throw error;
    },

    addUser: async (name: string, email: string, role: 'admin' | 'user', password?: string): Promise<User> => {
        // 1. Create the user in Supabase Auth (this might send a confirmation email)
        const { data, error } = await supabase.auth.signUp({
            email,
            password: password || ' ZilSeoPass123!',
            options: {
                data: {
                    full_name: name,
                    role: role
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Could not create user account.");

        // 2. The profile entry is usually created by a database trigger in most Supabase setups.
        // But let's verify if we need to insert permissions manually.
        const permissions = role === 'admin' ? [...ADMIN_PERMISSIONS] : [...DEFAULT_PERMISSIONS];

        // Wait a small bit for any triggers to complete if they exist
        await new Promise(r => setTimeout(r, 500));

        // Let's ensure the user has permissions entries
        const { error: permError } = await supabase
            .from('permissions')
            .insert(permissions.map(p => ({
                user_id: data.user!.id,
                module: p.module,
                can_view: p.canView,
                can_edit: p.canEdit,
                can_delete: p.canDelete
            })));

        // Profiles are often auto-created, but let's be safe and try to insert/upsert profile details
        await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            full_name: name,
            role: role
        });

        return {
            id: data.user.id,
            name,
            email,
            role,
            permissions
        };
    }
};
