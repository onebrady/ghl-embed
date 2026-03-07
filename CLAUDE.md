# GHL Command Center

## Project Overview

A custom contact and deal record viewer built on top of GoHighLevel (GHL) that provides a HubSpot-caliber three-column record layout. This is NOT a CRM replacement — GHL remains the source of truth for all contact, deal, and communication data. This app is a **premium view layer** that aggregates and presents GHL data in a more comprehensive, user-friendly layout.

**Owner:** ResultReach (Brady Freeman's marketing and web development agency)
**Primary Users:** ResultReach internal team (agency operators managing multiple GHL sub-accounts)
**Future Vision:** Potential GHL marketplace app or premium add-on for other agencies

## Architecture

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (supplemental data only — custom associations, deal-scoped emails, user layout preferences, cached activity timelines)
- **Primary Data Source:** GoHighLevel API v2 (REST, OAuth 2.0 / Private Integration Token)
- **Email Engine:** Postmark (for deal-scoped email send/receive — inbound webhooks + outbound transactional)
- **Auth:** Supabase Auth (agency team members)
- **Deployment:** Vercel

### Key Architectural Decisions
1. **GHL is the source of truth.** We never store duplicate contact/deal data in Supabase. We read from GHL and write back to GHL. Supabase only stores data GHL cannot (deal-scoped emails, custom UI preferences, cached timelines for performance).
2. **No bidirectional sync.** We pull from GHL on demand (with smart caching), not via polling or webhooks trying to maintain a mirror. GHL webhooks are used only for real-time event notifications (new message, stage change, etc.) to update the UI, not to populate a local database.
3. **Sub-account aware.** The app must support switching between GHL sub-accounts (locations). Brady's agency manages multiple clients, each in their own GHL sub-account.
4. **API-first data layer.** All GHL interactions go through a centralized API service layer (`/lib/ghl/`) that handles auth, rate limiting, error handling, and response typing.

### GHL API Reference
- See `docs/ghl-api-context.md` for the complete GoHighLevel API v2 endpoint reference (all 413 operations, optimized for AI context)
- See `docs/merged-openapi.json` for the full OpenAPI 3.0 spec (792 schemas)
- **Base URL:** `https://services.leadconnectorhq.com`
- **Auth:** Bearer token (Private Integration Token) + `Version: 2021-07-28` header
- **Rate Limits:** 100 requests per 10 seconds per app per location

### GHL MCP Server
The official GHL MCP server is configured in `.mcp.json` for development. Use it to:
- Test API calls against live GHL data during development
- Explore available endpoints and data shapes
- Validate assumptions about response formats

## Core Features

### 1. Contact Record View (Three-Column Layout)

**Left Column — Contact Details Panel**
- Contact photo/avatar + name + primary identifiers
- Grouped field sections (configurable):
  - Contact Information (email, phone, address)
  - Company Information (company name, website, industry)
  - Lead Source & Attribution (source, medium, campaign, referrer)
  - Custom Fields (grouped by GHL custom field groups)
  - Tags (visual tag chips)
- All fields are inline-editable, writing back to GHL via API
- Section order and visibility is configurable per user (stored in Supabase)

**Center Column — Activity Timeline**
- **Unified chronological feed** aggregating:
  - Email conversations (from GHL Conversations API)
  - SMS conversations (from GHL Conversations API)
  - Phone calls + recordings (from GHL Conversations API)
  - Notes (from GHL Contacts API — notes endpoint)
  - Tasks (from GHL Contacts API — tasks endpoint)
  - Appointments/meetings (from GHL Calendars API)
  - Opportunity stage changes (from GHL Opportunities API)
  - Form submissions (from GHL Forms API)
  - Workflow events
- **Filter tabs:** All Activity | Emails | SMS | Calls | Notes | Tasks | Meetings
- **Compose actions:** Quick-add note, create task, schedule meeting, send email/SMS (proxied through GHL API)
- Each activity item shows timestamp, type icon, preview, and expandable detail

**Right Column — Associated Records**
- **Opportunities/Deals:** List of all opportunities for this contact, showing pipeline, stage, value, and status. Clickable to navigate to Deal Record View.
- **Company:** Associated company record (if exists)
- **Other Contacts:** Other contacts at the same company
- **Quotes/Proposals:** (if available via GHL API or custom)
- **Custom Associations:** (stored in Supabase for relationships GHL doesn't support natively)

### 2. Deal/Opportunity Record View (Three-Column Layout)

**Left Column — Deal Details Panel**
- Deal name, value, pipeline, current stage
- Stage progression indicator (visual pipeline stages)
- Key dates (created, last activity, expected close)
- Custom fields specific to the opportunity
- Assigned team member
- Inline-editable, writes back to GHL

**Center Column — Deal Activity Timeline**
- Same unified timeline concept as Contact, but scoped to the deal
- **CRITICAL FEATURE — Deal-Scoped Email:** Ability to email external parties (financing team, title company, vendors) and have those conversations live on the deal record, NOT on a contact record. This uses Postmark for send/receive:
  - Outbound: Sent via Postmark API, tagged with deal ID, stored in Supabase
  - Inbound: Received via Postmark inbound webhook, matched to deal by reply-to address or thread ID, stored in Supabase
  - Displayed in the deal timeline alongside GHL-native activity
- Contact communications related to this deal (pulled from GHL, filtered by date range or tagged)

**Right Column — Associated Records**
- Primary contact (linked to Contact Record View)
- Additional contacts on the deal
- Company
- Related documents/attachments
- Financial details (if applicable)

### 3. Contact & Deal List Views
- Searchable, filterable, sortable table views
- Quick filters: pipeline, stage, tags, date ranges, assigned user
- Bulk actions where applicable
- Column customization

### 4. Sub-Account Switcher
- Dropdown or sidebar selector to switch between GHL locations
- Each location has its own data context
- User preferences persist per location

## Project Structure

```
ghl-command-center/
├── .mcp.json                    # MCP server config (GHL + others)
├── CLAUDE.md                    # This file
├── docs/
│   ├── ghl-api-context.md       # GHL API v2 full endpoint reference
│   └── merged-openapi.json      # GHL OpenAPI 3.0 spec
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Dashboard / landing
│   │   ├── contacts/
│   │   │   ├── page.tsx         # Contact list view
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Contact record view (3-column)
│   │   ├── deals/
│   │   │   ├── page.tsx         # Deal list view
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Deal record view (3-column)
│   │   └── api/
│   │       ├── ghl/             # GHL API proxy routes
│   │       │   ├── contacts/
│   │       │   ├── opportunities/
│   │       │   ├── conversations/
│   │       │   └── calendars/
│   │       ├── postmark/        # Postmark webhook handlers
│   │       │   └── inbound/
│   │       └── webhooks/        # GHL webhook receivers
│   │           └── ghl/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── contact/             # Contact record components
│   │   │   ├── ContactDetailsPanel.tsx
│   │   │   ├── ContactTimeline.tsx
│   │   │   ├── ContactAssociations.tsx
│   │   │   ├── FieldGroup.tsx
│   │   │   └── InlineEditField.tsx
│   │   ├── deal/                # Deal record components
│   │   │   ├── DealDetailsPanel.tsx
│   │   │   ├── DealTimeline.tsx
│   │   │   ├── DealAssociations.tsx
│   │   │   ├── StageProgressBar.tsx
│   │   │   └── DealEmailComposer.tsx
│   │   ├── timeline/            # Shared timeline components
│   │   │   ├── TimelineItem.tsx
│   │   │   ├── TimelineFilter.tsx
│   │   │   ├── ActivityIcon.tsx
│   │   │   └── TimelineComposer.tsx
│   │   ├── layout/              # App layout components
│   │   │   ├── ThreeColumnLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SubAccountSwitcher.tsx
│   │   └── list/                # List view components
│   │       ├── DataTable.tsx
│   │       ├── FilterBar.tsx
│   │       └── QuickFilters.tsx
│   ├── lib/
│   │   ├── ghl/                 # GHL API service layer
│   │   │   ├── client.ts        # Authenticated HTTP client (rate limiting, retries)
│   │   │   ├── contacts.ts      # Contact CRUD operations
│   │   │   ├── opportunities.ts # Opportunity CRUD operations
│   │   │   ├── conversations.ts # Conversations & messages
│   │   │   ├── calendars.ts     # Calendar & appointments
│   │   │   ├── notes.ts         # Contact notes
│   │   │   ├── tasks.ts         # Contact tasks
│   │   │   ├── custom-fields.ts # Custom field definitions
│   │   │   ├── pipelines.ts     # Pipeline & stage definitions
│   │   │   └── types.ts         # TypeScript types (generated from OpenAPI spec)
│   │   ├── postmark/            # Postmark email service
│   │   │   ├── client.ts
│   │   │   ├── send.ts
│   │   │   └── inbound.ts
│   │   ├── supabase/            # Supabase client & queries
│   │   │   ├── client.ts
│   │   │   ├── deal-emails.ts
│   │   │   ├── user-preferences.ts
│   │   │   └── associations.ts
│   │   └── utils/
│   │       ├── timeline-aggregator.ts  # Merges multiple activity sources into unified timeline
│   │       ├── cache.ts                # Client-side caching strategy
│   │       └── date.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useContact.ts
│   │   ├── useDeal.ts
│   │   ├── useTimeline.ts
│   │   ├── useGHLClient.ts
│   │   └── useSubAccount.ts
│   └── types/                   # Shared TypeScript types
│       ├── contact.ts
│       ├── deal.ts
│       ├── timeline.ts
│       └── ghl.ts
├── supabase/
│   └── migrations/              # Supabase migrations
│       ├── 001_deal_emails.sql
│       ├── 002_user_preferences.sql
│       └── 003_custom_associations.sql
└── package.json
```

## Design Direction

### Aesthetic
- **Clean, professional, information-dense** — think HubSpot meets Linear
- Light theme primary, dark theme optional
- Heavy use of whitespace to separate information groups without overwhelming
- Subtle borders and background tints to delineate columns and sections
- Type hierarchy is critical — clear distinction between labels, values, headers, and metadata

### Typography
- Use a clean, highly legible sans-serif for data display (NOT Inter — consider IBM Plex Sans, Geist, or DM Sans)
- Monospace for IDs, timestamps, and code-like values
- Strong weight contrast between section headers and field values

### Color
- Neutral base (gray scale) with a single strong accent color for actions and active states
- Activity type colors: email (blue), SMS (green), call (amber), note (gray), task (purple), meeting (teal)
- Pipeline stage colors configurable per pipeline
- Status indicators: won (green), lost (red), open (blue), stale (amber)

### Key UI Patterns
- **Inline editing:** Click any field value to edit, escape to cancel, blur or enter to save. Subtle edit icon on hover.
- **Expandable timeline items:** Show preview in feed, click to expand full detail inline
- **Sticky column headers:** Left and right columns scroll independently from center timeline
- **Keyboard navigation:** Tab through fields, arrow keys in timeline, shortcuts for common actions
- **Loading states:** Skeleton screens for initial load, optimistic updates for writes

## Development Guidelines

### Code Style
- TypeScript strict mode, no `any` types
- Functional components with hooks
- Server Components by default, Client Components only when needed (interactivity, hooks)
- Use React Server Actions for mutations where possible
- Barrel exports from component directories

### API Layer Rules
- ALL GHL API calls go through `src/lib/ghl/client.ts` — never call the API directly from components
- The client handles: auth header injection, rate limit tracking (100/10s), automatic retry with exponential backoff, response typing, error normalization
- Use SWR or React Query for client-side data fetching with caching
- Server-side calls use the client directly in Server Components or Route Handlers

### Error Handling
- GHL API errors are caught and normalized in the client layer
- Display user-friendly error messages, not raw API errors
- Optimistic updates with rollback on failure
- Toast notifications for save confirmations and errors

### Environment Variables
```
# GHL
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxxxx
GHL_DEFAULT_LOCATION_ID=xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Postmark
POSTMARK_SERVER_TOKEN=xxxxx
POSTMARK_INBOUND_ADDRESS=deals@inbound.yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Next.js project scaffolding with TypeScript, Tailwind, shadcn/ui
- [ ] GHL API client layer (`lib/ghl/client.ts` + auth + rate limiting)
- [ ] Generate TypeScript types from OpenAPI spec
- [ ] Contact list view (basic table with search/filter)
- [ ] Contact record view — left column (details panel with field groups)
- [ ] Sub-account context (location switcher in header)

### Phase 2: Timeline (Week 2)
- [ ] Timeline aggregator utility — merges conversations, notes, tasks, appointments
- [ ] Contact record view — center column (unified activity timeline)
- [ ] Timeline filter tabs
- [ ] Expandable timeline items with full detail
- [ ] Quick-add note and create task from timeline

### Phase 3: Deals & Associations (Week 3)
- [ ] Deal list view
- [ ] Deal record view — left column (details + stage progression)
- [ ] Deal record view — center column (activity timeline, deal-scoped)
- [ ] Contact record view — right column (associated deals, company, contacts)
- [ ] Deal record view — right column (associated contacts, company)
- [ ] Supabase schema for custom associations

### Phase 4: Deal-Scoped Email (Week 4)
- [ ] Postmark integration — outbound send from deal context
- [ ] Postmark inbound webhook — receive and match replies to deals
- [ ] Supabase schema for deal emails
- [ ] Deal email composer component
- [ ] Deal email thread display in timeline
- [ ] Email notification preferences

### Phase 5: Polish & UX (Week 5+)
- [ ] Inline editing with optimistic updates
- [ ] Keyboard navigation and shortcuts
- [ ] User layout preferences (column widths, field group order)
- [ ] Dark theme
- [ ] Performance optimization (caching, prefetching, skeleton states)
- [ ] Error boundaries and fallback UI
- [ ] Mobile responsive adjustments

## GHL API Endpoints Used

### Contacts
- `GET /contacts/{contactId}` — Get contact details
- `GET /contacts/` — Search/list contacts
- `PUT /contacts/{contactId}` — Update contact
- `GET /contacts/{contactId}/notes` — Get notes
- `POST /contacts/{contactId}/notes` — Create note
- `GET /contacts/{contactId}/tasks` — Get tasks
- `POST /contacts/{contactId}/tasks` — Create task
- `GET /contacts/{contactId}/appointments` — Get appointments

### Opportunities
- `GET /opportunities/{opportunityId}` — Get opportunity
- `GET /opportunities/search` — Search opportunities
- `PUT /opportunities/{opportunityId}` — Update opportunity
- `GET /opportunities/pipelines` — Get pipelines and stages

### Conversations
- `GET /conversations/{conversationId}` — Get conversation
- `GET /conversations/search` — Search conversations
- `GET /conversations/{conversationId}/messages` — Get messages
- `POST /conversations/messages` — Send message (SMS/email)

### Calendars
- `GET /calendars/events` — Get calendar events
- `POST /calendars/events` — Create event

### Custom Fields
- `GET /locations/{locationId}/customFields` — Get custom field definitions
- `GET /locations/{locationId}/customValues/{contactId}` — Get custom field values

### Locations
- `GET /locations/{locationId}` — Get location details
- `GET /locations/search` — Search locations (for sub-account switcher)

## Notes
- Always check `docs/ghl-api-context.md` for the most current endpoint reference before implementing any API call
- GHL API versioning uses a date header: `Version: 2021-07-28`
- Rate limits are per-location, per-app — be mindful when loading the contact record view which hits multiple endpoints
- Use `Promise.allSettled` for parallel API calls on record view load (details + timeline + associations)
- GHL webhook events we care about: `ContactCreate`, `ContactUpdate`, `OpportunityCreate`, `OpportunityUpdate`, `ConversationMessage`, `NoteCreate`, `TaskCreate`
