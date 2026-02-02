export const MwTemplates = {
    // ---------------------------------------------------------------------------
    // TEMPLATE 1: Google: Search + Visit + Share
    // ---------------------------------------------------------------------------
    getSearchPostTemplate: (keyword: string, targetText: string, landingDomain: string, endPage: number = 2) => `
<!-- Global Styles -->
<style>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700');
  .mw-container { font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
  .mw-panel { border: 1px solid #dce4ec; border-radius: 4px; margin-bottom: 25px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .mw-panel-heading { background-color: #f5f8fa; color: #333; padding: 15px 20px; border-bottom: 1px solid #dce4ec; font-weight: 700; font-size: 16px; }
  .mw-panel-body { padding: 25px; }
  
  .step-row { margin-bottom: 25px; display: flex; align-items: flex-start; }
  .step-num { flex-shrink: 0; width: 30px; height: 30px; background: #2c3e50; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 15px; }
  .step-content { flex-grow: 1; }
  .step-title { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #2c3e50; }
  
  .highlight-box { background: #fcf8e3; border: 1px solid #faebcc; padding: 10px 15px; border-radius: 4px; font-weight: bold; color: #8a6d3b; display: inline-block; margin-top: 5px; }
  .domain-tag { background: #e8f0fe; color: #1a73e8; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  
  .proof-section { background-color: #ffff; border: 1px solid #bce8f1; border-radius: 4px; margin-top: 30px; }
  .proof-header { background-color: #d9edf7; color: #31708f; padding: 15px 20px; font-weight: bold; font-size: 15px; border-bottom: 1px solid #bce8f1; }
  .proof-body { padding: 25px; }
  .proof-label { display: block; font-weight: 700; margin-bottom: 8px; color: #444; }
  .proof-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px; font-size: 14px; }
  .proof-input:focus { border-color: #66afe9; outline: 0; box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6); }
  .proof-sub-label { font-size: 12px; color: #888; margin-top: -15px; margin-bottom: 20px; display: block; }
</style>

<div class="mw-container">

    <!-- INSTRUCTIONS PANEL -->
    <div class="mw-panel" style="border-color: #bce8f1;">
        <div class="mw-panel-heading" style="background-color: #d9edf7; color: #31708f;">
            <i class="fa fa-info-circle"></i> Campaign Instructions
        </div>
        <div class="mw-panel-body">
            
            <!-- Step 1 -->
            <div class="step-row">
                <div class="step-num">1</div>
                <div class="step-content">
                    <h4 class="step-title">Visit Google</h4>
                    <p>Go to <a href="https://www.google.com" target="_blank">www.google.com</a> inside a new private/incognito window.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-row">
                <div class="step-num">2</div>
                <div class="step-content">
                    <h4 class="step-title">Search Keyword</h4>
                    <p>Copy and paste this keyword into Google Search:</p>
                    <div class="highlight-box">${keyword}</div>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-row">
                <div class="step-num">3</div>
                <div class="step-content">
                    <h4 class="step-title">Find the Result</h4>
                    <p>Scroll through results (Pages 1-${endPage}) and find the link with:</p>
                    <ul style="margin-top: 10px;">
                        <li><strong>Title/Snippet containing:</strong> "${targetText}"</li>
                        <li><strong>Domain starting with:</strong> <span class="domain-tag">https://${landingDomain}...</span></li>
                    </ul>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-row">
                <div class="step-num">4</div>
                <div class="step-content">
                    <h4 class="step-title">Screenshot Search Result</h4>
                    <p>Take a screenshot of the Google result <strong>before clicking</strong>.</p>
                    <p>Upload to <a href="https://snipboard.io" target="_blank">Snipboard.io</a> and copy the link.</p>
                </div>
            </div>

            <!-- Step 5 -->
            <div class="step-row">
                <div class="step-num">5</div>
                <div class="step-content">
                    <h4 class="step-title">Visit & Engage</h4>
                    <p>Click the result, scroll through the page for 30 seconds, and <strong>share it</strong> on social media.</p>
                </div>
            </div>
        </div>
    </div>


    <!-- WHAT TO SUBMIT LIST -->
    <div style="margin-bottom: 20px;">
        <h3 style="color: #c0392b; margin-bottom: 15px;"><i class="fa fa-thumb-tack"></i> What You Need to Submit</h3>
        <ol style="font-size: 15px; line-height: 1.8;">
            <li><strong>Link to Snipboard Screenshot</strong> – Proof of Google search</li>
            <li><strong>Landing Page URL</strong> – Starting with <span class="domain-tag">https://${landingDomain}...</span></li>
            <li><strong>Social Media Post URL</strong> – Link to your public post</li>
        </ol>
    </div>


    <!-- PROOF SECTION (MATCHING IMAGE) -->
    <div class="proof-section">
        <div class="proof-header">Required Proofs:</div>
        <div class="proof-body">
            
            <label class="proof-label">Paste the actual landing page URL below:</label>
            <input type="text" class="proof-input" name="proof1" placeholder="Landing page URL obtained" required />

            <label class="proof-label">URL of your social media post</label>
            <input type="text" class="proof-input" name="proof2" placeholder="" required />

            <label class="proof-label">Link to your Google search screenshot:</label>
            <input type="text" class="proof-input" name="proof3" placeholder="Snipboard.io screenshot URL" required />

        </div>
    </div>

</div>`,

    // ---------------------------------------------------------------------------
    // TEMPLATE 2: Social Media Engagement
    // ---------------------------------------------------------------------------
    getSocialEngagementTemplate: (platform: string, targetUrl: string) => {
        let name = platform;
        try {
            if (targetUrl) {
                const url = new URL(targetUrl);
                // Extract domain without www. and extension (e.g., 'medium' from 'www.medium.com')
                name = url.hostname.replace('www.', '').split('.')[0];
            }
        } catch (e) {
            // Fallback to platform name if URL parsing fails
        }

        if (!name || name === 'other') name = 'Social';

        const platformName = name.charAt(0).toUpperCase() + name.slice(1);
        return `
<!-- Global Styles -->
<style>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700');
  .mw-container { font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
  .mw-panel { border: 1px solid #dce4ec; border-radius: 4px; margin-bottom: 25px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .mw-panel-heading { background-color: #f5f8fa; color: #333; padding: 15px 20px; border-bottom: 1px solid #dce4ec; font-weight: 700; font-size: 16px; }
  .mw-panel-body { padding: 25px; }
  
  .step-row { margin-bottom: 25px; display: flex; align-items: flex-start; }
  .step-num { flex-shrink: 0; width: 30px; height: 30px; background: #27ae60; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 15px; }
  .step-content { flex-grow: 1; }
  .step-title { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #2c3e50; }
  
  .instruction-box { background-color: #fcf8e3; border: 1px solid #faebcc; padding: 10px 15px; border-radius: 4px; margin: 10px 0; }
  .alert-danger { background-color: #f2dede; border: 1px solid #ebccd1; color: #a94442; padding: 15px; border-radius: 4px; margin-bottom: 25px; }

  .proof-section { background-color: #ffff; border: 1px solid #bce8f1; border-radius: 4px; margin-top: 30px; }
  .proof-header { background-color: #d9edf7; color: #31708f; padding: 15px 20px; font-weight: bold; font-size: 15px; border-bottom: 1px solid #bce8f1; }
  .proof-body { padding: 25px; }
  .proof-label { display: block; font-weight: 700; margin-bottom: 8px; color: #444; }
  .proof-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px; font-size: 14px; }
</style>

<div class="mw-container">

    <!-- REQUIREMENTS ALERT -->
    <div class="alert-danger">
        <strong><i class="fa fa-exclamation-circle"></i> Requirements:</strong>
        <ul style="margin-top: 5px; padding-left: 20px;">
            <li>You must set the below-requested post/share to <strong>Public View</strong> to allow task verification.</li>
            <li>You must set your friends list to public view to allow verification.</li>
            <li>Failure to follow instructions will result in task rejection.</li>
        </ul>
    </div>

    <!-- INSTRUCTIONS PANEL -->
    <div class="mw-panel">
        <div class="mw-panel-heading">
            <i class="fa fa-thumbs-up"></i> ${platformName} Engagement Instructions
        </div>
        <div class="mw-panel-body">
            
            <p style="margin-bottom:20px; font-weight: 600;">This task requires you to create a new ${platformName} account and engage with a specific page. This is for authentic interaction only—no fake or empty comments.</p>

            <!-- Step 1 -->
            <div class="step-row">
                <div class="step-num">1</div>
                <div class="step-content">
                    <h4 class="step-title">Create a New ${platformName} Account</h4>
                    <p>Visit ${platformName}.com and click "Sign up." You must use:</p>
                    <ul style="margin-top: 5px;">
                        <li><strong>Realistic U.S. Name</strong> (e.g., Ethan Clark, Olivia Turner).</li>
                        <li><strong>Valid U.S.-style username</strong> (e.g., @emma_nyc_usa).</li>
                        <li><strong>Location:</strong> Set your profile city/state to a U.S. city (e.g., "Los Angeles, CA").</li>
                        <li><strong>Profile Photo & Bio:</strong> Add details to make the account look genuine.</li>
                    </ul>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-row">
                <div class="step-num">2</div>
                <div class="step-content">
                    <h4 class="step-title">Page Engagement</h4>
                    <p>Visit the target post link:</p>
                    <div class="instruction-box">
                        <a href="${targetUrl}" target="_blank" style="font-weight: bold; color: #337ab7;">Open ${platformName} Post</a>
                    </div>
                    <ul style="margin-top: 5px;">
                        <li><strong>Like</strong> the post.</li>
                        <li><strong>Comment</strong> using a genuine question related to the content or service. (No spam or emojis-only).</li>
                    </ul>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-row">
                <div class="step-num">3</div>
                <div class="step-content">
                    <h4 class="step-title">Click & Screenshot</h4>
                    <p>Click the <strong>"Learn More"</strong> link in the post, comments, or bio.</p>
                    <p>Take a <strong>screenshot of the landing page</strong> that opens.</p>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-row">
                <div class="step-num">4</div>
                <div class="step-content">
                    <h4 class="step-title">Share the Link</h4>
                    <p>Share the 'Learn More' link to your story, feed, or bio.</p>
                    <p>Take a <strong>screenshot</strong> of your shared post or bio showing the link.</p>
                </div>
            </div>

        </div>
    </div>

    <!-- PROOF SECTION -->
    <div class="proof-section">
        <div class="proof-header">Required Proofs:</div>
        <div class="proof-body">
            
            <label class="proof-label">1. Link to your ${platformName} profile (must be public):</label>
            <input type="text" class="proof-input" name="proof1" placeholder="Your profile URL" required />

            <label class="proof-label">2. Screenshot of the landing page opened from the link:</label>
            <input type="text" class="proof-input" name="proof2" placeholder="Snipboard.io screenshot URL" required />

            <label class="proof-label">3. Screenshot of your comment on the post:</label>
            <input type="text" class="proof-input" name="proof3" placeholder="Snipboard.io screenshot URL" required />

            <label class="proof-label">4. Screenshot of your shared story or bio showing the link:</label>
            <input type="text" class="proof-input" name="proof4" placeholder="Snipboard.io screenshot URL" required />

        </div>
    </div>

</div>`
    },

    // ---------------------------------------------------------------------------
    // TEMPLATE 3: External Link (Search + Find Article + Click to Landing Page)
    // ---------------------------------------------------------------------------
    getExternalLinkTemplate: (keyword: string, articleTitle: string, targetDomain: string) => `
<!-- Global Styles -->
<style>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700');
  .mw-container { font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
  .mw-panel { border: 1px solid #dce4ec; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
  .mw-panel-heading { background-color: #4f46e5; color: #fff; padding: 15px 20px; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 10px; }
  .mw-panel-body { padding: 25px; background: #fff; }
  
  .step-row { margin-bottom: 25px; display: flex; align-items: flex-start; }
  .step-num { flex-shrink: 0; width: 28px; height: 28px; background: #4f46e5; color: #fff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 15px; font-size: 12px; }
  .step-content { flex-grow: 1; }
  .step-title { font-size: 15px; font-weight: 700; margin: 0 0 5px 0; color: #1e293b; }
  .step-desc { color: #64748b; margin: 0; }
  
  .highlight-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 18px; border-radius: 6px; font-weight: 600; color: #4f46e5; display: inline-block; margin-top: 8px; font-family: monospace; font-size: 15px; }
  .article-box { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 10px 15px; border-radius: 6px; margin: 10px 0; font-style: italic; border-left: 4px solid #f59e0b; }
  .domain-tag { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 13px; }
  
  .proof-section { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 30px; overflow: hidden; }
  .proof-header { background-color: #f1f5f9; color: #475569; padding: 15px 20px; font-weight: 700; font-size: 15px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
  .proof-body { padding: 25px; }
  .proof-group { margin-bottom: 20px; }
  .proof-label { display: block; font-weight: 600; margin-bottom: 8px; color: #334155; font-size: 13px; }
  .proof-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; transition: all 0.2s; box-sizing: border-box; }
  .proof-input:focus { border-color: #4f46e5; outline: 0; ring: 3px rgba(79, 70, 229, 0.1); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  
  .alert-box { background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 12px; align-items: center; }
</style>

<div class="mw-container">

    <!-- HEADER / WARNING -->
    <div class="alert-box">
        <div style="font-size: 20px;">⚠️</div>
        <div>
            <strong>Important:</strong> Set all social media shares to <strong>Public</strong>. If we cannot verify your post, you will NOT be paid.
        </div>
    </div>

    <!-- INSTRUCTIONS PANEL -->
    <div class="mw-panel">
        <div class="mw-panel-heading">
            Campaign: Find Article & Share
        </div>
        <div class="mw-panel-body">
            
            <!-- Step 1 -->
            <div class="step-row">
                <div class="step-num">1</div>
                <div class="step-content">
                    <h4 class="step-title">Open Google Search</h4>
                    <p class="step-desc">Go to <a href="https://www.google.com" target="_blank" style="color: #4f46e5; font-weight: 600;">Google.com</a> in a new Incognito/Private window.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-row">
                <div class="step-num">2</div>
                <div class="step-content">
                    <h4 class="step-title">Search Content</h4>
                    <p class="step-desc">Search for the exact phrase below:</p>
                    <div class="highlight-box">"${keyword}"</div>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-row">
                <div class="step-num">3</div>
                <div class="step-content">
                    <h4 class="step-title">Locate the Article</h4>
                    <p class="step-desc">Look through results on Pages 1 to 6 to find this specific article:</p>
                    <div class="article-box">
                        "${articleTitle}"
                    </div>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-row">
                <div class="step-num">4</div>
                <div class="step-content">
                    <h4 class="step-title">Visit Landing Page</h4>
                    <p class="step-desc">Inside that article, find the link that takes you to:</p>
                    <div style="margin-top: 8px;">
                        <span class="domain-tag">${targetDomain}</span>
                    </div>
                </div>
            </div>

            <!-- Step 5 -->
            <div class="step-row">
                <div class="step-num">5</div>
                <div class="step-content">
                    <h4 class="step-title">Screenshot Search Result</h4>
                    <p class="step-desc">Take a full screenshot of the Google search result page showing our article link.</p>
                    <p style="font-size: 12px; margin-top: 5px; color: #64748b;">Upload to <a href="https://snipboard.io" target="_blank">Snipboard.io</a></p>
                </div>
            </div>

            <!-- Step 6 -->
            <div class="step-row" style="margin-bottom: 0;">
                <div class="step-num">6</div>
                <div class="step-content">
                    <h4 class="step-title">Share & Submit</h4>
                    <p class="step-desc">Share the final URL (${targetDomain}) on any social media and copy your post link.</p>
                </div>
            </div>

        </div>
    </div>


    <!-- PROOF SUBMISSION -->
    <div class="proof-section">
        <div class="proof-header">Submit Your Proofs Below</div>
        <div class="proof-body">
            
            <div class="proof-group">
                <label class="proof-label">1. Final Landing Page URL (on ${targetDomain}):</label>
                <input type="text" class="proof-input" name="proof1" placeholder="https://${targetDomain}/..." required />
            </div>

            <div class="proof-group">
                <label class="proof-label">2. Link to Google Search Screenshot:</label>
                <input type="text" class="proof-input" name="proof2" placeholder="Example: https://snipboard.io/abc123" required />
            </div>

            <div class="proof-group">
                <label class="proof-label">3. URL of your Social Media Post:</label>
                <input type="text" class="proof-input" name="works_share" placeholder="Link to your public post" required />
            </div>

        </div>
    </div>

</div>`
};
