# GHL Command Center

A HubSpot-caliber contact and deal record viewer built on top of GoHighLevel. Provides a three-column layout with unified activity timelines, deal-scoped email, and cross-record associations — while keeping GHL as the single source of truth.

**Built by [ResultReach](https://resultreach.com)**

## Quick Start

```bash
# 1. Clone and enter project
cd ghl-command-center

# 2. Run setup (installs deps, pulls GHL API docs, scaffolds project)
chmod +x setup.sh
./setup.sh

# 3. Configure credentials
cp .env.local.example .env.local
# Edit .env.local with your GHL, Supabase, and Postmark credentials

# 4. Update .mcp.json with your GHL Private Integration Token
# Get this from GHL: Settings > Private Integrations > Create New

# 5. Start dev server
npm run dev
```

## Development with Claude Code

This project is optimized for development with Claude Code. The `CLAUDE.md` file provides full project context, and the `.mcp.json` connects Claude Code directly to your GHL data via the official MCP server.

```bash
# Open Claude Code in the project directory
claude

# Claude Code will automatically pick up:
# - CLAUDE.md (project context, architecture, conventions)
# - .mcp.json (live GHL API access)
# - docs/ghl-api-context.md (full API endpoint reference)
```

## Architecture

- **Next.js 14+** (App Router, Server Components, TypeScript)
- **GHL API v2** — primary data source (contacts, deals, conversations, calendars)
- **Supabase** — supplemental data (deal-scoped emails, user preferences, custom associations)
- **Postmark** — deal-scoped email send/receive
- **Tailwind + shadcn/ui** — styling and components

See `CLAUDE.md` for complete architectural documentation.
