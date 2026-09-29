# MCP Client Integration Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  
**Binary Location**: `/Users/amabdu/.local/bin/codebase-memory-mcp` (v0.11.0)  

---

## 1. Client Integration Status Matrix

| Client | Detected? | Configured? | Usability Status | Classification |
| :--- | :---: | :---: | :--- | :--- |
| **VS Code / Copilot** | **Yes** | **Yes** | **Verified & Usable** | `[Verified from repository & environment]` Configured in `~/Library/Application Support/Code/User/mcp.json` and builtin profile. Agent definitions provisioned in `~/.copilot/agents/`. |
| **Claude Code** | **Yes** | **Yes** | **Verified & Usable** | `[Verified from repository & environment]` Configured in `~/.claude.json`. Provisioned 3 subagents under `~/.claude/agents/` and active lifecycle hooks. |
| **OpenCode** | **Yes** | **Yes** | **Verified & Usable** | `[Verified from repository & environment]` Configured in `~/.config/opencode/opencode.jsonc`, instructions in `AGENTS.md`, and plugin `cbm-augment.ts`. |
| **Kiro** | **Yes** | **Yes** | **Verified & Usable** | `[Verified from repository & environment]` Configured in `~/.kiro/settings/mcp.json`, steering rules in `~/.kiro/steering/codebase-memory.md`. |
| **Cursor** | **No** | **No** | **Documented Only (Not Installed)** | `[Verified from environment]` Cursor is not installed on this workstation (`~/.cursor` absent). Documented in CBM catalog as supported, but not verified locally. |
| **Gemini CLI** | **Partial** | **No** | **Documented Only (Not Active)** | `[Verified from environment]` `~/.gemini/` exists with Antigravity profile, but `mcp_config.json` is 0 bytes. Integration is documented but was not configured or verified. |

---

## 2. Verified Tool Suite (17 Tools) `[Verified from repository: CLI help]`

1. `index_repository`: Re-indexes repository into in-memory SQLite and writes `.codebase-memory/graph.db.zst`.
2. `get_architecture`: Comprehensive structural analysis (layers, clusters, entry points, hotspots).
3. `search_graph`: Structural regex search across AST symbols (functions, classes, routes).
4. `query_graph`: Cypher-like relationship queries.
5. `trace_path`: BFS call chain traversal (inbound, outbound, bidirectional).
6. `search_code`: Graph-augmented code search.
7. `get_code_snippet`: Precise symbol body extraction without whole-file reading.
8. `get_file_outline`: Structural outline of symbols within a file.
9. `get_graph_schema`: Graph schema inspector (labels, properties, edge types).
10. `compare_graphs`: Generational comparison of AST structural differences.
11. `list_projects`: Lists all locally indexed workspaces.
12. `delete_project`: Evicts graphs from memory and disk.
13. `index_status`: Index diagnostics and parse error reports.
14. `check_index_coverage`: Verifies AST coverage for given file paths and line ranges.
15. `detect_changes`: Maps git diffs to impacted symbols with risk scores.
16. `manage_adr`: Records and queries Architecture Decision Records.
17. `ingest_traces`: Ingests runtime trace events to link execution data with static AST.
