# SEOcrawl AI — MCP Server

> **The SEO + GEO MCP server: your Google Search Console, GA4, AI-visibility tracking and SEO tasks inside your AI assistant.**

[SEOcrawl AI](https://seocrawl.ai) is an SEO + GEO (AI visibility) platform. This repository is the public manifest for the **SEOcrawl AI MCP server** so MCP clients and directories can discover it. The server is hosted and remote — **there is nothing to install**.

- **Endpoint:** `https://mcp.seocrawl.ai` (universal URL, Streamable HTTP)
- **Auth:** OAuth 2.0 (Dynamic Client Registration) — sign in with your SEOcrawl AI account
- **Tools:** 38, across 12 groups (GSC, GA4, AI Tracker, Site Audit, Tags, SEO tasks)
- **Website / full docs:** **https://seocrawl.ai/mcp**
- **Built on** the open [Model Context Protocol](https://modelcontextprotocol.io)

38 MCP tools, one connector. Pull live Google Search Console and Google Analytics 4 data, drill into any keyword or page, slice it by your own tags, track your AI visibility across ChatGPT, Claude, Gemini and Perplexity, measure the traffic those engines send you, surface technical issues from your site audit, and create or close SEO tasks — all from a chat. Works out of the box with **Claude, ChatGPT, Cursor and Claude Code**.

---

## Demo

[![SEOcrawl AI MCP — live demo](https://i.ytimg.com/vi/NsLExbx1lL8/hqdefault.jpg)](https://youtu.be/NsLExbx1lL8)

▶️ **[Watch the 4-minute walkthrough](https://youtu.be/NsLExbx1lL8)** — connect the server to ChatGPT or Claude and query real Google Search Console data, run site audits, inspect any live URL, track AI visibility, and manage tags, annotations and your task board.

---

## Quick start

Add the endpoint to your MCP client and sign in with your SEOcrawl AI account when prompted. Same URL for everyone — nothing to switch on in your account first.

**Claude** (Claude.ai / Desktop) — Settings → Connectors → Add custom connector → `https://mcp.seocrawl.ai`

**ChatGPT** — Apps connector → add SEOcrawl AI, then mention `@SEOcrawl` in chat

**Cursor** — Settings → MCP → Add server → `https://mcp.seocrawl.ai`

**Claude Code** — `claude mcp add --transport http seocrawl https://mcp.seocrawl.ai`

Or drop in the included `.mcp.json`:

```json
{ "mcpServers": { "seocrawl": { "type": "http", "url": "https://mcp.seocrawl.ai" } } }
```

---

## Use cases

A few real conversations you can have today. Each maps to the actual MCP tools below — no exports, no copy-paste. See them rendered with live chat mockups on the [landing page](https://seocrawl.ai/mcp).

### 1. Search Console recap, in chat — `get_gsc_summary` · `compare_date_ranges`
> *"Compare seocrawl.ai performance for the last 28 days vs the previous 28 — clicks, impressions, CTR and average position."*

### 2. Growing and declining pages — `get_top_pages` · `get_page_detail`
> *"Top 5 pages by clicks on seocrawl.ai this last 28 days, and which ones dropped vs the previous 28."*

### 3. Audit your AI visibility — `list_prompts` · `get_ga4_ai_referrers`
> *"Which AI Tracker prompts is seocrawl.ai running, and how much traffic did ChatGPT and Perplexity send us last month?"*

### 4. Slice your data by your own taxonomy — `list_tags` · `get_top_keywords`
> *"Show me top keywords on seocrawl.ai tagged 'commercial' — last 28 days vs the previous 28."*

### 5. Your GA4 recap, next to your GSC data — `get_ga4_summary` · `get_ga4_traffic_by_source`
> *"GA4 sessions, users and conversions for seocrawl.ai last 28 days, plus the top traffic sources."*

### 6. From insight to action — `create_task` · `update_task`
> *"Create a task to update the meta title on /blog/technical-seo. Priority 2, assigned to me, mention the -38% click drop."*

### 7. Find the pages behind a technical issue — `page_explorer`
> *"On seocrawl.ai, list pages from the last crawl that are missing an H1 or return a 404 — worst health first."*

### 8. Inspect any live URL on demand — `fetch_url`
> *"Fetch https://seocrawl.ai/pricing and show its title, meta description, canonical and any images missing alt."*

---

## The 38 tools

**Properties**
- `list_properties` — every GSC property you can access (returns the property ID + URL used by all other tools).

**Performance overview**
- `get_gsc_summary` — clicks, impressions, CTR and average position over a window, plus branded vs non-branded breakdown.
- `compare_date_ranges` — two GSC windows side by side with diff + change_pct.
- `list_winners_losers` — biggest movers between two periods (keywords or pages), deltas pre-computed.

**Keywords**
- `get_top_keywords` — top keywords by clicks/impressions/CTR/position, period-over-period, branded filter, paginated.
- `get_keyword_detail` — daily time series for a single query.
- `list_pages_for_keyword` — pages earning a query's clicks (cannibalization / canonical finding).

**Pages**
- `get_top_pages` — top pages with period-over-period deltas, paginated.
- `get_page_detail` — daily time series for a single URL.
- `list_keywords_for_page` — queries driving a page's clicks (the inverse of list_pages_for_keyword).

**Tasks**
- `list_tasks` — all tasks for a property, filterable by status/assignee/taskbox/search.
- `list_taskboxes` — the task board's columns (taskboxes) for a property.
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
- `page_explorer` — crawled pages matching technical criteria (status code, missing canonical, missing H1, any audit check), sorted by health, with indexability, performance score and error/warning counts.

**AI Tracker**
- `list_prompts` — AI Tracker (Brand Radar) prompts a property tracks, with engines, last run and runs-in-range; filter by engine (ChatGPT, Claude, Gemini, Perplexity).

**GA4 Web Analytics**
- `list_ga4_properties` — GA4 properties connected to your projects.
- `get_ga4_summary` — sessions, users, new users, conversions, engagement rate and sessions/user, each vs the previous period.
- `compare_ga4_date_ranges` — two GA4 windows side by side with diff + change_pct.
- `get_ga4_traffic_by_source` — sessions by source/medium or default channel grouping, with share %.
- `get_ga4_ai_referrers` — AI/LLM referral traffic by engine (ChatGPT, Perplexity, Gemini, Claude, Copilot…). Your GEO traffic, measured.

**Tags**
- `list_tags` — a property's keyword and page tags with rule and member counts.
- `create_tag` — create a keyword/url/both tag (optional hex color).
- `apply_tag` — manually apply a tag to specific keywords and/or pages.
- `remove_tag` — unassign a tag from specific keywords and/or pages.
- `delete_tag` — delete a tag entirely (built-in Brand / Non-Brand tags are protected).
- `list_tag_rules` — auto-assignment rules that tag keywords/pages automatically.
- `create_tag_rule` — create an auto-assignment rule (contains, exact, starts/ends_with, regex).
- `delete_tag_rule` — delete an auto-assignment rule by id.

**Web Fetch**
- `fetch_url` — fetch a live URL on demand and get final URL, status, redirect chain, timing, parsed SEO elements, clean markdown and raw HTML. Free — never burns MCP credits.

**Platform health**
- `health` — live status of each backend surface (GSC, GA4, Site Audit, AI Tracker, Tasks). Free, no arguments.

---

## Compatible clients

Any MCP-compatible client works — the server uses the open MCP transport with no client-specific code paths. The four most common setups: **Claude** (Claude.ai + Desktop), **ChatGPT** (Apps connector), **Cursor**, and **Claude Code**.

## Plans & metering

MCP access is included on every SEOcrawl AI plan. Each plan ships with a monthly MCP credit pool; per-minute rate limits and a hard daily cap apply on every plan. See [pricing](https://seocrawl.ai/pricing).

## Data & privacy

The MCP authenticates against your SEOcrawl AI account and reads the same Search Console properties, GA4 data and tasks you see in the app. Data is never shared across accounts. Privacy policy: https://seocrawl.ai/legal

## Support

Questions or issues: **info@seocrawl.com** · Full docs and live examples: **https://seocrawl.ai/mcp**

---

*SEOcrawl SL · Andorra · An SEO + GEO platform that monitors organic performance and brand mentions across LLMs (ChatGPT, Claude, Gemini, Perplexity). [seocrawl.ai](https://seocrawl.ai)*
