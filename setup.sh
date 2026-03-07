#!/bin/bash
# GHL Command Center — Project Setup Script
# Run this after cloning the repo to set up everything

set -e

echo "🚀 Setting up GHL Command Center..."

# ─── 1. Initialize Next.js project ───
echo ""
echo "📦 Creating Next.js project..."
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git

# ─── 2. Install dependencies ───
echo ""
echo "📦 Installing dependencies..."

# UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-separator
npm install class-variance-authority clsx tailwind-merge lucide-react

# Data fetching & state
npm install swr

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Date handling
npm install date-fns

# Postmark
npm install postmark

# Dev dependencies
npm install -D @types/node openapi-typescript

# ─── 3. Initialize shadcn/ui ───
echo ""
echo "🎨 Setting up shadcn/ui..."
npx shadcn@latest init -y

# Install commonly needed shadcn components
npx shadcn@latest add button card input label badge tabs separator skeleton toast dialog dropdown-menu popover avatar scroll-area sheet table textarea tooltip command

# ─── 4. Pull GHL API docs ───
echo ""
echo "📚 Pulling GHL API documentation..."
mkdir -p docs

# Clone the auto-synced GHL docs repo for the OpenAPI spec and AI context
git clone --depth 1 https://github.com/auratechia-code/gohighlevel-docs.git /tmp/ghl-docs 2>/dev/null || true

if [ -f /tmp/ghl-docs/generated/ghl-api-context.md ]; then
  cp /tmp/ghl-docs/generated/ghl-api-context.md docs/ghl-api-context.md
  echo "  ✅ Copied ghl-api-context.md"
else
  echo "  ⚠️  Could not find ghl-api-context.md — clone the repo manually:"
  echo "     git clone https://github.com/auratechia-code/gohighlevel-docs.git"
  echo "     cp gohighlevel-docs/generated/ghl-api-context.md docs/"
fi

if [ -f /tmp/ghl-docs/specs/merged-openapi.json ]; then
  cp /tmp/ghl-docs/specs/merged-openapi.json docs/merged-openapi.json
  echo "  ✅ Copied merged-openapi.json"
else
  echo "  ⚠️  Could not find merged-openapi.json — clone the repo manually"
fi

rm -rf /tmp/ghl-docs

# ─── 5. Generate TypeScript types from OpenAPI spec ───
echo ""
echo "🔧 Generating TypeScript types from OpenAPI spec..."
if [ -f docs/merged-openapi.json ]; then
  mkdir -p src/types/generated
  npx openapi-typescript docs/merged-openapi.json -o src/types/generated/ghl-api.ts
  echo "  ✅ Generated GHL API types at src/types/generated/ghl-api.ts"
else
  echo "  ⚠️  Skipping type generation — no OpenAPI spec found"
fi

# ─── 6. Create directory structure ───
echo ""
echo "📁 Creating project directories..."
mkdir -p src/app/contacts/\[id\]
mkdir -p src/app/deals/\[id\]
mkdir -p src/app/api/ghl/contacts
mkdir -p src/app/api/ghl/opportunities
mkdir -p src/app/api/ghl/conversations
mkdir -p src/app/api/ghl/calendars
mkdir -p src/app/api/postmark/inbound
mkdir -p src/app/api/webhooks/ghl
mkdir -p src/components/contact
mkdir -p src/components/deal
mkdir -p src/components/timeline
mkdir -p src/components/layout
mkdir -p src/components/list
mkdir -p src/lib/ghl
mkdir -p src/lib/postmark
mkdir -p src/lib/supabase
mkdir -p src/lib/utils
mkdir -p src/hooks
mkdir -p supabase/migrations

# ─── 7. Create .env.local template ───
echo ""
echo "🔐 Creating .env.local template..."
cat > .env.local.example << 'ENVEOF'
# ─── GoHighLevel ───
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxxxx
GHL_DEFAULT_LOCATION_ID=xxxxx

# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# ─── Postmark ───
POSTMARK_SERVER_TOKEN=xxxxx
POSTMARK_INBOUND_ADDRESS=deals@inbound.yourdomain.com

# ─── App ───
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVEOF

# ─── 8. Create .gitignore additions ───
echo ""
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'GITEOF'

# GHL Command Center
.env.local
docs/merged-openapi.json
src/types/generated/
GITEOF

# ─── 9. Update MCP config reminder ───
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Project setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1. Copy .env.local.example to .env.local and fill in your credentials:"
echo "   cp .env.local.example .env.local"
echo ""
echo "2. Update .mcp.json with your GHL Private Integration Token and Location ID"
echo "   (Settings > Private Integrations in GHL)"
echo ""
echo "3. Make sure your Private Integration Token has these scopes enabled:"
echo "   - contacts.readonly, contacts.write"
echo "   - conversations.readonly, conversations.write"
echo "   - opportunities.readonly, opportunities.write"
echo "   - calendars.readonly"
echo "   - locations.readonly"
echo "   - custom-fields.readonly"
echo ""
echo "4. Start developing:"
echo "   npm run dev"
echo ""
echo "5. Open Claude Code in this directory — it will pick up CLAUDE.md and .mcp.json"
echo ""
