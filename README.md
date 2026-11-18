# SEOcrawl AI — MCP Server

> **The SEO + GEO MCP server: your Google Search Console, GA4, Crawler, Google Discover and AI-visibility data inside your AI assistant.**

[SEOcrawl AI](https://seocrawl.ai) is an SEO + GEO (AI visibility) platform. This repository is the public manifest for the **SEOcrawl AI MCP server** so MCP clients and directories can discover it. The server is hosted and remote — **there is nothing to install**.

- **Endpoint:** `https://mcp.seocrawl.ai` (universal URL, Streamable HTTP)
- **Auth:** OAuth 2.0 (Dynamic Client Registration) — sign in with your SEOcrawl AI account
- **Tools:** 91, across 19 groups (Search Console, Google Discover, index coverage, Crawler, Code Monitor, Prompt Tracking, GA4, Tags, Smart Views, Reporting, tasks and more)
- **Website / full docs:** **https://seocrawl.ai/mcp**
- **Built on** the open [Model Context Protocol](https://modelcontextprotocol.io)
- **Official MCP Registry:** `ai.seocrawl/mcp`

One connector, 91 tools. Pull live Google Search Console and Google Analytics 4 data, drill into any keyword or page, slice it by your own tags and Smart Views, check index coverage and Google Discover, read the issues from your site crawler, track your AI visibility on ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews and Google AI Mode (Microsoft Copilot is coming soon), measure the traffic those engines send you, and create or close SEO tasks — all from a chat. Works with **Claude, ChatGPT, Cursor and Claude Code**.

---

## Demo

[![SEOcrawl AI MCP — live demo](https://i.ytimg.com/vi/NsLExbx1lL8/hqdefault.jpg)](https://youtu.be/NsLExbx1lL8)

▶️ **[Watch the walkthrough](https://youtu.be/NsLExbx1lL8)** — connect the server to ChatGPT or Claude and query real Google Search Console data, run site audits, inspect any live URL, track AI visibility, and manage tags, annotations and your task board.

---

## Quick start

Add the endpoint to your MCP client and sign in with your SEOcrawl AI account when prompted. Same URL for everyone — nothing to switch on in your account first.

**Claude** (Claude.ai, Claude Desktop) — open SEOcrawl AI in the Claude directory and click Connect, or go to Customize → Connectors → + Add → Add custom connector and paste `https://mcp.seocrawl.ai`. On the Free plan, Claude allows one custom connector.

**ChatGPT** — open the SEOcrawl AI app in the ChatGPT directory and click Connect, then mention `@SEOcrawl AI` in a chat.

**Cursor** — add this to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project), and sign in when Cursor asks:

```json
{ "mcpServers": { "seocrawl": { "url": "https://mcp.seocrawl.ai" } } }
```

**Claude Code** — `claude mcp add --transport http seocrawl https://mcp.seocrawl.ai`, then run `/mcp` inside Claude Code, pick `seocrawl` and choose Authenticate.

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

## The 91 tools

The names below are the real MCP tool IDs. Full descriptions: [seocrawl.ai/mcp](https://seocrawl.ai/mcp).

**Properties** (1)
- `list_properties` — List every GSC property the authenticated user can access.

**Performance overview** (3)
- `get_gsc_summary` — Clicks, impressions, CTR and average position for a property over a chosen window.
- `compare_date_ranges` — Compare two GSC windows side by side and get diff + change_pct for clicks, impressions, CTR and position.
- `list_winners_losers` — The biggest movers between two periods, with deltas pre-computed so your assistant skips drilling each item.

**Keywords** (5)
- `get_top_keywords` — Top keywords for a property ranked by clicks, impressions, CTR or position — with period-over-period comparison.
- `get_keyword_detail` — Daily time series (clicks, impressions, CTR, position) for a single search query in a property.
- `list_pages_for_keyword` — Given a single query, list the pages on your property that earn its clicks and impressions — ranked by clicks, impressions, CTR or position, with period-over-period deltas and next_cursor pagination.
- `find_keyword_opportunities` — Keyword ideas from a keyword research run started in the app (seed keywords, a page or a competitor domain), with Google Ads search volume, competition and bids next to your own Search Console presence.
- `list_keyword_clusters` — Your Search Console keywords grouped into topic clusters (built in the Keyword Map), each with clicks, impressions, average position, Google Ads search volume, traffic value and its 12-month demand curve.

**Pages** (3)
- `get_top_pages` — Top pages for a property ranked by clicks, impressions, CTR or position — every row returns clicks, impressions, CTR and position with period-over-period deltas.
- `get_page_detail` — Daily time series (clicks, impressions, CTR, position) for a single page URL in a property.
- `list_keywords_for_page` — Given a page URL, list the search queries driving its clicks and impressions — ranked by your chosen metric, with period-over-period deltas and next_cursor pagination.

**Google Discover** (3)
- `get_discover_summary` — Discover clicks, impressions and CTR for the range, each compared with the equal-length window immediately before it: *_current, *_prev, *_delta and *_change_pct (ctr is a 0–1 fraction).
- `get_discover_history` — The daily Discover trend: two series, clicks and impressions, as {date, value} points with missing days back-filled with 0 and ready to chart, plus the number of points and an insufficient_history flag.
- `get_discover_top_pages` — The property's top Discover pages ranked by clicks — or by impressions or CTR — each with its clicks, impressions and ctr for the range and the change against the preceding window.

**Index coverage** (4)
- `get_indexation_summary` — Index-coverage summary for a property: known (sitemap-submitted) URLs, how many Google indexes, indexed_pct and a by_state breakdown (Submitted and indexed, Crawled – currently not indexed, Discovered – currently not indexed,…
- `get_indexation_history` — The daily indexed-pages trend — one "indexed" series of {date, value} points, summed across the property's sitemaps and ready for a time-series chart.
- `list_indexation_pages` — The URLs currently in a given Google coverage state (pass the state exactly as get_indexation_summary reports it).
- `get_url_inspection` — Live Google URL Inspection for one page: coverage_state, verdict (PASS / NEUTRAL / FAIL), indexing_allowed, Google vs user canonical, last_crawl_time, robots_txt_state, page_fetch_state, sitemaps, a referring-URLs sample,…

**Tasks** (8)
- `list_tasks` — All tasks for a property.
- `list_taskboxes` — The task board's columns (taskboxes) for a property: id, name, status (todo / in_progress / done) and order.
- `get_task` — Full detail for a single task.
- `create_task` — Create a task on a property with title (required) plus optional description, assignee, priority (1–5, default 3) and taskbox (defaults to the TO-DO column).
- `update_task` — Partially update a task — any combination of title, description, assignee, priority, taskbox, or unassign:true to clear the owner.
- `add_comment` — Append a comment to a task.
- `get_comments` — List the comments on a task, including nested replies.
- `add_task_follower` — Add a teammate as a follower of a task, or drop them with remove:true.

**Roadmap milestones** (4)
- `list_milestones` — Every roadmap milestone on a property's board: id, slug, name, description, start_date and end_date (Y-m-d), color, progress (0–100, computed from the tasks sitting in the DONE column), state (upcoming / active / overdue / done /…
- `create_milestone` — Create a dated roadmap milestone.
- `update_milestone` — Partially update a milestone by id or slug — any combination of name, description, startDate, endDate and color.
- `assign_task_to_milestone` — Link a task to a milestone, or unlink it by leaving the milestone out.

**Annotations** (4)
- `add_annotation` — Create a chart note on a property for a given date (Y-m-d) with the note text — plus optional longer description, category and a linked task UUID.
- `list_annotations` — List a property's annotations within a date range, newest first.
- `get_annotation` — Full detail for a single annotation by its id — date, note, description, category, linked task, author and the property it belongs to.
- `delete_annotation` — Delete a custom annotation by its id.

**Crawler** (11)
- `list_site_audit_projects` — List the property's Crawler projects (crawl configurations) to find the audit_id to target.
- `create_crawler_project` — Create a Crawler project (write action): crawl the whole site, discovered from Search Console and sitemaps, or a fixed list of your own URLs.
- `update_crawler_project` — Rename a Crawler project, switch it between complete and list mode, or replace its URL list (write action).
- `delete_crawler_project` — Delete a Crawler project (write action, cannot be undone): it disappears from the app and from the read tools, and its weekly re-crawl stops.
- `get_site_audit_summary` — Technical-health summary of the latest crawl: health_score (current plus prev and delta), pages_crawled, crawl_date, issues_by_severity (critical / warning / notice, each with issue_types and pages_affected vs the previous…
- `list_site_audit_issues` — The technical issues detected by the latest crawl, most severe first — each with issue_code (pass it to list_site_audit_issue_pages), title, severity, category, pages_affected (with prev and delta), how_to_fix guidance and…
- `list_site_audit_issue_pages` — The exact URLs affected by one issue — pass its issue_code and get each offending url with the per-page value.
- `get_site_audit_page` — Full crawl detail for a single URL: status_code, crawl_depth, indexability_score and health_score, category_scores, issue_counts and issues[] — the page's failing checks, each with issue_code, severity, category, the per-page…
- `page_explorer` — Find crawled pages that match technical SEO criteria in your latest crawl.
- `trigger_site_audit_crawl` — Start a fresh crawl (write action) — queues the crawl and spends the project's crawler credits (separate from MCP credits) in proportion to the pages crawled.
- `compare_site_audit_crawls` — Diff two crawls to answer "what regressed or improved since last time?" — health_diff plus counts and four lists: new_issues, resolved_issues, worsened and improved, each issue carrying pages_affected, prev and delta.

**Code Monitor** (4)
- `list_code_monitor_pages` — List the pages a property tracks in Code Monitor, each with its monitoring status — url, last_change_at (most recent detected change) and changes_count (total changes detected).
- `list_code_monitor_changes` — List detected on-page code/HTML changes, newest first — each with url, date and change_types (Title, Canonical, Meta Description, noindex, robots.txt, sitemap.xml, H1, Status code, Hreflang, Open Graph, Twitter image, Analytics,…
- `get_code_monitor_change` — Get the before/after values for a single detected change, addressed by url + createdAt — one entry per changed field with type, property, before and after (arrays for multi-valued fields).
- `get_code_monitor_snapshot` — Get the most recent captured state of a monitored page — the current extracted on-page fields (title, canonical, meta description, meta robots, robots.txt, sitemap.xml, H1, headings, status code, hreflang, Open Graph image,…

**Prompt Tracking (AI visibility)** (15)
- `list_prompts` — List the prompts a property tracks.
- `get_prompt_detail` — Per-engine visibility for a single prompt: runs, mentions, mention_rate (%) and the change in percentage points vs the preceding period, for each engine it runs on (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, Google…
- `list_prompt_runs` — The individual engine executions behind one prompt — one row per run with date, engine, mentioned / mentioned_in_text flags and a response_excerpt (up to 600 chars of the actual AI answer).
- `list_prompt_citations` — The sources the AI engines cited when answering one prompt, aggregated over the range: own_domain plus every cited domain and URL flagged with is_own_domain and url_count — so you can see which of your pages earn citations and…
- `trigger_prompt_run` — Run a tracked prompt now on every engine it tracks instead of waiting for its schedule (write action).
- `create_prompt` — Create a tracked prompt: the question that runs against the AI engines.
- `update_prompt` — Partially update a tracked prompt — any combination of its text, engine list, country, response language or run cadence; omitted fields are left unchanged.
- `delete_prompt` — Delete a tracked prompt and all of its recorded engine responses.
- `list_prompt_topics` — List the prompt topics that group prompts on the Prompt Tracking page — each with topic_id and title.
- `create_prompt_topic` — Create (or fetch) a prompt topic by title — an idempotent upsert, so re-creating an existing title returns it unchanged with created=false.
- `update_prompt_topic` — Rename a prompt topic by its topicId.
- `delete_prompt_topic` — Delete a prompt topic.
- `get_ai_visibility_share_of_voice` — The aggregate share-of-voice view: your domain against its competitors across every tracked prompt, each domain ranked by share of voice (0–100 average visibility) with its change vs the preceding period, plus a head-to-head…
- `get_ai_visibility_mentions` — How often the brand is named across all tracked prompts in the range: total_prompts plus three mutually exclusive buckets — mentioned (named prominently), mentioned_in_text (only in the body of the answer) and absent — each with…
- `get_ai_visibility_history` — The daily AI-visibility trend: one series of {date, value} points where value is the percentage of tracked prompts whose answers linked to the brand that day, ready to chart.

**GA4 Web Analytics** (6)
- `list_ga4_properties` — List the GA4 properties connected to your projects.
- `get_ga4_summary` — Sessions, users, new users, conversions, engagement rate and sessions per user for a property over a chosen window — presets (last_7_days, last_28_days, last_3_months, last_year) or absolute from/to dates.
- `compare_ga4_date_ranges` — Compare two GA4 windows side by side — sessions, users, new users, conversions and engagement rate, with both values plus diff and change_pct per metric.
- `get_ga4_traffic_by_source` — Sessions broken down by acquisition source.
- `get_ga4_top_pages` — GA4 metrics per page (landing / URL), ranked so you see which pages drive the most sessions, signups (conversions) or users.
- `get_ga4_ai_referrers` — AI/LLM referral traffic by engine — ChatGPT, Perplexity, Gemini, Claude, Copilot and more, detected from the GA4 session source/medium.

**Tags** (8)
- `list_tags` — List a property's keyword and page tags.
- `create_tag` — Create a tag on a property.
- `apply_tag` — Manually apply a tag to specific keywords and/or pages, on top of any auto-rules.
- `remove_tag` — Remove a tag from specific keywords and/or pages — the inverse of apply_tag.
- `delete_tag` — Delete a tag entirely: unassign it from every keyword/page and remove the tag.
- `list_tag_rules` — List a property's auto-assignment rules — the patterns that tag keywords/pages automatically.
- `create_tag_rule` — Create an auto-assignment rule that tags every matching keyword or page — current and future.
- `delete_tag_rule` — Delete an auto-assignment rule by its rule_id (from list_tag_rules).

**Smart Views** (3)
- `list_smart_views` — List the keyword and page Smart Views defined for a property — each with view_id, name, type (keyword | page) and the tag names it groups.
- `create_smart_view` — Create a Smart View from a set of tags (read them from list_tags).
- `delete_smart_view` — Delete a Smart View by its view_id.

**Reporting** (4)
- `list_reports` — List the SEO Reporting reports built for a property — each with id, name, is_template, is_automate, created_at and owner.
- `get_report` — Get one report's metadata (name, is_template, is_automate, owner, created_at, plus period and recipients when scheduled) and its full widget structure — every widget's type, title, position, config and filters.
- `generate_report` — Generate a shareable snapshot of an existing report and return its public URL (write action).
- `list_report_schedules` — List the reports configured for automated recurring delivery on a property — each with id, name, owner, period (week or month) and the recipient user IDs.

**Web Fetch** (1)
- `fetch_url` — Fetch a single live URL on demand (plain HTTP GET, no JavaScript) and get the response details back — final URL, status code, full redirect chain, response time and decoded page size — plus optional blocks: parsed SEO elements…

**Visual rendering** (3)
- `render-scorecard` — Render a KPI card grid from summary data — each card carries a label, a raw value, an optional unit ($ prefix, % suffix, or s for a duration), a period-over-period change with up/down direction, and optional grouping into…
- `render-data-table` — Render an interactive table with client-side sort, search and pagination from any list result — top keywords, top pages, biggest movers, prompts, backlinks and more.
- `render-time-series-chart` — Render an interactive line chart with hover tooltip and crosshair, a toggleable legend, and an automatic dual Y-axis when two series use different units.

**Platform health** (1)
- `health` — Live status of the MCP backend per surface (Search Console, GA4, Crawler, Prompt Tracking, Tasks) and per data store, each reported as ok, degraded or down with last_check_at and a sample_error.

---

## Compatible clients

Any MCP-compatible client works — the server uses the open MCP transport with no client-specific code paths. The four most common setups: **Claude** (Claude.ai + Desktop), **ChatGPT** (Apps connector), **Cursor**, and **Claude Code**.

## Plans & metering

MCP access is included on every SEOcrawl AI plan, with a 30-day free trial. Each call uses 1 to 6 MCP credits depending on the tool; `fetch_url`, `health` and the three render tools are free. Each plan ships with a monthly MCP credit pool, and rate limits apply. Prompt Tracking answers use AI credits from your plan, separate from MCP credits. See [pricing](https://seocrawl.ai/pricing) for the current plans and credit allowances.

## Data & privacy

The MCP authenticates against your SEOcrawl AI account and reads the same Search Console properties, GA4 data and tasks you see in the app. Data is never shared across accounts. Privacy policy: https://seocrawl.ai/legal

## Support

Questions or issues: **info@seocrawl.com** · Full docs and live examples: **https://seocrawl.ai/mcp**

---

*SEOcrawl SL · Andorra · An SEO + GEO platform that monitors organic performance and brand mentions across AI engines. [seocrawl.ai](https://seocrawl.ai)*
