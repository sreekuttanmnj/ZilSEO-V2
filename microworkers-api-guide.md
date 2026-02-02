# Microworkers API Integration Guide

## API Endpoints

### 1. Create Template
**Endpoint:** `POST /api/v2/templates`

**Request Payload:**
```json
{
  "htmlCode": "string",
  "cssSection": "string",
  "jsSection": "string",
  "title": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "title": "string",
  "htmlCode": "string",
  "jsSection": "string",
  "cssSection": "string",
  "questions": [],
  "variables": [],
  "createdAt": "2025-12-25T10:47:39.265Z",
  "lastModifiedAt": "2025-12-25T10:47:39.265Z"
}
```

---

### 2. Create Campaign
**Endpoint:** `POST /api/v2/basic-campaigns`

**Required Fields:**
- `availablePositions`: number (e.g., 30)
- `categoryId`: string (fetch from configuration endpoint)
- `title`: string
- `description`: string
- `paymentPerTask`: number (e.g., 0.15)
- `minutesToFinish`: number (e.g., 30)
- `speed`: number (1000 = fastest)
- `ttr`: number (time to review in days, e.g., 7)

**Zone Configuration (ONE required):**
- `internationalZone`: { id: "int", excludedCountries: [] }
- OR `targetedZone`: { id: "asia1", targetedCountries: [] }

**Template Configuration (ONE required):**
- `internalTemplate`: For HTML-based tasks
  - `id`: template ID from step 1
  - `adminInstructions`: string
  - `numberOfSubTasks`: 1
  - `ratingMethodId`: 3
  - `displaySubTasksOnSamePage`: false
  - `allowedFileTypes`: [] (optional)
  - `numberOfFileProofs`: 3
- OR `externalTemplate`: For iframe-based tasks

**Request Payload Example:**
```json
{
  "availablePositions": 30,
  "categoryId": "1001",
  "internationalZone": {
    "id": "int",
    "excludedCountries": []
  },
  "speed": 1000,
  "internalTemplate": {
    "id": "template-id-from-step-1",
    "adminInstructions": "Verify that workers completed the search task correctly",
    "numberOfSubTasks": 1,
    "ratingMethodId": 3,
    "displaySubTasksOnSamePage": false,
    "allowedFileTypes": [],
    "numberOfFileProofs": 0
  },
  "minutesToFinish": 30,
  "title": "Google: Search + Visit + Share",
  "qtRequired": true,
  "removePositionOnNokRating": false,
  "description": "Search Google for specific keyword and engage with result",
  "paymentPerTask": 0.15,
  "autoSkipTask": {
    "enabled": false,
    "timeLimit": 120
  },
  "ttr": 7,
  "taskOrder": 2,
  "visibilityDelay": 0,
  "chatEnabled": false,
  "maximumJobLimit": {
    "enabled": false
  },
  "tasks": [],
  "notificationSettings": []
}
```

---

### 3. Restart Campaign
**Endpoint:** `POST /api/v2/basic-campaigns/{campaignId}/restart`

**Request Payload:**
```json
{
  "positionsToAdd": 10,
  "tasks": []
}
```

---

## Implementation Notes

### API Authentication
- Header: `MicroworkersApiKey: YOUR_API_KEY`
- Sandbox URL: `https://sandbox.microworkers.com/api.php`
- Production URL: `https://api.microworkers.com/api.php`

### Category IDs
Fetch available categories from:
- `GET /api/v2/basic-campaigns/configuration`
- Returns: `{ categories: [{id, name}], countries: [...] }`

### Common Errors
- **400 Validation Failed**: Missing required fields or invalid format
- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Insufficient permissions

### Best Practices
1. Always create template first, then use template ID in campaign
2. Fetch valid category IDs from configuration endpoint
3. Start with small number of positions (10-30) for testing
4. Use appropriate zone configuration (international vs targeted)
5. Set reasonable payment (minimum $0.10)
