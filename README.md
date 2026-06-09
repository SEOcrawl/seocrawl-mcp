# SEOcrawl AI — MCP Server

> **The SEO + GEO MCP server: your Google Search Console, site audits and SEO tasks inside your AI assistant.**

[SEOcrawl AI](https://seocrawl.ai) is an SEO + GEO (AI visibility) platform. This repository is the public manifest for the **SEOcrawl AI MCP server** so MCP clients and directories can discover it. The server is hosted and remote — **there is nothing to install**.

- **Endpoint:** `https://mcp.seocrawl.ai` (universal URL, Streamable HTTP)
- **Auth:** OAuth 2.0 (Dynamic Client Registration) — sign in with your SEOcrawl AI account
- **Tools:** 21, across 7 groups
- **Website / full docs:** **https://seocrawl.ai/mcp**
- **Built on** the open [Model Context Protocol](https://modelcontextprotocol.io)

21 MCP tools, one connector. Pull live Google Search Console data, drill into any keyword or page, surface technical issues from your site audit, and create or close SEO tasks — all from a chat. Works out of the box with **Claude, ChatGPT, Cursor and Claude Code**.

---

## Quick start

Add the endpoint to your MCP client and sign in with your SEOcrawl AI account when prompted. Same URL for everyone — nothing to switch on in your account first.

**Claude** (Claude.ai / Desktop) — Settings → Connectors → Add custom connector → `https://mcp.seocrawl.ai`

**ChatGPT** — Apps connector → add SEOcrawl AI, then mention `@SEOcrawl` in chat

**Cursor** — Settings → MCP → Add server → `https://mcp.seocrawl.ai`

**Claude Code** — `claude mcp add seocrawl https://mcp.seocrawl.ai`

Or drop in the included `.mcp.json`:

```json
{ "mcpServers": { "seocrawl": { "type": "http", "url": "https://mcp.seocrawl.ai" } } }
```

---

## Use cases

Nine real conversations you can have today. Each maps to the actual MCP tools listed further down — no exports, no copy-paste. See them rendered with live chat mockups on the [landing page](https://seocrawl.ai/mcp).

### 1. Search Console recap, in chat — `get_gsc_summary` · `compare_date_ranges`
Get your weekly Search Console recap in one message. Ask for the last 28 days vs the 28 before and your assistant returns clicks, impressions, CTR and average position with the diff and % change already calculated.
> *"Compare seocrawl.ai performance for the last 28 days vs the previous 28 — clicks, impressions, CTR and average position."*

### 2. Growing and declining pages — `get_top_pages` · `get_page_detail`
See which pages move the needle and which just dropped. Ranked by clicks with period-over-period deltas; pull the daily breakdown for any URL you call out.
> *"Top 5 pages by clicks on seocrawl.ai this last 28 days, and which ones dropped vs the previous 28."*

### 3. Keyword deep dive — `get_keyword_detail`
Zoom into a single keyword's day-by-day trend — useful for catching the exact day a position shift happened or correlating with a Google update.
> *"Show me the daily trend for 'geo optimization' on seocrawl.ai for the last 28 days — clicks, impressions and position."*

### 4. From insight to action — `create_task`
Spin up an SEO task without leaving the chat. Title, description, assignee, priority (1–5) and taskbox, all in one call, straight into your SEOcrawl Task Manager.
> *"Create a task to update the meta title on /blog/technical-seo. Priority 2, assigned to me, description should mention the -38% click drop."*

### 5. One-chat task triage — `list_tasks` · `update_task` · `add_comment`
Triage your open SEO tasks in a single chain: list what's open, change status, and append a comment with what was done — three MCP calls, one natural-language request.
> *"List my open tasks on seocrawl.ai, mark 'Update meta title on /blog/technical-seo' as Done, and add a comment with the new title."*

### 6. Biggest movers, ranked — `list_winners_losers`
See the gainers and decliners between two periods without drilling each one. Keywords or pages, deltas pre-computed.
> *"What are the biggest keyword movers on seocrawl.ai — last 28 days vs the previous 28? Show the top gainers and the biggest decliners."*

### 7. Spot keyword cannibalization — `list_pages_for_keyword`
Find every page competing for the same query, ranked — so you can pick a canonical one when two URLs split the same intent.
> *"Which pages on seocrawl.ai rank for 'seo dashboard'? I want to check whether more than one URL is competing for it."*

### 8. Mark the moment, read it back — `add_annotation` · `list_annotations`
Pin context to your Search Console timeline — a migration, a Google update, a big publish — then read the timeline back so the 'why' behind a traffic shift is never lost.
> *"Add an annotation on seocrawl.ai for today: 'Shipped new /mcp landing'. Then list the annotations from the last 3 months."*

### 9. Find the pages behind a technical issue — `page_explorer`
Turn your site audit into a question. Ask for pages with a missing canonical, no H1, a 404, or any audit check, and get the exact URLs from your latest crawl with health score and error/warning counts.
> *"On seocrawl.ai, list pages from the last crawl that are missing an H1 or return a 404 — worst health first."*

---

## The 21 tools

**Properties**
- `list_properties` — every GSC property the authenticated user can access (returns the property ID + URL used by all other tools).

**Performance overview**
- `get_gsc_summary` — clicks, impressions, CTR and average position over a window (presets or absolute dates) + branded vs non-branded breakdown.
- `compare_date_ranges` — two windows side by side with diff + change_pct.
- `list_winners_losers` — biggest movers between two periods (keywords or pages), deltas pre-computed.

**Keywords**
- `get_top_keywords` — top keywords ranked by clicks/impressions/CTR/position, period-over-period, branded filter, paginated.
- `get_keyword_detail` — daily time series for a single query.
- `list_pages_for_keyword` — pages earning a query's clicks (cannibalization / canonical finding).

**Pages**
- `get_top_pages` — top pages with period-over-period deltas, paginated.
- `get_page_detail` — daily time series for a single URL.
- `list_keywords_for_page` — queries driving a page's clicks (the inverse of list_pages_for_keyword).

**Tasks**
- `list_tasks` — all tasks for a property, filterable by status/assignee/taskbox/search.
- `get_task` — full detail (UUID, slug or task URL).
- `create_task` — create a task (title required + optional description, assignee, priority, taskbox).
- `update_task` — partial update of any field, or unassign.
- `add_comment` — append a comment to a task.
- `get_comments` — list comments incl. nested replies.

**Annotations**
- `add_annotation` — dated chart note (+ optional description, category, linked task).
- `list_annotations` — annotations in a date range, newest first.
- `get_annotation` — full detail for one annotation.
- `delete_annotation` — remove your own custom annotation.

**Site Audit**
- `page_explorer` — crawled pages matching technical criteria (status code, missing canonical, missing H1, any audit check), sorted by health, with indexability, performance score, error/warning counts.

---

## Compatible clients

Any MCP-compatible client works — the server uses the open MCP transport with no client-specific code paths. The four most common setups: **Claude** (Claude.ai + Desktop), **ChatGPT** (Apps connector), **Cursor**, and **Claude Code**.

## Plans & metering

MCP access is included on every SEOcrawl AI plan. Each plan ships with a monthly MCP credit pool; per-minute rate limits and a hard daily cap apply on every plan. See [pricing](https://seocrawl.ai/pricing).

## Data & privacy

The MCP authenticates against your SEOcrawl AI account and reads the same Search Console properties and tasks you see in the app. Data is never shared across accounts. Privacy policy: https://seocrawl.ai/legal

## Support

Questions or issues: **info@seocrawl.com** · Full docs and live examples: **https://seocrawl.ai/mcp**

---

*SEOcrawl SL · Andorra · An SEO + GEO platform that monitors organic performance and brand mentions across LLMs (ChatGPT, Claude, Gemini, Perplexity). [seocrawl.ai](https://seocrawl.ai)*
