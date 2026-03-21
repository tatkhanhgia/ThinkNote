# Comprehensive Comparison: GKG vs Serena vs GitNexus

**Date:** 2026-03-19
**Focus:** Code intelligence tools for Next.js/TypeScript projects

---

## Executive Summary

Three competing approaches to code understanding for AI agents:

- **GKG (GitLab Knowledge Graph)**: Static graph indexing via Kuzu; high setup, strong query power
- **Serena**: On-demand LSP integration; lightweight, best for large codebases with strong structure
- **GitNexus**: Precomputed relational intelligence; browser-native, execution-flow aware, low overhead

**Recommendation for ThinkNote (Next.js blog):** GitNexus (low complexity, fast startup) → Serena (if IDE-like features needed) → GKG (only for enterprise scale)

---

## 3-Way Comparison Table

| Dimension | GKG | Serena | GitNexus |
|-----------|-----|--------|----------|
| **Core Approach** | Static graph database indexing | On-demand LSP symbol queries | Precomputed relational intelligence |
| **Storage Backend** | Kuzu (embedded graph DB) | Language servers (live index) | LadybugDB + JSON metadata |
| **Primary Data Type** | Nodes + edges + vectors | AST + symbol tables | Execution graphs + dependency clusters |
| **Indexing Model** | Batch process (one-time) | On-the-fly (incremental) | 6-phase pipeline (precomputed) |
| **Setup Complexity** | High (Rust build, Kuzu init) | Medium (LSP per language) | Low (CLI one-liner) |
| **Startup Time** | 10-30s (indexing) | <200ms (query latency) | 1-5s (load precomputed graph) |
| **Query Speed** | Fast (graph traversal) | Medium (LSP per query) | Fast (in-memory graph) |
| **Storage Size** | ~2-5x codebase size | Negligible | ~1x codebase size |
| **TypeScript/JS Support** | ✓ (full) | ✓ (full) | ✓ (Tree-sitter native) |
| **Browser Capability** | ✗ (desktop/CLI only) | ✗ (server-side) | ✓ (WASM UI) |
| **Blast Radius Analysis** | ✗ | ✗ | ✓ (built-in) |
| **Execution Flow Tracing** | ✗ | ✗ | ✓ (6-phase traces) |
| **MCP Integration** | ✓ (MCP tools) | ✓ (MCP server) | ✓ (7 tools + PreToolUse hooks) |
| **Language Support** | Rust, TS, Python, Ruby, Java, Kotlin | 30+ languages | 10+ languages (Tree-sitter) |

---

## Detailed Technical Breakdown

### GKG (GitLab Knowledge Graph)

**Architecture:**
```
Code Files → [Parser] → Entities + Relationships → [Kuzu] → MCP Tools
                         (function, class, import, call edges)
```

**Technology Stack:**
- **Graph DB**: Kuzu (Rust, embedded)
- **Indexing**: Structure extraction + relationship resolution
- **Search**: Native Cypher queries + vector search
- **Integration**: MCP tools for Claude

**Strengths:**
- Fast graph traversals (Cypher optimized)
- Vector search on embeddings
- Structured queries (find all callers, trace inheritance chains)
- Good for complex dependency analysis

**Weaknesses:**
- Requires Rust build environment
- One-time indexing (doesn't detect new changes without re-index)
- No browser UI
- Heavier resource usage

**Setup for Next.js Blog:**
```bash
# ~30 minutes for first setup
git clone gkg
cargo build --release
gkg index /path/to/my-knowledge-base
# → .kuzu/ directory created (~50-200MB for typical blog)
```

**Query Example:**
```cypher
MATCH (func:Function)-[:CALLS]->(target:Function)
WHERE func.name = 'searchPosts'
RETURN target.name, target.file
```

---

### Serena (LSP-Based)

**Architecture:**
```
Code Files ← [LSP Server] → [Solid-LSP Wrapper] → MCP Server → Claude
              (TypeScript LS running locally)
```

**Technology Stack:**
- **Language Servers**: 30+ LSP implementations (native to IDEs)
- **Wrapper**: Solid-LSP (synchronous interface to LSP)
- **Integration**: Python MCP SDK
- **Package Manager**: `uv` (lightweight dependency manager)

**Strengths:**
- On-demand (no precomputation overhead)
- Reuses battle-tested IDE language servers
- Works with live code (detects changes immediately)
- Low startup latency (~200ms per query)
- Minimal storage (no index files)

**Weaknesses:**
- Requires language server per language (TypeScript LS in this case)
- Each query hits the LSP server (slightly slower than graph DB)
- No execution flow awareness
- Best only for large, heavily-structured codebases

**Setup for Next.js Blog:**
```bash
# ~5 minutes
uvx --from git+https://github.com/oraios/serena serena start-mcp-server
# TypeScript LS installed automatically if missing
# Ready immediately, detects code changes in real-time
```

**Query Example (via MCP tool):**
```
Tool: find_references
Input: searchPosts (function)
Output: [
  {file: "lib/posts.ts", line: 42},
  {file: "app/[locale]/search/page.tsx", line: 15}
]
```

---

### GitNexus (Precomputed Relational)

**Architecture:**
```
Code Files → [6-Phase Pipeline] → Knowledge Graph → [MCP Tools] → Claude
              Structure → Parsing → Resolution → Clustering → Processes → Search
```

**Technology Stack:**
- **Parser**: Tree-sitter (AST extraction)
- **Graph Storage**: LadybugDB (lightweight relational DB)
- **Indexing Phases**: 6 deterministic steps (precomputed)
- **Search**: BM25 + semantic + RRF (hybrid)
- **UI**: WebAssembly + browser-native (optional)
- **MCP Tools**: 7 tools + PreToolUse/PostToolUse hooks

**Indexing Pipeline (the "6 phases"):**
1. **Structure** - Map files/folders (dependency on disk layout)
2. **Parsing** - Extract AST entities (functions, classes, imports)
3. **Resolution** - Resolve cross-file imports & function calls
4. **Clustering** - Group related symbols (Leiden algorithm)
5. **Processes** - Trace execution flows from entry points
6. **Search** - Build hybrid indexes (BM25 + embedding + ranking)

**Strengths:**
- Lowest setup complexity (single CLI command)
- Fastest startup (loads precomputed graph in memory)
- Execution flow tracing (unique feature)
- Blast radius analysis (change impact prediction)
- Browser UI (WASM, zero-server)
- Deepest MCP integration (PreToolUse hooks enrich agent queries automatically)
- Automatic re-indexing on commit (hooks)

**Weaknesses:**
- Requires recompute when code changes (slower than on-demand LSP)
- PolyForm Noncommercial license (limits some use cases)
- Smaller ecosystem than Serena/GKG

**Setup for Next.js Blog:**
```bash
# ~2 minutes
npm install -g gitnexus
gitnexus analyze /path/to/my-knowledge-base
# → .gitnexus/ directory created (~100-300MB index)
# → Immediately queryable, <1s startup

# Optional: browser UI
gitnexus serve
# Opens http://localhost:3000 with interactive knowledge graph
```

**Query Example (7 MCP tools):**
```
Tool: impact
Input: Modified: src/lib/posts.ts:42
Output: {
  blast_radius: "medium",
  affected_processes: ["searchPosts", "getPostsByCategory"],
  depth: 2,
  confidence: 0.95
}

Tool: context
Input: searchPosts (function)
Output: {
  definition: {file, line},
  calls_to: [...],
  called_by: [...],
  tests: [...],
  related_symbols: [...]
}
```

---

## Query Capability Comparison

### GKG: Graph Traversal (Cypher)
```
✓ Find all callers of a function
✓ Trace multi-level dependencies
✓ Find dead code
✗ Understand execution flow from entry point
✗ Predict impact before code change
```

### Serena: Symbol-Level (LSP)
```
✓ Go to definition
✓ Find references
✓ Get type information
✓ Extract symbols
✗ Trace complex dependency chains
✗ Execution flow awareness
```

### GitNexus: Relational + Flow (Graph + Tracing)
```
✓ All Serena capabilities
✓ All GKG capabilities
✓ Blast radius analysis
✓ Execution flow traces
✓ Automatic change detection
✓ Browser exploration
```

---

## Language Support (Focus: TypeScript/JavaScript)

| Tool | TypeScript | JavaScript | Node.js | Quality |
|------|-----------|-----------|---------|---------|
| **GKG** | ✓ (Rust parser) | ✓ | ✓ | Excellent |
| **Serena** | ✓ (TypeScript LS) | ✓ (integrated) | ✓ | Excellent |
| **GitNexus** | ✓ (Tree-sitter WASM) | ✓ (Tree-sitter WASM) | ✓ | Good |

All three have **production-grade TypeScript support**. GitNexus's Tree-sitter approach is slightly less precise than dedicated LS but sufficient for semantic understanding.

---

## For ThinkNote (Next.js Blog) — Practical Implications

### Project Profile:
- **Size**: Small-medium (40-100 MD files, ~1000 LOC in app/)
- **Complexity**: Moderate (localized routing, markdown parsing, search)
- **Team**: Solo or small (1-2 developers)
- **Dev Workflow**: Rapid iteration, frequent content additions

### Recommendation Ranking:

**Tier 1: GitNexus (Best Choice)**
- ✓ Setup takes 2 minutes (vs 30+ for GKG)
- ✓ Fast startup (1-5s) — zero friction in dev loop
- ✓ Blast radius analysis helps prevent bugs in routing logic
- ✓ Browser UI useful for understanding content structure
- ✓ Automatic re-index on commit fits CI/CD
- ✗ Overkill for simple projects, but safety net is worth cost

**Tier 2: Serena (Alternative if IDE Integration Needed)**
- ✓ Lightweight, no index storage
- ✓ Live code detection (immediately sees changes)
- ✓ Works well if integrating with VSCode LSP
- ✗ Less value for small, simple projects
- ✗ No execution flow awareness

**Tier 3: GKG (Not Recommended)**
- ✓ Powerful graph queries
- ✗ Over-engineered for a blog project
- ✗ Requires Rust build (overkill)
- ✗ Static indexing (manual recompute needed)
- ✗ No browser UI for content browsing

---

## Performance Profile (Estimated for ThinkNote Scale)

### Indexing (First Run)
| Tool | Time | Storage |
|------|------|---------|
| GKG | 10-15s | 150MB |
| Serena | 0s (on-demand) | 0MB |
| GitNexus | 3-5s | 100MB |

### Query Speed (Find References)
| Tool | Speed | Notes |
|------|-------|-------|
| GKG | <50ms | Graph traversal, cached |
| Serena | 150-200ms | LSP round-trip |
| GitNexus | <100ms | In-memory graph, precomputed |

### Re-indexing (After Code Change)
| Tool | Time | Detection |
|------|------|-----------|
| GKG | Manual (10-15s) | Must re-run command |
| Serena | N/A | Live (real-time) |
| GitNexus | Automatic (3-5s) | Git hooks + daemon |

---

## Technology Maturity & Adoption

| Tool | Launch | Stars | License | Enterprise Ready |
|------|--------|-------|---------|------------------|
| GKG | 2023 | ~2.2k | Proprietary | ✓ (GitLab-backed) |
| Serena | 2023 | ~17k | MIT | ✓ (widely used) |
| GitNexus | 2025 | ~7.3k | PolyForm Noncommercial | ⚠ (license concern) |

**Maturity order:** Serena > GKG > GitNexus (age-wise)
**Community adoption:** Serena > GitNexus > GKG

---

## Licensing & Commercial Use

- **GKG**: GitLab proprietary (check licensing)
- **Serena**: MIT (fully open, commercial-friendly)
- **GitNexus**: PolyForm Noncommercial (⚠ **blocks commercial use** without special license)

For a personal knowledge base, GitNexus license is fine. For commercial SaaS, use **Serena** (MIT).

---

## Integration with Claude Code

All three expose MCP tools to Claude Code:

- **GKG**: `search_codebase_definitions`, `get_references`, `repo_map`
- **Serena**: `find_definitions`, `find_references`, `get_code_at_symbol`, `extract_symbols`
- **GitNexus**: `query`, `context`, `impact`, `detect_changes`, `rename`, `list_repos`, `cypher`

**Deepest integration:** GitNexus (PreToolUse hooks automatically enrich queries with graph context)

---

## Summary Table: Decision Matrix

| Question | GKG | Serena | GitNexus |
|----------|-----|--------|----------|
| **Can I set up in <5 minutes?** | ✗ | ✓ | ✓ |
| **Does it work in the browser?** | ✗ | ✗ | ✓ |
| **Can it trace execution flows?** | ✗ | ✗ | ✓ |
| **Can it predict change impact?** | ✗ | ✗ | ✓ |
| **Is it production-grade for TS?** | ✓ | ✓ | ✓ |
| **Works with live code changes?** | ✗ | ✓ | ⚠ (re-index) |
| **MIT/permissive license?** | ✗ | ✓ | ✗ |
| **Mature ecosystem?** | ⚠ | ✓ | ⚠ |

---

## Final Recommendation for ThinkNote

**→ Deploy GitNexus**

**Rationale:**
1. Trivial setup (npm + CLI)
2. Fast startup fits development workflow
3. Blast radius & execution flow analysis valuable for routing/content logic bugs
4. Browser UI helps understand knowledge base structure
5. Small project size makes re-indexing cost negligible
6. Personal project (PolyForm Noncommercial license acceptable)

**Implementation Steps:**
```bash
npm install -g gitnexus
cd /path/to/my-knowledge-base
gitnexus analyze .
# Open http://localhost:3000 for interactive exploration
```

**If requirements change:**
- **Need commercial license?** → Switch to **Serena** (MIT, drop-in replacement)
- **Need graph queries?** → Add **GKG** alongside GitNexus

---

## Unresolved Questions

1. Does GitNexus handle dynamic imports in Next.js (e.g., `next/dynamic`)?
2. How does re-indexing latency scale with content (tested only on ~50-100 file projects)?
3. Can Serena's LSP detect changes in imported markdown metadata frontmatter?

---

## Sources

- [GitNexus GitHub Repository](https://github.com/abhigyanpatwari/GitNexus)
- [GitNexus Research (Ry Walker)](https://rywalker.com/research/gitnexus)
- [Client-Side RAG: Building Knowledge Graphs with GitNexus](https://www.sitepoint.com/client-side-rag-building-knowledge-graphs-in-the-browser-with-gitnexus/)
- [Kuzu Graph Database Docs](https://docs.kuzudb.com/)
- [GitLab Knowledge Graph Documentation](https://docs.claudekit.cc/docs/workflows/understanding-codebases-with-gkg)
- [Serena GitHub Repository](https://github.com/oraios/serena)
- [Serena Language Support Documentation](https://oraios.github.io/serena/01-about/020_programming-languages.html)
- [Tree-sitter TypeScript Grammar](https://github.com/tree-sitter/tree-sitter-typescript)
- [Serena MCP Server Overview](https://mcpservers.org/servers/oraios/serena)
- [Code Intelligence Tools Comparison (Ry Walker Research)](https://rywalker.com/research/code-intelligence-tools)
