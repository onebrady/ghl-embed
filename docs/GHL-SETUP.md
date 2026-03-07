# GHL Private Integration Setup Guide

## Creating Your Private Integration Token

1. **Log into GoHighLevel** → go to the sub-account (location) you want to connect
2. **Settings** → **Private Integrations** (under the Business Info section)
3. Click **"Create New Integration"**
4. Name it something like `GHL Command Center`
5. **Enable the following scopes:**

### Required Scopes

| Category | Scopes | Used For |
|----------|--------|----------|
| **Contacts** | `contacts.readonly`, `contacts.write` | Contact CRUD, search, list |
| **Conversations** | `conversations.readonly`, `conversations.write`, `conversations/message.readonly`, `conversations/message.write` | Activity timeline, send messages |
| **Opportunities** | `opportunities.readonly`, `opportunities.write` | Deal records, pipeline data |
| **Calendars** | `calendars.readonly`, `calendars/events.readonly` | Appointments in timeline |
| **Locations** | `locations.readonly`, `locations/customFields.readonly`, `locations/customValues.readonly` | Custom fields, location details |
| **Users** | `users.readonly` | Team member assignment display |

### Optional Scopes (for future features)

| Category | Scopes | Used For |
|----------|--------|----------|
| **Forms** | `forms.readonly` | Form submission history in timeline |
| **Workflows** | `workflows.readonly` | Workflow event history |
| **Invoices** | `invoices.readonly` | Financial associations on deals |

6. Click **Create** and **copy the token** — you'll only see it once
7. Also note your **Location ID** (visible in the URL or under Settings → Company)

## Configuring the Project

### .mcp.json (for Claude Code)
```json
{
  "mcpServers": {
    "gohighlevel": {
      "type": "url",
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer pit-YOUR-TOKEN-HERE",
        "x-location-id": "YOUR-LOCATION-ID-HERE"
      }
    }
  }
}
```

### .env.local (for the Next.js app)
```
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_PRIVATE_INTEGRATION_TOKEN=pit-YOUR-TOKEN-HERE
GHL_DEFAULT_LOCATION_ID=YOUR-LOCATION-ID-HERE
```

## Testing the Connection

Once configured, you can verify the connection in Claude Code by asking:
> "Use the GHL MCP server to fetch my contacts"

Or test directly with curl:
```bash
curl -X GET "https://services.leadconnectorhq.com/contacts/?locationId=YOUR_LOCATION_ID&limit=1" \
  -H "Authorization: Bearer pit-YOUR-TOKEN-HERE" \
  -H "Version: 2021-07-28" \
  -H "Content-Type: application/json"
```

## Multi-Location Setup

For managing multiple client sub-accounts, you have two options:

1. **Single PIT with location switching** — Create the Private Integration at the agency level with access to multiple locations. Pass `locationId` per request.

2. **Per-location PITs** — Create a separate Private Integration in each sub-account. Store tokens in Supabase keyed by location ID. This is more secure but more tokens to manage.

For initial development, option 1 is faster. For production with client data, option 2 is recommended.

## Rate Limits

- **100 requests per 10 seconds** per app per location
- The GHL client (`src/lib/ghl/client.ts`) handles rate limiting automatically
- For the contact record view (which hits ~5 endpoints on load), use `Promise.allSettled` for parallel requests
- Consider implementing a server-side cache layer for frequently accessed data (pipeline definitions, custom field schemas) that rarely change
