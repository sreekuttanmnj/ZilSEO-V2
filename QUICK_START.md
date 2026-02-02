# Quick Start Guide - Microworkers Campaign Creation

## Prerequisites
1. ✅ Microworkers API Key (Sandbox or Production)
2. ✅ Backend server running (port 3001)
3. ✅ Frontend application running

## Setup Steps

### 1. Configure API Connection

**Admin Panel > Server Connection**
- Backend URL: `http://localhost:3001`
- MW API Key: `[Your Microworkers API Key]`
- Click "Save Connection"

### 2. Start Backend Server

Open terminal and run:
```bash
cd c:\Users\Sreekuttan\Downloads\zilseo
node server.js
```

You should see:
```
Backend server running on port 3001
```

### 3. Create a Campaign

#### Via Pages Tab:
1. Go to **Pages** tab
2. Navigate to **Mw** sub-tab
3. Find a page you want to promote
4. Fill in required fields:
   - **Keyword**: The search term (e.g., "online check writer")
   - **Page Position**: Expected position in results (e.g., "1")
   - **Result Text**: Text that identifies your result (e.g., "Print Checks Instantly")
5. Click the **Toggle Button** to start campaign

#### Via Articles Tab:
1. Go to **Pages** tab
2. Navigate to **Articles** sub-tab
3. Find an article you want to promote
4. Fill in required fields:
   - **Search Query**: The search term
   - **Page Position**: Expected position
   - **Result Text**: Identifying text
5. Click the **Toggle Button** to start campaign

## Behind the Scenes

When you click the toggle button, the system:

1. **Creates a Template** (v2 API)
   ```json
   {
     "htmlCode": "[Task instructions HTML]",
     "cssSection": "",
     "jsSection": "",
     "title": "Google: Search + Visit + Share"
   }
   ```

2. **Fetches Category ID**
   - Calls `/v2/basic-campaigns/configuration`
   - Selects appropriate category (search-related if available)

3. **Creates Campaign** (v2 API)
   ```json
   {
     "title": "Google: Search + Visit + Share",
     "description": "...",
     "categoryId": "[fetched ID]",
     "paymentPerTask": 0.07,
     "availablePositions": 30,
     "minutesToFinish": 30,
     "internalTemplate": {
       "id": "[template ID from step 1]",
       "adminInstructions": "...",
       ...
     },
     ...
   }
   ```

4. **Saves Campaign ID**
   - Campaign ID stored in your page/post record
   - Toggle turns green indicating "Running"

## Campaign Settings

Default settings (configured in `mockService.ts`):
- **Payment per task**: $0.15
- **Available positions**: 30 workers
- **Time to finish**: 30 minutes
- **Time to review (TTR)**: 7 days
- **Speed**: 1000 (fastest)
- **Zone**: International (all countries)

## Monitoring Campaigns

Go to **Campaigns** tab to see:
- All active campaigns
- Campaign status (Running/Paused)
- Source content (Page or Article)
- Target keyword
- Quick toggle to pause/resume

## Troubleshooting

### Error: "Backend URL Not Configured"
➜ Go to Admin > Server Connection and set the backend URL

### Error: "Network Error: Cannot connect to backend"
➜ Make sure `node server.js` is running on port 3001

### Error: "MW Template Error" or "MW Campaign Error"
➜ Check the browser console for detailed error messages
➜ Verify your API key is correct
➜ Check that all required fields are filled

### Error: "Search Query/Keyword is required"
➜ Fill in the Keyword field in the Mw tab

### Error: "Result Text is required"
➜ Fill in the Result Text field (text that identifies your page in search results)

## API Testing

Test the API directly without the UI:
```bash
node test-mw-api.js YOUR_API_KEY
```

This will:
1. ✅ Fetch categories
2. ✅ Create a test template
3. ✅ Create a test campaign
4. ✅ Display results

## Production Deployment

When ready for production:

1. Update `server.js`:
   ```javascript
   const MW_BASE_URL = 'https://api.microworkers.com/api.php';
   ```

2. Use your production API key

3. Deploy backend server to a public URL

4. Update frontend Admin settings with production backend URL

## Support

- API Documentation: `microworkers-api-guide.md`
- Fix Summary: `MICROWORKERS_FIXES.md`
- Official Docs: https://docs.microworkers.com/
