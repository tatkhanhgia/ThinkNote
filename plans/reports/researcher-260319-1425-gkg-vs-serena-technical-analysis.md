# GKG vs Serena MCP: Technical Deep Dive

**Date:** 2026-03-19
**Status:** Completed Research Report

---

## Executive Summary

**GKG** (GitLab Knowledge Graph) and **Serena MCP** are fundamentally different approaches to code understanding for AI agents. GKG uses a **graph database** (Kuzu) to index entire codebases structurally, while Serena uses **language server protocol (LSP)** for on-demand semantic analysis. For Next.js TypeScript projects, Serena offers superior pragmatic advantages despite GKG's theoretical completeness.

---

## 1. GKG Core Technology

### How It Works

GKG transforms codebases into **queryable graph databases** using:

1. **AST Parsing via gitlab-code-parser** - Extensible parser that builds abstract syntax trees for supported languages
2. **Entity Extraction** - Identifies code structures: files, directories, classes, functions, modules, properties
3. **Relationship Detection** - Maps connections: function calls, inheritance hierarchies, module dependencies, imports/exports
4. **Graph Database Storage** - Stores all entities and relationships in Kuzu (property graph database)
5. **Query Interface** - Exposes Cypher queries via MCP protocol for AI agents

### Data Structure

**Graph Model:** Labeled property graph with:
- **Nodes:** Code entities (File, Class, Function, Module, Property)
- **Edges:** Relationships (CallsFunction, Inherits, Imports, References)
- **Properties:** Metadata on nodes/edges (line numbers, visibility, types, signatures)

**Storage Backend:** Kuzu (property graph DB)
- File-based embedded database (no server needed)
- Stored at `~/.gkg/gkg_workspace_folders/{project}/database.kz`
- Supports Cypher query language (openCypher standard)

### Analysis Capabilities

- Cross-file reference tracking
- Dependency graph visualization
- Function call chains
- Inheritance hierarchy analysis
- Architectural visualization
- Full project scope in single query

### Limitations

1. **Beta Status** - Public beta, not GA; cross-file reference bugs remain
2. **Language Support Gaps**
   - Ruby: Reindexing unsupported (cross-file resolution issues)
   - Python: Conditional definitions ignored; aliasing causes reference misses
3. **Accuracy Trade-offs** - Cross-file references may be incomplete or incorrect in edge cases
4. **Monorepo Support** - Not optimized for monorepos; requires full reindexing
5. **Database Backend Risk** - Kuzu was archived (Oct 2025, acquired by Apple); GKG team evaluating alternatives (Neo4j, FalkorDB, Memgraph)
6. **Computational Cost** - Full project indexing required upfront; expensive for large codebases

---

## 2. Serena Core Technology

### How It Works

Serena provides **symbol-level code navigation** via LSP integration:

1. **Language Server Protocol (LSP) Integration** - Uses language servers (e.g., typescript-language-server for TS/JS)
2. **On-Demand Analysis** - Lazy loads language servers per language
3. **Semantic Symbol Resolution** - Uses IDE-level understanding of symbols
4. **MCP Transport** - Exposes all tools via Model Context Protocol for AI agent integration
5. **Tool Abstraction** - Symbol-level operations abstracted from LSP complexity

### Architecture

**Core Stack:**
- **SolidLSP** - Synchronous LSP wrapper (derived from Microsoft's multilspy)
- **Language Server Implementations** - Pluggable servers per language (PyrightServer for TS, etc.)
- **MCP Server Factory** - SerenaMCPFactory manages server instances, tool registration, lifecycle
- **Transport:** Stdio (subprocess) or SSE (Server-Sent Events)

**Performance Optimizations:**
- Two-tier caching (Raw Document Symbols Cache stores LSP responses)
- Lazy initialization (servers start only when needed)
- Incremental indexing (only modified files re-indexed)
- File buffer management via reference counting
- Background task queue (serialized execution prevents resource contention)

### Symbol-Level Tools

| Tool | Function | Semantic Level |
|------|----------|-----------------|
| `find_symbol` | Global/local search by name/substring | Symbol |
| `find_referencing_symbols` | Find all references to a symbol | Symbol |
| `replace_symbol_body` | Replace entire symbol definition | Symbol |
| `insert_before/after_symbol` | Insert code at symbol boundaries | Symbol |
| `get_symbols_overview` | List top-level symbols in file | Symbol |
| `rename_symbol` | Refactor rename across project | Symbol |

All operations use LSP backend, **not text manipulation** - enabling precise edits in large codebases.

### Language Support

**30+ languages supported:** JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, Ruby, PHP, Kotlin, Scala, Swift, Clojure, Erlang, Haskell, Julia, Lua, MATLAB, Nix, OCaml, Perl, R, Solidity, TOML, YAML, Markdown, and more.

**TS/JS Specific:**
- Full support: .ts, .tsx, .js, .jsx, .mts, .cts
- Uses official `typescript-language-server`
- JetBrains plugin alternative (WebStorm) for IDE integration
- Vue 3.x TypeScript supported

### Limitations

1. **TS/JS Setup Issues** - Some deployment scenarios (e.g., MCP container) have TypeScript language server initialization problems
2. **Single-Language Focus** - Designed for strong support in primary language; polyglot projects require multiple server instances
3. **IDE Dependency** - JetBrains integration requires IDE installation (not needed for LSP mode)
4. **Startup Overhead** - LSP server startup adds initial latency
5. **No Cross-Repo Analysis** - Analyzes single project/repository at a time

---

## 3. Technical Comparison Matrix

| Aspect | GKG | Serena |
|--------|-----|--------|
| **Core Approach** | Full-project graph indexing | On-demand LSP symbol resolution |
| **Database** | Kuzu (property graph) | In-memory LSP cache |
| **Update Model** | Batch reindexing | Incremental file watching |
| **Query Language** | Cypher | MCP tool interface |
| **Cross-File Resolution** | Explicit graph edges | LSP queries at symbol level |
| **Initial Cost** | High (full indexing) | Low (lazy initialization) |
| **Query Latency** | Low (precomputed) | Medium (LSP analysis) |
| **Accuracy** | Good but incomplete (beta) | High (IDE-grade semantics) |
| **Memory Profile** | Large (DB + indexes) | Small (cache + one server) |
| **Refactoring Support** | Graph traversal | LSP refactoring ops |
| **Monorepo Ready** | No | Partial (single project focus) |

---

## 4. Performance Characteristics

### GKG Performance
- **Query Speed:** Fast (precomputed graph)
- **Multi-hop Queries:** 10-374x faster than Neo4j on analytical workloads
- **Scaling:** Handles billions of edges (Kuzu benchmarks: 2.2B edges on LDBC1000, 17B on Graph500-30)
- **Bottleneck:** Initial indexing time (project-dependent, can be hours for large codebases)

### Serena Performance
- **Initial Latency:** 1-5s per LSP server startup
- **Query Speed:** Sub-second for symbol operations (IDE-grade performance)
- **Incremental Updates:** Fast (only modified files re-analyzed)
- **Memory:** Low-overhead (caching + one active server typical)
- **Scaling Limit:** Single project; no multi-repo queries

---

## 5. Language Support & Suitability

### For TypeScript/JavaScript

**GKG:**
- Native TypeScript support via gitlab-code-parser
- Full AST parsing for all TS/JS constructs
- Handles complex type hierarchies

**Serena:**
- Official typescript-language-server (Microsoft/Pylance-based)
- IDE-grade semantics (same as VSCode, WebStorm)
- Resolves complex type inference
- Full support for JSX, Vue templates, etc.

**Winner:** Serena (tested IDE-grade semantics vs. grammar-based parsing)

### Cross-Language Projects

**GKG:** Native multi-language support (all parsed languages in one graph)

**Serena:** Multiple LSP servers in parallel; requires configuration per language

---

## 6. Integration with Next.js Project

### GKG Integration Path

**Pros:**
- Single unified graph for entire project
- Powerful architectural queries (dependency analysis)
- Good for "understand entire system" tasks

**Cons:**
- Setup: Install gkg CLI, run indexing (time-dependent on codebase size)
- Database risk: Kuzu deprecated; GKG team migrating to alternatives
- Overkill for single project, single-language work
- Beta stability concerns with cross-file refs

**Setup Complexity:** Medium
**Time to First Query:** High (indexing required)

### Serena Integration Path

**Pros:**
- Zero setup: Just configure `.serena/project.yml`
- Instant symbol resolution (LSP standard)
- Memory-efficient for large projects
- Proven IDE-grade semantics
- Open-source, MIT license, no subscriptions

**Cons:**
- No global cross-project queries
- Per-language server management needed
- No architectural visualization tools

**Setup Complexity:** Low
**Time to First Query:** ~5 seconds (LSP startup)

---

## 7. Recommendation for Your Next.js Project

### Decision Framework

**Choose Serena if:**
- You need **fast iteration** (startup < 5s vs. hours for indexing)
- TypeScript/JavaScript is your **primary language**
- You want **symbol-precision** edits (find references, rename refactoring)
- You value **low operational overhead** (no DB management)
- You need **immediate results** (no indexing wait)

**Choose GKG if:**
- You need **architectural analysis** (dependency graphs, system visualization)
- You want **complete cross-project queries** (monorepos with multiple repos)
- You're willing to **trade upfront cost** for query speed
- You need **deterministic, precomputed** results (not LSP probabilistic)

### For Your Scenario (Next.js Blog + Knowledge Base)

**Recommendation: Serena MCP**

**Rationale:**
1. **Next.js is TypeScript-native** - Serena's typescript-language-server is optimal
2. **Blog/KB features are medium-scale** - No monorepo complexity
3. **Fast iteration critical** - Dev server restart cycles favor low latency
4. **Code edits are symbol-level** - Rename variables, extract functions, find usages
5. **No architectural queries needed** - Blog posts don't require dependency analysis
6. **Zero operational burden** - No database management

**Integration Steps:**
1. Install Serena: `npm install -g serena` (or MCP server mode)
2. Create `.serena/project.yml` with TypeScript configuration
3. Configure Claude Code / editor with Serena MCP server
4. Start using symbol tools immediately

---

## 8. Unresolved Questions

1. **GKG Database Migration:** What will GKG use after Kuzu? Timeline for migration unknown
2. **Cross-File Ref Accuracy:** How often does GKG miss cross-file references in production?
3. **Serena Polyglot Perf:** Performance with 3+ LSP servers in parallel on Next.js + Python backend?
4. **GKG Query Optimization:** Are there query optimization tips for large graphs in production?
5. **Serena IDE Sync:** How well does Serena stay in sync with file changes in hot-reload dev?

---

## Sources

- [GitLab Knowledge Graph Documentation](https://docs.gitlab.com/user/project/repository/knowledge_graph/)
- [GKG Technical Documentation](https://gitlab-org.gitlab.io/rust/knowledge-graph/)
- [Serena GitHub Repository](https://github.com/oraios/serena)
- [Serena Documentation](https://oraios.github.io/serena/)
- [Kuzu Database Docs](https://docs.kuzudb.com/)
- [GKG Ontology](https://gkg.dev/docs)
- [Medium: Deconstructing Serena's MCP Architecture](https://medium.com/@souradip1000/deconstructing-serenas-mcp-powered-semantic-code-understanding-architecture-75802515d116)
- [Kuzu Performance Benchmarks](https://github.com/prrao87/kuzudb-study)
- [The Data Quarry: Kuzu Performance Study](https://thedataquarry.com/blog/embedded-db-2/)
