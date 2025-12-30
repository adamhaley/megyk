# Megyk Dashboard - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Application Architecture](#application-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Database Schema](#database-schema)
6. [External Integrations](#external-integrations)
7. [Component Hierarchy](#component-hierarchy)
8. [Performance Optimizations](#performance-optimizations)

---

## System Overview

Megyk Dashboard is a dual-purpose Next.js application serving two distinct business needs:

### 1. Book Summaries Management System
- **Purpose**: Manage a catalog of book summaries with automated PDF processing
- **Users**: Content managers, editors
- **Key Features**: CRUD operations, PDF upload, search, metadata management

### 2. Sales Campaign Dashboard
- **Purpose**: Track and analyze German dentist lead generation campaign
- **Users**: Sales team, campaign managers
- **Key Features**: Analytics, company data management, export tracking

### Technology Decisions

| Technology | Version | Rationale |
|------------|---------|-----------|
| Next.js | 15.5.3 | Latest App Router, React Server Components, Turbopack |
| React | 19.1.0 | Latest features, improved performance |
| TypeScript | 5.x | Type safety, better DX |
| Tailwind CSS | 4.1.13 | Utility-first, rapid UI development |
| Supabase | Latest | Managed PostgreSQL, built-in auth, real-time capabilities |
| Recharts | 3.2.1 | React-native charts, good TypeScript support |

---

## Application Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Route group: protected routes
│   │   ├── books/                # Book management
│   │   │   ├── [id]/             # Dynamic book routes
│   │   │   │   ├── edit/         # Edit book page
│   │   │   │   └── page.tsx      # View book page
│   │   │   ├── new/              # Create book page
│   │   │   └── page.tsx          # Book list page
│   │   ├── sales-campaign/       # Sales dashboard
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth protection + shared layout
│   ├── api/
│   │   └── ingest-book/          # PDF upload proxy to n8n
│   │       └── route.ts
│   ├── auth/
│   │   └── signout/              # Sign out route
│   │       └── route.ts
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (redirects based on auth)
│   └── globals.css               # Global styles + Tailwind
├── components/                   # React components
│   ├── AnalyticsChart.tsx        # Reusable donut chart
│   ├── AnalyticsDashboard.tsx    # Three-chart dashboard
│   ├── BookDetail.tsx            # Book detail view
│   ├── BookDropzone.tsx          # PDF upload component
│   ├── BookForm.tsx              # Book create/edit form
│   ├── BookList.tsx              # Book listing
│   ├── BookSearch.tsx            # Book search
│   ├── CompanyDashboard.tsx      # Company analytics
│   ├── CompanyTable.tsx          # Company data table
│   ├── MobileNav.tsx             # Mobile navigation
│   ├── SearchBar.tsx             # Generic search
│   └── Sidebar.tsx               # Desktop sidebar
├── lib/                          # Business logic & utilities
│   ├── analytics.ts              # Analytics data fetching
│   ├── books.ts                  # Book CRUD operations
│   ├── companies.ts              # Company data operations
│   ├── supabase.ts               # Browser Supabase client
│   └── supabase-server.ts        # Server Supabase client (SSR)
└── types/                        # TypeScript definitions
    ├── book.ts
    └── company.ts
```

### Route Protection Pattern

```typescript
// src/app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const supabase = await createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')  // Redirect unauthenticated users
  }
  
  return (
    <div>
      <Sidebar userEmail={session.user.email} />
      <main>{children}</main>
    </div>
  )
}
```

**Why route groups?** The `(dashboard)` route group allows:
- Shared layout and auth protection
- Logical grouping without affecting URL structure
- Clean separation of public vs protected routes

---

## Authentication Flow

### Implementation: Supabase Auth with SSR

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Visit /books
       ↓
┌─────────────────────────┐
│ Server Component (RSC)  │
│ - Check session cookie  │
└──────┬─────────┬────────┘
       │         │
   No session    │ Has session
       │         │
       ↓         ↓
  Redirect    Render page
  to /login   with data
```

### Key Files

1. **Server-side client** (`lib/supabase-server.ts`):
   ```typescript
   export const createServerComponentClient = async () => {
     const cookieStore = await cookies()
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() { return cookieStore.getAll() },
           setAll(cookiesToSet) { /* ... */ }
         }
       }
     )
   }
   ```

2. **Browser client** (`lib/supabase.ts`):
   ```typescript
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

### Why Two Clients?

| Client | Use Case | Key Feature |
|--------|----------|-------------|
| Server | RSC, API routes, middleware | Cookie-based session, SSR-safe |
| Browser | Client components, real-time | Direct Supabase access |

---

## Data Flow Patterns

### Pattern 1: Server-Side Rendering (Sales Campaign)

```
Client Request → Server Component → Supabase → Render HTML
```

**Example**: `/sales-campaign` page
- Initial data fetched on server
- Rendered to HTML before sending to client
- Better SEO, faster initial paint

### Pattern 2: Client-Side Fetching (Book Management)

```
Client Component → useEffect → Supabase → setState → Re-render
```

**Example**: `/books` page
- Client-side pagination
- Interactive search
- Optimistic updates

**Why client-side for books?**
- More interactive (drag-and-drop, instant search)
- Frequent user interactions
- Real-time updates not critical

### Pattern 3: API Route Proxy (n8n Webhooks)

```
Client → Next.js API Route → n8n Webhook → Process → Update Supabase
```

#### Example 1: PDF Upload
**Flow**:
1. User drops PDF in BookDropzone
2. POST to `/api/ingest-book`
3. Next.js forwards to n8n webhook
4. n8n extracts metadata, generates summary
5. n8n updates Supabase `books` table
6. Client polls or gets notified of completion

#### Example 2: Book Enrichment
**Flow**:
1. User clicks "Enrich Book" button
2. POST to `/api/enrich-book` with `{ bookId: "uuid" }`
3. Next.js forwards to n8n webhook
4. n8n fetches book data and enriches it
5. n8n updates Supabase `books` table
6. Client shows success/error feedback

**Why proxy through Next.js?**
- Hide n8n webhook URL
- Add authentication/validation
- Handle CORS properly
- Log requests
- Centralized error handling

---

## Database Schema

### Books System

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  summary TEXT,
  isbn VARCHAR(20),
  cover_image_url TEXT,
  publication_year INTEGER,
  page_count INTEGER,
  default_summary_pdf_url TEXT,
  live BOOLEAN DEFAULT false,
  book_genre_id UUID REFERENCES book_genres(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_live ON books(live);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
```

### Sales Campaign System

```sql
-- Main company data
CREATE TABLE german_companies (
  id UUID PRIMARY KEY,
  company VARCHAR(255),
  industry VARCHAR(100),
  ceo_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  analysis TEXT,
  exported_to_instantly BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Postal code reference data
CREATE TABLE german_zip_codes (
  id UUID PRIMARY KEY,
  "Name" VARCHAR(255),
  "PLZ" VARCHAR(10),
  "Kreis code" VARCHAR(20),
  "Land name" VARCHAR(100),
  "Land code" VARCHAR(20),
  "Kreis name" VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution tracking for Finder Felix
CREATE TABLE finder_felix_executions (
  id UUID PRIMARY KEY,
  execution VARCHAR(100),
  postal_code VARCHAR(10),
  num_results INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Optimized Analytics Views

```sql
-- Aggregated company statistics
CREATE VIEW companies_stats AS
SELECT 
  COUNT(*)::integer AS total_companies,
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website <> '')::integer AS companies_with_website,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email <> '')::integer AS companies_with_email,
  COUNT(*) FILTER (WHERE exported_to_instantly = true)::integer AS exported_companies,
  ROUND(COUNT(*) FILTER (WHERE website IS NOT NULL AND website <> '')::float / NULLIF(COUNT(*), 0) * 100, 0)::integer AS website_percentage,
  ROUND(COUNT(*) FILTER (WHERE email IS NOT NULL AND email <> '')::float / NULLIF(COUNT(*), 0) * 100, 0)::integer AS email_percentage,
  ROUND(COUNT(*) FILTER (WHERE exported_to_instantly = true)::float / NULLIF(COUNT(*), 0) * 100, 0)::integer AS export_percentage
FROM german_companies;

-- Postal code coverage
CREATE VIEW finder_felix_coverage AS
SELECT 
  (SELECT COUNT(*)::integer FROM german_zip_codes) AS total_postal_codes,
  get_unique_postal_codes_count() AS covered_postal_codes,
  ROUND(get_unique_postal_codes_count()::float / NULLIF((SELECT COUNT(*) FROM german_zip_codes), 0) * 100, 0)::integer AS coverage_percentage;

-- Helper function
CREATE FUNCTION get_unique_postal_codes_count() RETURNS integer AS $$
  SELECT COUNT(DISTINCT postal_code)::integer
  FROM finder_felix_executions
  WHERE postal_code IS NOT NULL;
$$ LANGUAGE sql STABLE;
```

---

## External Integrations

### n8n Workflow Automation

The application integrates with n8n through two webhooks:

#### 1. Book Ingestion Webhook

**Base URL**: Configured via `N8N_BASE_URL` environment variable
**Webhook Endpoint**: `/webhook/ingest_book`
**Full URL**: `${N8N_BASE_URL}/webhook/ingest_book`
**Method**: POST (multipart/form-data)

**Purpose**: Process uploaded book PDFs and extract metadata

**Flow**:
1. Receive PDF file via webhook
2. Extract text content (OCR/parsing)
3. Use AI to generate:
   - Title extraction (if not provided)
   - Author detection
   - Summary generation
   - Genre classification
4. Store processed data back to Supabase
5. Generate PDF summary document
6. Return success/failure response

#### 2. Book Enrichment Webhook

**Base URL**: Configured via `N8N_BASE_URL` environment variable
**Webhook Endpoint**: `/webhook/enrich_book`
**Full URL**: `${N8N_BASE_URL}/webhook/enrich_book`
**Method**: POST (application/json)
**Body**: `{ "bookId": "uuid" }`

**Purpose**: Enrich existing book data with additional metadata

**Flow**:
1. Receive book ID via webhook
2. Fetch current book data from Supabase
3. Use AI/APIs to enhance:
   - Summary improvement
   - Additional metadata
   - Cover image fetching
   - Genre refinement
4. Update book data in Supabase
5. Return success/failure response

**Triggered by**: "Enrich Book" button on each book card

**Integration Code** (`app/api/ingest-book/route.ts`):
```typescript
const N8N_BASE_URL = process.env.N8N_BASE_URL
const N8N_WEBHOOK_URL = `${N8N_BASE_URL}/webhook/ingest_book`

export async function POST(request: NextRequest) {
  // Validate environment variable
  if (!N8N_BASE_URL) {
    return NextResponse.json(
      { error: 'N8N_BASE_URL environment variable is not configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  
  // Forward to n8n
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    return NextResponse.json({ error: 'n8n webhook failed' }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

---

## Component Hierarchy

### Desktop Layout
```
RootLayout
└── (dashboard)/layout.tsx
    ├── Sidebar (fixed, left)
    │   ├── Logo
    │   ├── Navigation Links
    │   │   ├── Book Summaries → /books
    │   │   └── Sales Campaign → /sales-campaign
    │   └── User Section
    │       ├── Email display
    │       └── Sign out button
    └── Main Content Area
        └── {children}
```

### Mobile Layout
```
RootLayout
└── (dashboard)/layout.tsx
    ├── MobileNav (hamburger menu)
    │   └── [Same links as Sidebar]
    └── Main Content Area (full width)
        └── {children}
```

### Key Components

#### 1. AnalyticsChart (Reusable Donut Chart)
```typescript
interface AnalyticsChartProps {
  title: string
  subtitle: string
  data: { name: string; value: number; color: string }[]
  centerText: { main: string; sub: string }
}
```
**Used by**: AnalyticsDashboard (3 instances)

#### 2. BookDropzone (File Upload)
```typescript
interface BookDropzoneProps {
  onUploadSuccess: () => void
}
```
**Features**:
- Drag-and-drop interface
- File type validation (PDF only)
- Upload progress indicator
- Success/error handling

#### 3. BookForm (Create/Edit)
```typescript
interface BookFormProps {
  book?: Book  // undefined for create, Book for edit
  onSubmit: (data: BookFormData) => Promise<void>
  onCancel: () => void
}
```
**Features**:
- Controlled form inputs
- Validation
- Loading states
- Error display

---

## Performance Optimizations

### 1. SQL-Level Aggregations

**Before** (Client-side):
```typescript
// Fetch all companies
const { data: companies } = await supabase.from('german_companies').select('*')

// Calculate in JavaScript
const withWebsite = companies.filter(c => c.website).length
const percentage = (withWebsite / companies.length) * 100
```

**After** (Server-side view):
```typescript
// Single query, aggregated on DB
const { data } = await supabase.from('companies_stats').select('*').single()
// { total_companies: 5000, companies_with_website: 3500, website_percentage: 70 }
```

**Impact**: 
- 100x+ faster for large datasets
- Reduced network transfer
- Lower memory usage

### 2. Pagination Strategy

**Load More Pattern**:
```typescript
const [page, setPage] = useState(1)
const [books, setBooks] = useState<Book[]>([])

const loadMore = async () => {
  const { data } = await getBooks({ page: page + 1, limit: 20 })
  setBooks(prev => [...prev, ...data])  // Append
  setPage(page + 1)
}
```

**Benefits**:
- Better UX than traditional pagination
- Progressive loading
- Works well on mobile

### 3. Turbopack Build Optimization

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}
```

**Impact**: 
- ~5x faster development builds
- Faster HMR (Hot Module Replacement)

### 4. Selective Data Fetching

**Bad**:
```typescript
// Fetches all columns
const { data } = await supabase.from('books').select('*')
```

**Good**:
```typescript
// Only fetch what's needed for list view
const { data } = await supabase
  .from('books')
  .select('id, title, author, status, cover_image_url')
```

---

## Security Considerations

### 1. Row-Level Security (RLS)
- Supabase RLS policies should be configured
- Ensure only authenticated users can access data
- Consider role-based access for admin functions

### 2. Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Never commit these to git!
```

### 3. API Route Protection
```typescript
// Future enhancement: Add auth check in API routes
export async function POST(request: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... rest of handler
}
```

---

## Future Architectural Considerations

### 1. State Management
**Current**: Local component state
**Future**: Consider Zustand or React Context for:
- User preferences
- Filter persistence
- Cache management

### 2. Real-time Updates
Supabase supports real-time subscriptions:
```typescript
supabase
  .channel('books')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'books' },
    (payload) => {
      // Update local state
    }
  )
  .subscribe()
```

### 3. Caching Layer
Consider React Query or SWR for:
- Automatic refetching
- Optimistic updates
- Cache invalidation

### 4. Error Tracking
Integrate Sentry or similar for:
- Error monitoring
- Performance tracking
- User session replay

---

## Deployment Architecture

```
Internet
    ↓
Caddy Reverse Proxy (megyk.com)
    ↓
┌──────────────────────────────────┐
│   DigitalOcean Droplet           │
│                                  │
│  ┌────────────┐  ┌────────────┐ │
│  │  Next.js   │  │    n8n     │ │
│  │   :3000    │  │   :5678    │ │
│  └────────────┘  └────────────┘ │
│                                  │
└──────────────────────────────────┘
         ↓
    Supabase Cloud
    (PostgreSQL + Auth)
```

**Reverse Proxy Config** (Caddy):
```
megyk.com {
  reverse_proxy localhost:3000
}

n8n.megyk.com {
  reverse_proxy localhost:5678
}
```

---

## Conclusion

This architecture balances:
- **Performance**: SQL-level aggregations, pagination, Turbopack
- **Developer Experience**: TypeScript, modern React patterns, clear structure
- **Scalability**: Modular components, efficient queries, cloud infrastructure
- **Maintainability**: Clear separation of concerns, documented patterns

The dual-purpose nature is well-handled through route organization and shared components where appropriate.

