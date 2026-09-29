# Codebase Memory MCP Changelog & Rollback Guide

**Date**: 2026-09-29  
**Tool**: `codebase-memory-mcp` (v0.11.0)  
**Binary Location**: `/Users/amabdu/.local/bin/codebase-memory-mcp`  
**Updater Script**: `/Users/amabdu/.local/bin/install.sh`  

This document logs every system modification made during the installation of `codebase-memory-mcp` and provides exact, step-by-step procedures to disable integrations, rollback configuration files, or completely remove the binary and associated artifacts.

---

## 1. System Modifications & Changelog

### A. Binary & PATH
1. **Binary Installed**:
   - `/Users/amabdu/.local/bin/codebase-memory-mcp` (Executable binary, permissions `755`)
   - `/Users/amabdu/.local/bin/install.sh` (Updater script, permissions `755`)
2. **PATH Configuration**:
   - File Modified: `/Users/amabdu/.zshrc`
   - Content Appended:
     ```bash
     # Added by codebase-memory-mcp install
     export PATH="/Users/amabdu/.local/bin:$PATH"
     ```

### B. Global MCP Client Configuration Files
1. **VS Code**:
   - Primary: `/Users/amabdu/Library/Application Support/Code/User/mcp.json`
   - Builtin Profile: `/Users/amabdu/Library/Application Support/Code/User/profiles/builtin/mcp.json`
   - Changes: Added `"codebase-memory-mcp"` entry under `"servers"`.
2. **Claude Code**:
   - File: `/Users/amabdu/.claude.json`
   - Changes: Added `"codebase-memory-mcp"` under `"mcpServers"`.
3. **OpenCode**:
   - File: `/Users/amabdu/.config/opencode/opencode.jsonc`
   - Changes: Added `"codebase-memory-mcp"` configuration.
4. **Kiro**:
   - File: `/Users/amabdu/.kiro/settings/mcp.json`
   - Changes: Added `"codebase-memory-mcp"` configuration.

### C. Agent Definitions, Skills & Extensions
1. **GitHub Copilot / VS Code**:
   - Agent specs:
     - `~/.copilot/agents/codebase-memory-scout.agent.md`
     - `~/.copilot/agents/codebase-memory.agent.md`
     - `~/.copilot/agents/codebase-memory-auditor.agent.md`
   - Skills:
     - `~/.copilot/skills/codebase-memory/SKILL.md`
2. **Claude Code**:
   - Agents:
     - `~/.claude/agents/codebase-memory-scout.md`
     - `~/.claude/agents/codebase-memory.md`
     - `~/.claude/agents/codebase-memory-auditor.md`
   - Lifecycle hooks configured in Claude Code execution profile.
3. **OpenCode**:
   - Agents: `~/.config/opencode/agents/codebase-memory-*.md`
   - Instructions: `~/.config/opencode/AGENTS.md`
   - Extension: `~/.config/opencode/plugins/cbm-augment.ts`
   - Skill: `~/.config/opencode/skills/codebase-memory/SKILL.md`
4. **Kiro**:
   - Agents: `~/.kiro/agents/codebase-memory-*.json`
   - Steering: `~/.kiro/steering/codebase-memory.md`
   - Skill: `~/.kiro/skills/codebase-memory/SKILL.md`

### D. Repository-Local Artifacts
- `.codebase-memory/graph.db.zst` (Zstandard compressed SQLite AST graph)
- `.codebase-memory/artifact.json` (Index metadata and schema version)
- `.codebase-memory/.gitattributes` (Auto-generated `merge=ours` rule)
- `.cbmignore` (Ignore rules for CBM indexer)

---

## 2. Disabling Individual Client Integrations

If you wish to deactivate `codebase-memory-mcp` for a specific tool without deleting the binary:

### A. Disable in VS Code
Edit `/Users/amabdu/Library/Application Support/Code/User/mcp.json` and remove or set `"disabled": true`:
```json
{
  "servers": {
    "codebase-memory-mcp": {
      "disabled": true
    }
  }
}
```
Or delete the `"codebase-memory-mcp"` key from the `"servers"` object.

### B. Disable in Claude Code
Edit `/Users/amabdu/.claude.json` and delete the `"codebase-memory-mcp"` entry under `"mcpServers"`.

### C. Disable in OpenCode
Remove the server block from `/Users/amabdu/.config/opencode/opencode.jsonc`.

### D. Disable in Kiro
Remove the server block from `/Users/amabdu/.kiro/settings/mcp.json`.

---

## 3. Restoring Client Config Backups

If backups exist prior to CBM installation:
- For Claude Code:
  Check timestamped backups in `~/.claude.json.backup.*`. To restore:
  ```bash
  cp ~/.claude.json.backup.<timestamp> ~/.claude.json
  ```
- For VS Code:
  If a clean `mcp.json` had no previous servers:
  ```json
  {
    "servers": {}
  }
  ```

---

## 4. Complete Uninstall Procedure

To completely remove `codebase-memory-mcp` and all registered agents/hooks:

### Step 1: Run the Official Uninstaller
The binary ships with an uninstaller that cleans registered agent configs and hooks:
```bash
codebase-memory-mcp uninstall -y
```

### Step 2: Remove the Executables
```bash
rm -f /Users/amabdu/.local/bin/codebase-memory-mcp
rm -f /Users/amabdu/.local/bin/install.sh
```

### Step 3: Clean Global Cache & Daemon Logs
```bash
rm -rf ~/.cache/codebase-memory-mcp
```

### Step 4: Revert PATH in `~/.zshrc`
Open `~/.zshrc` and remove the line:
```bash
export PATH="/Users/amabdu/.local/bin:$PATH"
```

### Step 5: Remove Repository Knowledge Artifacts (Optional)
If you do not want to keep the local graph artifact in the repository:
```bash
rm -rf .codebase-memory/
rm -f .cbmignore
```
*(Note: `.project-intelligence/` contains permanent project documentation and can be retained or committed separately).*
