#!/usr/bin/env node
/**
 * SEOcrawl AI — MCP introspection manifest server.
 *
 * This is a thin, dependency-light stdio MCP server whose ONLY job is to let
 * directories (e.g. Glama) discover the SEOcrawl AI tool catalogue without
 * needing OAuth credentials. It advertises the same 38 tools as the live,
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

/** The 38 tools exposed by the hosted SEOcrawl AI MCP server. */
const TOOLS = [
  // Properties
  { name: "list_properties", description: "Every Google Search Console property you can access (returns the property ID + URL used by all other tools).", inputSchema: OBJECT },

  // Performance overview
  { name: "get_gsc_summary", description: "GSC clicks, impressions, CTR and average position over a window, plus a branded vs non-branded breakdown.", inputSchema: OBJECT },
  { name: "compare_date_ranges", description: "Two GSC windows side by side with diff and change_pct.", inputSchema: OBJECT },
  { name: "list_winners_losers", description: "Biggest movers between two periods (keywords or pages), deltas pre-computed.", inputSchema: OBJECT },

  // Keywords
  { name: "get_top_keywords", description: "Top keywords by clicks/impressions/CTR/position, period-over-period, branded filter, paginated.", inputSchema: OBJECT },
  { name: "get_keyword_detail", description: "Daily time series for a single query.", inputSchema: OBJECT },
  { name: "list_pages_for_keyword", description: "Pages earning a query's clicks (cannibalization / canonical finding).", inputSchema: OBJECT },

  // Pages
  { name: "get_top_pages", description: "Top pages with period-over-period deltas, paginated.", inputSchema: OBJECT },
  { name: "get_page_detail", description: "Daily time series for a single URL.", inputSchema: OBJECT },
  { name: "list_keywords_for_page", description: "Queries driving a page's clicks (the inverse of list_pages_for_keyword).", inputSchema: OBJECT },

  // Tasks
  { name: "list_tasks", description: "All SEO tasks for a property, filterable by status/assignee/taskbox/search.", inputSchema: OBJECT },
  { name: "list_taskboxes", description: "The task board's columns (taskboxes) for a property.", inputSchema: OBJECT },
  { name: "get_task", description: "Full task detail (by UUID, slug or task URL).", inputSchema: OBJECT },
  { name: "create_task", description: "Create a task (title required + optional description, assignee, priority, taskbox).", inputSchema: OBJECT },
  { name: "update_task", description: "Partial update of any task field, or unassign.", inputSchema: OBJECT },
  { name: "add_comment", description: "Append a comment to a task.", inputSchema: OBJECT },
  { name: "get_comments", description: "List comments incl. nested replies.", inputSchema: OBJECT },

  // Annotations
  { name: "add_annotation", description: "Dated chart note (+ optional description, category, linked task).", inputSchema: OBJECT },
  { name: "list_annotations", description: "Annotations in a date range, newest first.", inputSchema: OBJECT },
  { name: "get_annotation", description: "Full detail for one annotation.", inputSchema: OBJECT },
  { name: "delete_annotation", description: "Remove your own custom annotation.", inputSchema: OBJECT },

  // Site Audit
  { name: "page_explorer", description: "Crawled pages matching technical criteria (status code, missing canonical, missing H1, any audit check), sorted by health, with indexability, performance score and error/warning counts.", inputSchema: OBJECT },

  // AI Tracker
  { name: "list_prompts", description: "AI Tracker (Brand Radar) prompts a property tracks, with engines, last run and runs-in-range; filter by engine (ChatGPT, Claude, Gemini, Perplexity).", inputSchema: OBJECT },

  // GA4 Web Analytics
  { name: "list_ga4_properties", description: "GA4 properties connected to your projects.", inputSchema: OBJECT },
  { name: "get_ga4_summary", description: "GA4 sessions, users, new users, conversions, engagement rate and sessions/user, each vs the previous period.", inputSchema: OBJECT },
  { name: "compare_ga4_date_ranges", description: "Two GA4 windows side by side with diff and change_pct.", inputSchema: OBJECT },
  { name: "get_ga4_traffic_by_source", description: "GA4 sessions by source/medium or default channel grouping, with share %.", inputSchema: OBJECT },
  { name: "get_ga4_ai_referrers", description: "AI/LLM referral traffic by engine (ChatGPT, Perplexity, Gemini, Claude, Copilot…). Your GEO traffic, measured.", inputSchema: OBJECT },

  // Tags
  { name: "list_tags", description: "A property's keyword and page tags with rule and member counts.", inputSchema: OBJECT },
  { name: "create_tag", description: "Create a keyword/url/both tag (optional hex color).", inputSchema: OBJECT },
  { name: "apply_tag", description: "Manually apply a tag to specific keywords and/or pages.", inputSchema: OBJECT },
  { name: "remove_tag", description: "Unassign a tag from specific keywords and/or pages.", inputSchema: OBJECT },
  { name: "delete_tag", description: "Delete a tag entirely (built-in Brand / Non-Brand tags are protected).", inputSchema: OBJECT },
  { name: "list_tag_rules", description: "Auto-assignment rules that tag keywords/pages automatically.", inputSchema: OBJECT },
  { name: "create_tag_rule", description: "Create an auto-assignment rule (contains, exact, starts/ends_with, regex).", inputSchema: OBJECT },
  { name: "delete_tag_rule", description: "Delete an auto-assignment rule by id.", inputSchema: OBJECT },

  // Web Fetch
  { name: "fetch_url", description: "Fetch a live URL on demand and get final URL, status, redirect chain, timing, parsed SEO elements, clean markdown and raw HTML. Free — never burns MCP credits.", inputSchema: OBJECT },

  // Platform health
  { name: "health", description: "Live status of each backend surface (GSC, GA4, Site Audit, AI Tracker, Tasks). Free, no arguments.", inputSchema: OBJECT },
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
