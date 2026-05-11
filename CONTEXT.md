# IPOS — Project Context

## What this is

IPOS (It’s Probably On Site) is a materials management PWA for Vistry Group housebuilding sites, built under the MiBe brand. Multi-tenant SaaS. Single operator enters all data. Trades and site managers get read-only access via token URL.

-----

## Stack

- **Framework:** Next.js + TypeScript (App Router)
- **Database:** Turso (libSQL/SQLite) + Drizzle ORM
- **Auth:** Clerk — single admin account only
- **File storage:** Cloudflare R2 — deferred to Phase 6
- **Email:** Copy-to-clipboard. Operator sends from Vistry Outlook manually.
- **Background jobs:** Trigger.dev — deferred until needed
- **Deployment:** Vercel (ipos-theta.vercel.app)
- **PWA:** next-pwa + Workbox, offline-first

-----

## Current state

- **Phase 1 complete:** Next.js scaffold, Turso + Drizzle, Clerk auth, GitHub, Vercel, PWA skeleton
- **Phase 2 in progress:** Master data CRUD
- **Next up:** Brief 1 — DB schema

-----

## Key decisions (not obvious from code)

- **Email:** Resend removed. IPOS assembles the email; operator copies to clipboard and sends from Vistry Outlook.
- **Read-only access:** Trades and site managers use a per-site token URL (stored as `read_only_token` on Site). No Clerk accounts, no login.
- **Brand is per plot**, not per site — a single phase can have Linden and Bovis plots simultaneously.
- **Tenure drives spec:** PFS = brand spec. All other tenures (affordable rent, social rent, shared ownership) = HA spec. No fallback logic.
- **SitePhase sits between Site and Plot** — each phase has its own construction programme.
- **Delivery date type:** OrderLine has `delivery_date_type` (wc / specific). W/c flags red following Monday; specific flags red following day.
- **Site switcher:** App remembers last active site. Tap site name in header to switch. No forced picker on login.
- **Reporting suite:** Deferred to future phase. Not required at launch.
- **Cloudflare R2:** Deferred to Phase 6.
- **Trigger.dev:** Not set up yet. Deferred until background jobs are needed.
- **Next.js 16:** Uses `proxy.ts` not `middleware.ts`. dotenv-cli wrapper used for drizzle-kit commands.

-----

## Deferred scope (don’t build yet)

- Client dashboard access and login
- Role-based access control (RBAC) — schema designed, not built
- Reporting suite
- Bulk calloff flow
- Supplier retire/replace workflow (Phase 5)
- Cloudflare R2 / photo storage (Phase 6)
- Trigger.dev / background jobs
- Non-supply trades in programme
- Cost and value reporting

-----

## Domain language (use these terms consistently)

- **Plot** not unit
- **Calloff** not order request
- **BOM** or **schedule** not bill (Vistry say schedule)
- **Fix stage** = 1st fix or 2nd fix
- **PFS** = Private For Sale (not “private”)
- **W/c** = week commencing

-----

## Working method

1. Discuss and agree in Claude.ai — produce a Cline brief
1. Paste brief into Cline Plan mode — review plan output
1. Bring plan back to Claude.ai for joint review
1. Only on mutual go-ahead: Cline Act mode
1. Test — bring issues back to Claude.ai

Never go to Act mode with an undiscussed idea.

-----

## Pilot site

The Hem — first live site for IPOS.
