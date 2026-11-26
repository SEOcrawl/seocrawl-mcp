#!/usr/bin/env node
/**
 * SEOcrawl AI — MCP introspection manifest server.
 *
 * This is a thin, dependency-light stdio MCP server whose ONLY job is to let
 * directories (e.g. Glama) discover the SEOcrawl AI tool catalogue without
 * needing OAuth credentials. It advertises the same 91 tools as the live,
 * hosted server but does not execute them — every tool call returns a pointer
 * to the real, authenticated endpoint.
 *
 *   Live server: https://mcp.seocrawl.ai  (Streamable HTTP, OAuth 2.0 DCR)
 *   Docs:        https://seocrawl.ai/mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OBJECT = { type: "object", additionalProperties: true };

/** The 91 tools exposed by the hosted SEOcrawl AI MCP server (source of truth: https://seocrawl.ai/mcp). */
const TOOLS = [
  // Properties
  { name: "list_properties", description: "List every GSC property the authenticated user can access. Returns the property ID (UUID) and URL (sc-domain:…) you pass to all other tools.", inputSchema: OBJECT },

  // Performance overview
  { name: "get_gsc_summary", description: "Clicks, impressions, CTR and average position for a property over a chosen window. Accepts presets (last_7_days, last_28_days, last_3_months, last_year) or absolute from/to dates. Also returns a branded_breakdown that splits clicks, impressions, CTR and position into branded vs non-branded — driven by the property's Brand tag.", inputSchema: OBJECT },
  { name: "compare_date_ranges", description: "Compare two GSC windows side by side and get diff + change_pct for clicks, impressions, CTR and position. Period A can be a preset; Period B is absolute.", inputSchema: OBJECT },
  { name: "list_winners_losers", description: "The biggest movers between two periods, with deltas pre-computed so your assistant skips drilling each item. Pick dimension=keywords or pages, a metric (clicks, impressions or position) and direction=up / down / both to get gainers, decliners or the largest swings either way. Period B defaults to the window immediately before Period A.", inputSchema: OBJECT },

  // Keywords
  { name: "get_top_keywords", description: "Top keywords for a property ranked by clicks, impressions, CTR or position — with period-over-period comparison. Paginated via next_cursor. Filter by branded: true|false to split brand-driven queries from SEO-earned ones; the summary returns a branded_breakdown you can read in one shot.", inputSchema: OBJECT },
  { name: "get_keyword_detail", description: "Daily time series (clicks, impressions, CTR, position) for a single search query in a property. Same date-range options as the summary.", inputSchema: OBJECT },
  { name: "list_pages_for_keyword", description: "Given a single query, list the pages on your property that earn its clicks and impressions — ranked by clicks, impressions, CTR or position, with period-over-period deltas and next_cursor pagination. Handy for spotting keyword cannibalization or finding the canonical page for a term.", inputSchema: OBJECT },
  { name: "find_keyword_opportunities", description: "Keyword ideas from a keyword research run started in the app (seed keywords, a page or a competitor domain), with Google Ads search volume, competition and bids next to your own Search Console presence. By default it keeps the content gap: the ideas you don't rank for yet.", inputSchema: OBJECT },
  { name: "list_keyword_clusters", description: "Your Search Console keywords grouped into topic clusters (built in the Keyword Map), each with clicks, impressions, average position, Google Ads search volume, traffic value and its 12-month demand curve.", inputSchema: OBJECT },

  // Pages
  { name: "get_top_pages", description: "Top pages for a property ranked by clicks, impressions, CTR or position — every row returns clicks, impressions, CTR and position with period-over-period deltas. Paginated via next_cursor.", inputSchema: OBJECT },
  { name: "get_page_detail", description: "Daily time series (clicks, impressions, CTR, position) for a single page URL in a property. Drop-in compatible with the summary's date-range syntax.", inputSchema: OBJECT },
  { name: "list_keywords_for_page", description: "Given a page URL, list the search queries driving its clicks and impressions — ranked by your chosen metric, with period-over-period deltas and next_cursor pagination. The inverse of list_pages_for_keyword: start from a URL and see exactly which queries feed it.", inputSchema: OBJECT },

  // Google Discover
  { name: "get_discover_summary", description: "Discover clicks, impressions and CTR for the range, each compared with the equal-length window immediately before it: *_current, *_prev, *_delta and *_change_pct (ctr is a 0–1 fraction). Discover carries no query, position, country or device breakdown, so none is returned.", inputSchema: OBJECT },
  { name: "get_discover_history", description: "The daily Discover trend: two series, clicks and impressions, as {date, value} points with missing days back-filled with 0 and ready to chart, plus the number of points and an insufficient_history flag.", inputSchema: OBJECT },
  { name: "get_discover_top_pages", description: "The property's top Discover pages ranked by clicks — or by impressions or CTR — each with its clicks, impressions and ctr for the range and the change against the preceding window. Cursor-paginated via next_cursor.", inputSchema: OBJECT },

  // Index coverage
  { name: "get_indexation_summary", description: "Index-coverage summary for a property: known (sitemap-submitted) URLs, how many Google indexes, indexed_pct and a by_state breakdown (Submitted and indexed, Crawled – currently not indexed, Discovered – currently not indexed, Excluded by 'noindex', Page with redirect, Not found 404, Soft 404…). indexed carries a true prev/delta; date range via preset or absolute from/to.", inputSchema: OBJECT },
  { name: "get_indexation_history", description: "The daily indexed-pages trend — one \"indexed\" series of {date, value} points, summed across the property's sitemaps and ready for a time-series chart. Returns points (days with real data) and flags insufficient_history when there are too few days to chart meaningfully.", inputSchema: OBJECT },
  { name: "list_indexation_pages", description: "The URLs currently in a given Google coverage state (pass the state exactly as get_indexation_summary reports it). Each row returns url, state, last_crawled, google_canonical vs declared_canonical and discovered_via (sitemap or referring page). Cursor-paginated (limit max 200).", inputSchema: OBJECT },
  { name: "get_url_inspection", description: "Live Google URL Inspection for one page: coverage_state, verdict (PASS / NEUTRAL / FAIL), indexing_allowed, Google vs user canonical, last_crawl_time, robots_txt_state, page_fetch_state, sitemaps, a referring-URLs sample, rich_results and mobile_usability. Cache-first — returns a fresh cached result or refreshes live from GSC within the property's inspection quota.", inputSchema: OBJECT },

  // Tasks
  { name: "list_tasks", description: "All tasks for a property. Filter by status (open / done), assignee, taskbox (column) or q (case-insensitive title search). Paginated via next_cursor.", inputSchema: OBJECT },
  { name: "list_taskboxes", description: "The task board's columns (taskboxes) for a property: id, name, status (todo / in_progress / done) and order. Pass a returned taskbox id — or the status keyword — to create_task or update_task to move a task into that column.", inputSchema: OBJECT },
  { name: "get_task", description: "Full detail for a single task. Accepts a UUID, a slug, or a full browser task URL (the property arg is optional when you pass a URL).", inputSchema: OBJECT },
  { name: "create_task", description: "Create a task on a property with title (required) plus optional description, assignee, priority (1–5, default 3) and taskbox (defaults to the TO-DO column).", inputSchema: OBJECT },
  { name: "update_task", description: "Partially update a task — any combination of title, description, assignee, priority, taskbox, or unassign:true to clear the owner.", inputSchema: OBJECT },
  { name: "add_comment", description: "Append a comment to a task. Same flexible ticket reference (UUID / slug / URL) as get_task and update_task.", inputSchema: OBJECT },
  { name: "get_comments", description: "List the comments on a task, including nested replies. Same flexible ticket reference (UUID / slug / URL) as get_task — the property arg is optional when you pass a URL.", inputSchema: OBJECT },
  { name: "add_task_follower", description: "Add a teammate as a follower of a task, or drop them with remove:true. The user is an email or a user UUID and has to be a member of that board already; adding one sends the same notification the app does, and the call is idempotent.", inputSchema: OBJECT },

  // Roadmap milestones
  { name: "list_milestones", description: "Every roadmap milestone on a property's board: id, slug, name, description, start_date and end_date (Y-m-d), color, progress (0–100, computed from the tasks sitting in the DONE column), state (upcoming / active / overdue / done / at_risk) and the task and done counts. Pass a returned id or slug to update_milestone or assign_task_to_milestone.", inputSchema: OBJECT },
  { name: "create_milestone", description: "Create a dated roadmap milestone. name plus startDate and endDate (Y-m-d, start on or before end) are required; description and a #RRGGBB color are optional. Tasks are attached afterwards with assign_task_to_milestone.", inputSchema: OBJECT },
  { name: "update_milestone", description: "Partially update a milestone by id or slug — any combination of name, description, startDate, endDate and color. A milestone can be moved but never unscheduled, and startDate must stay on or before endDate.", inputSchema: OBJECT },
  { name: "assign_task_to_milestone", description: "Link a task to a milestone, or unlink it by leaving the milestone out. The ticket takes a UUID, a slug or a full browser task URL, and a task belongs to at most one milestone.", inputSchema: OBJECT },

  // Annotations
  { name: "add_annotation", description: "Create a chart note on a property for a given date (Y-m-d) with the note text — plus optional longer description, category and a linked task UUID. Added as a custom, site-wide note authored by you.", inputSchema: OBJECT },
  { name: "list_annotations", description: "List a property's annotations within a date range, newest first. Use a preset (last_7_days, last_28_days, last_3_months, last_year) or absolute from/to dates, with optional substring search on the note text and pagination (limit capped at 200).", inputSchema: OBJECT },
  { name: "get_annotation", description: "Full detail for a single annotation by its id — date, note, description, category, linked task, author and the property it belongs to. Use list_annotations to find the id.", inputSchema: OBJECT },
  { name: "delete_annotation", description: "Delete a custom annotation by its id. Only your own custom notes can be removed — official or global notes are rejected. Returns the id with deleted: true.", inputSchema: OBJECT },

  // Crawler
  { name: "list_site_audit_projects", description: "List the property's Crawler projects (crawl configurations) to find the audit_id to target. Each returns audit_id, name, mode (list / complete / organic_traffic), device, start_urls, status, progress, last_crawl_date, pages_crawled and the latest health_score. Most other Crawler tools default to the most recently finished crawl, so you only need this to target a specific project.", inputSchema: OBJECT },
  { name: "create_crawler_project", description: "Create a Crawler project (write action): crawl the whole site, discovered from Search Console and sitemaps, or a fixed list of your own URLs. Creating it crawls nothing and spends no credits; start it with trigger_site_audit_crawl, and it re-crawls weekly after that.", inputSchema: OBJECT },
  { name: "update_crawler_project", description: "Rename a Crawler project, switch it between complete and list mode, or replace its URL list (write action). Nothing is crawled until you trigger the next crawl.", inputSchema: OBJECT },
  { name: "delete_crawler_project", description: "Delete a Crawler project (write action, cannot be undone): it disappears from the app and from the read tools, and its weekly re-crawl stops.", inputSchema: OBJECT },
  { name: "get_site_audit_summary", description: "Technical-health summary of the latest crawl: health_score (current plus prev and delta), pages_crawled, crawl_date, issues_by_severity (critical / warning / notice, each with issue_types and pages_affected vs the previous crawl), issues_by_category (OnPage, Links, International, Robots, Social) and per-area category_scores. Defaults to the most recent crawl.", inputSchema: OBJECT },
  { name: "list_site_audit_issues", description: "The technical issues detected by the latest crawl, most severe first — each with issue_code (pass it to list_site_audit_issue_pages), title, severity, category, pages_affected (with prev and delta), how_to_fix guidance and priority. Filter by severity and/or category; cursor-paginated (limit max 200).", inputSchema: OBJECT },
  { name: "list_site_audit_issue_pages", description: "The exact URLs affected by one issue — pass its issue_code and get each offending url with the per-page value. Cursor-paginated (limit max 200). Turns any Crawler issue straight into a concrete fix list.", inputSchema: OBJECT },
  { name: "get_site_audit_page", description: "Full crawl detail for a single URL: status_code, crawl_depth, indexability_score and health_score, category_scores, issue_counts and issues[] — the page's failing checks, each with issue_code, severity, category, the per-page description and how_to_fix.", inputSchema: OBJECT },
  { name: "page_explorer", description: "Find crawled pages that match technical SEO criteria in your latest crawl. Filter by status_code (e.g. 404), no_canonical, missing_h1 or check_title (any Crawler check shown in the app, e.g. \"Title Tag too short\"). Sort by health, status_code, url or depth, paginated via next_cursor. Every row returns url, status_code, title, indexability, performance_score (health 0–100), last_crawled_at, count_errors and count_warnings, plus a check_description when a check filter is active.", inputSchema: OBJECT },
  { name: "trigger_site_audit_crawl", description: "Start a fresh crawl (write action) — queues the crawl and spends the project's crawler credits (separate from MCP credits) in proportion to the pages crawled. Supports complete and list modes; returns audit_id, status, started_at and pages_queued. Results become available to the read tools once the crawl finishes.", inputSchema: OBJECT },
  { name: "compare_site_audit_crawls", description: "Diff two crawls to answer \"what regressed or improved since last time?\" — health_diff plus counts and four lists: new_issues, resolved_issues, worsened and improved, each issue carrying pages_affected, prev and delta. Defaults to the latest crawl vs the previous one.", inputSchema: OBJECT },

  // Code Monitor
  { name: "list_code_monitor_pages", description: "List the pages a property tracks in Code Monitor, each with its monitoring status — url, last_change_at (most recent detected change) and changes_count (total changes detected). Filter by url substring; cursor-paginated (limit max 200). Returns feature_not_available when the plan doesn't include Code Monitor.", inputSchema: OBJECT },
  { name: "list_code_monitor_changes", description: "List detected on-page code/HTML changes, newest first — each with url, date and change_types (Title, Canonical, Meta Description, noindex, robots.txt, sitemap.xml, H1, Status code, Hreflang, Open Graph, Twitter image, Analytics, Tag Manager). Filter to one page with seoMonitorId or page, or omit for the project-wide recent-changes feed; narrow with from/to. Cursor-paginated (limit max 200).", inputSchema: OBJECT },
  { name: "get_code_monitor_change", description: "Get the before/after values for a single detected change, addressed by url + createdAt — one entry per changed field with type, property, before and after (arrays for multi-valued fields). Pass changeType to return just one field. Returns not_found when no change matches and invalid_change_type for an unknown field label.", inputSchema: OBJECT },
  { name: "get_code_monitor_snapshot", description: "Get the most recent captured state of a monitored page — the current extracted on-page fields (title, canonical, meta description, meta robots, robots.txt, sitemap.xml, H1, headings, status code, hreflang, Open Graph image, Twitter image, Analytics, Tag Manager). Address the page by seoMonitorId or url; raw HTML and screenshots are not stored. Returns not_found for an unknown page.", inputSchema: OBJECT },

  // Prompt Tracking (AI visibility)
  { name: "list_prompts", description: "List the prompts a property tracks. Every row returns prompt_id, prompt_text, engines_tracked, last_run_at (ISO-8601) and runs_in_range (engine executions inside the window). Scope runs_in_range with a preset (last_7_days, last_28_days, last_3_months, last_year) or absolute from/to dates; the full prompt list always comes back. Filter by engine (chatgpt, claude, gemini, perplexity, ai_overview, ai_mode) or by text, keep only the prompts where a competitor appears and you don't (gapOnly), and page via limit (max 200) and next_cursor.", inputSchema: OBJECT },
  { name: "get_prompt_detail", description: "Per-engine visibility for a single prompt: runs, mentions, mention_rate (%) and the change in percentage points vs the preceding period, for each engine it runs on (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, Google AI Mode), with totals across engines. For AI Overviews only a citation counts as a mention. Date range via preset or absolute from/to (defaults to last_28_days).", inputSchema: OBJECT },
  { name: "list_prompt_runs", description: "The individual engine executions behind one prompt — one row per run with date, engine, mentioned / mentioned_in_text flags and a response_excerpt (up to 600 chars of the actual AI answer). Filter by engine, scope by date range, paginate via limit (max 200) and next_cursor.", inputSchema: OBJECT },
  { name: "list_prompt_citations", description: "The sources the AI engines cited when answering one prompt, aggregated over the range: own_domain plus every cited domain and URL flagged with is_own_domain and url_count — so you can see which of your pages earn citations and which competitors win them.", inputSchema: OBJECT },
  { name: "trigger_prompt_run", description: "Run a tracked prompt now on every engine it tracks instead of waiting for its schedule (write action). The answers land in list_prompt_runs within a few minutes; one on-demand run per prompt per hour, shared with the app's Run now.", inputSchema: OBJECT },
  { name: "create_prompt", description: "Create a tracked prompt: the question that runs against the AI engines. Set the engine list (chatgpt, claude, gemini, perplexity, ai_overview, ai_mode), country, response language and cadence (daily, week or month), and optionally file it under a topic by topicId or topicTitle (find-or-create). The first run is queued at once.", inputSchema: OBJECT },
  { name: "update_prompt", description: "Partially update a tracked prompt — any combination of its text, engine list, country, response language or run cadence; omitted fields are left unchanged. Pass topicId (an existing topic) or topicTitle (found or created) to move it to another topic — its history is kept, it must stay unique within the destination topic, and an unknown topicId on its own returns topic_not_found; with neither, it keeps its current topic.", inputSchema: OBJECT },
  { name: "delete_prompt", description: "Delete a tracked prompt and all of its recorded engine responses. Irreversible; the prompt's topic is left untouched.", inputSchema: OBJECT },
  { name: "list_prompt_topics", description: "List the prompt topics that group prompts on the Prompt Tracking page — each with topic_id and title. Pass a topic to create_prompt / update_prompt to file a prompt under it.", inputSchema: OBJECT },
  { name: "create_prompt_topic", description: "Create (or fetch) a prompt topic by title — an idempotent upsert, so re-creating an existing title returns it unchanged with created=false. Topics group prompts on the Prompt Tracking page.", inputSchema: OBJECT },
  { name: "update_prompt_topic", description: "Rename a prompt topic by its topicId. The new title must be non-empty and unique within the property (renaming to the same title is a no-op success).", inputSchema: OBJECT },
  { name: "delete_prompt_topic", description: "Delete a prompt topic. Cascades: every prompt filed under it, and all of those prompts' recorded responses, are permanently deleted too. Returns prompts_deleted. Irreversible.", inputSchema: OBJECT },
  { name: "get_ai_visibility_share_of_voice", description: "The aggregate share-of-voice view: your domain against its competitors across every tracked prompt, each domain ranked by share of voice (0–100 average visibility) with its change vs the preceding period, plus a head-to-head count of the prompts you win and lose against the top competitor. Use list_prompts / get_prompt_detail for the per-prompt breakdown.", inputSchema: OBJECT },
  { name: "get_ai_visibility_mentions", description: "How often the brand is named across all tracked prompts in the range: total_prompts plus three mutually exclusive buckets — mentioned (named prominently), mentioned_in_text (only in the body of the answer) and absent — each with a count and a percentage. This is presence, not sentiment.", inputSchema: OBJECT },
  { name: "get_ai_visibility_history", description: "The daily AI-visibility trend: one series of {date, value} points where value is the percentage of tracked prompts whose answers linked to the brand that day, ready to chart. Also returns the number of points in range and an insufficient_history flag for windows too short to read.", inputSchema: OBJECT },

  // GA4 Web Analytics
  { name: "list_ga4_properties", description: "List the GA4 properties connected to your projects. Each entry returns the project id and URL (either works as the property argument for the other GA4 tools), the underlying GA4 property ID and the connection date. Only projects with a connected GA4 property are returned.", inputSchema: OBJECT },
  { name: "get_ga4_summary", description: "Sessions, users, new users, conversions, engagement rate and sessions per user for a property over a chosen window — presets (last_7_days, last_28_days, last_3_months, last_year) or absolute from/to dates. Every metric returns current, prev and delta vs the immediately preceding period.", inputSchema: OBJECT },
  { name: "compare_ga4_date_ranges", description: "Compare two GA4 windows side by side — sessions, users, new users, conversions and engagement rate, with both values plus diff and change_pct per metric. Period A can be a preset; Period B is absolute. The GA4 twin of compare_date_ranges.", inputSchema: OBJECT },
  { name: "get_ga4_traffic_by_source", description: "Sessions broken down by acquisition source. Pick dimension=source_medium (default) or channel for GA4's default channel grouping — rows come sorted by sessions, each with its share_pct of the period total, capped by limit (default 25, max 100).", inputSchema: OBJECT },
  { name: "get_ga4_top_pages", description: "GA4 metrics per page (landing / URL), ranked so you see which pages drive the most sessions, signups (conversions) or users. Every row returns the page plus sessions, users, conversions and engagement_rate, each with the prior-period prev and change_pct. Sort by sessions (default), conversions or users; capped by limit (default 25, max 100). The page-level companion to get_ga4_traffic_by_source.", inputSchema: OBJECT },
  { name: "get_ga4_ai_referrers", description: "AI/LLM referral traffic by engine — ChatGPT, Perplexity, Gemini, Claude, Copilot and more, detected from the GA4 session source/medium. Each engine returns sessions, key events and average session duration, with the change vs the previous period. Your GEO traffic, measured.", inputSchema: OBJECT },

  // Tags
  { name: "list_tags", description: "List a property's keyword and page tags. Each tag returns tag_id, name, type (keyword|page), color, rule_count (auto-assignment rules) and member_count (keywords or pages currently carrying it). Pass tag names to the tags filter on get_top_keywords, get_top_pages and list_winners_losers.", inputSchema: OBJECT },
  { name: "create_tag", description: "Create a tag on a property. type is keyword (tags keywords), url (tags pages) or both. Optional color is a hex string used by the SEOcrawl AI UI. Tag identity is name + type, so re-creating an existing tag just updates its color.", inputSchema: OBJECT },
  { name: "apply_tag", description: "Manually apply a tag to specific keywords and/or pages, on top of any auto-rules. Pass keywords (exact strings) and/or urls (exact page URLs); at least one is required. The tag is created for the relevant type if it does not exist yet.", inputSchema: OBJECT },
  { name: "remove_tag", description: "Remove a tag from specific keywords and/or pages — the inverse of apply_tag. Only unassigns the tag from those items; it does not delete the tag itself or touch auto-assignment rules.", inputSchema: OBJECT },
  { name: "delete_tag", description: "Delete a tag entirely: unassign it from every keyword/page and remove the tag. type is keyword, url or both. The built-in Brand / Non-Brand tags cannot be deleted. Auto-rules targeting the tag are left intact — use delete_tag_rule for those.", inputSchema: OBJECT },
  { name: "list_tag_rules", description: "List a property's auto-assignment rules — the patterns that tag keywords/pages automatically. Optionally filter by tag. Each rule returns rule_id, tag, field (keyword|url), country and its conditions (match + value).", inputSchema: OBJECT },
  { name: "create_tag_rule", description: "Create an auto-assignment rule that tags every matching keyword or page — current and future. field is keyword or url; match is contains, not_contains, exact, starts_with, ends_with or regex (a safe RE2 pattern); value is the pattern. One rule per tag+field; tagging of existing items runs asynchronously.", inputSchema: OBJECT },
  { name: "delete_tag_rule", description: "Delete an auto-assignment rule by its rule_id (from list_tag_rules). Stops future auto-tagging for that pattern; items already carrying the tag keep it (use remove_tag or delete_tag to unassign).", inputSchema: OBJECT },

  // Smart Views
  { name: "list_smart_views", description: "List the keyword and page Smart Views defined for a property — each with view_id, name, type (keyword | page) and the tag names it groups. Per-tag member counts come from list_tags.", inputSchema: OBJECT },
  { name: "create_smart_view", description: "Create a Smart View from a set of tags (read them from list_tags). type is keyword (over keyword tags) or page (over page tags). The view appears in the SEOcrawl AI UI exactly like a natively-created one and can be edited there.", inputSchema: OBJECT },
  { name: "delete_smart_view", description: "Delete a Smart View by its view_id. Permanent and removes the view from the SEOcrawl AI UI too; the underlying tags are not affected. A regular applied-filter id returns not_found.", inputSchema: OBJECT },

  // Reporting
  { name: "list_reports", description: "List the SEO Reporting reports built for a property — each with id, name, is_template, is_automate, created_at and owner. Returns plain reports by default; pass templates: true to list report templates instead. Recurring reports are excluded (use list_report_schedules). Cursor-paginated via next_cursor.", inputSchema: OBJECT },
  { name: "get_report", description: "Get one report's metadata (name, is_template, is_automate, owner, created_at, plus period and recipients when scheduled) and its full widget structure — every widget's type, title, position, config and filters. Returns the report's composition, not rendered analytics numbers (read those with the GSC / GA4 tools).", inputSchema: OBJECT },
  { name: "generate_report", description: "Generate a shareable snapshot of an existing report and return its public URL (write action). Snapshots the report's current widget state, deduped by content hash — it takes no date range, so edit the report's widgets first if you need a different period. Returns report_id, snapshot_id and url.", inputSchema: OBJECT },
  { name: "list_report_schedules", description: "List the reports configured for automated recurring delivery on a property — each with id, name, owner, period (week or month) and the recipient user IDs. Reflects the stored schedule configuration (period + recipients). Cursor-paginated via next_cursor.", inputSchema: OBJECT },

  // Web Fetch
  { name: "fetch_url", description: "Fetch a single live URL on demand (plain HTTP GET, no JavaScript) and get the response details back — final URL, status code, full redirect chain, response time and decoded page size — plus optional blocks: parsed SEO elements (title, meta description, meta robots, canonical, hreflang, headings, OG/Twitter tags, JSON-LD types, word count, link counts, images missing alt), the main content as clean markdown, and the raw HTML. Transport failures return structured errors (dns_error, timeout, blocked_url…). Free — it never burns MCP credits; rate-limited per user.", inputSchema: OBJECT },

  // Visual rendering
  { name: "render-scorecard", description: "Render a KPI card grid from summary data — each card carries a label, a raw value, an optional unit ($ prefix, % suffix, or s for a duration), a period-over-period change with up/down direction, and optional grouping into sections when there are more than four cards. Auto-called when a summary tool (get_gsc_summary, get_ga4_summary…) returns render_with: render-scorecard. Free.", inputSchema: OBJECT },
  { name: "render-data-table", description: "Render an interactive table with client-side sort, search and pagination from any list result — top keywords, top pages, biggest movers, prompts, backlinks and more. Columns are typed from the data and array cells stay as chips. Auto-called when a list tool returns render_with: render-data-table. Free.", inputSchema: OBJECT },
  { name: "render-time-series-chart", description: "Render an interactive line chart with hover tooltip and crosshair, a toggleable legend, and an automatic dual Y-axis when two series use different units. Fed by any history / daily-series tool (get_page_detail, get_keyword_detail, performance history…) that returns render_with: render-time-series-chart. Free.", inputSchema: OBJECT },

  // Platform health
  { name: "health", description: "Live status of the MCP backend per surface (Search Console, GA4, Crawler, Prompt Tracking, Tasks) and per data store, each reported as ok, degraded or down with last_check_at and a sample_error. Free and takes no arguments: poll it before a multi-step workflow so a broken endpoint is visible up front.", inputSchema: OBJECT },

];

const POINTER =
  "This is the public introspection manifest for the SEOcrawl AI MCP server. " +
  "Tools are executed by the live, hosted server at https://mcp.seocrawl.ai — " +
  "add that endpoint to your MCP client and sign in with your SEOcrawl AI account " +
  "to run this tool against your real Google Search Console, GA4 and SEO data. " +
  "Docs: https://seocrawl.ai/mcp";

const server = new Server(
  { name: "seocrawl", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async () => ({
  content: [{ type: "text", text: POINTER }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`SEOcrawl AI MCP manifest server ready — ${TOOLS.length} tools advertised (stdio).`);
