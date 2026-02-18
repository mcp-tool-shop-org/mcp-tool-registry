<p align="center"><img src="logo.png" alt="MCP Tool Registry logo" width="200"></p>

# mcp-tool-registry

> Part of [MCP Tool Shop](https://mcptoolshop.com)

**The metadata-only registry -- the single source of truth for all MCP Tool Shop tools.**

[![npm version](https://img.shields.io/npm/v/@mcptoolshop/mcp-tool-registry)](https://www.npmjs.com/package/@mcptoolshop/mcp-tool-registry)
[![license](https://img.shields.io/npm/l/@mcptoolshop/mcp-tool-registry)](LICENSE)
[![v1 stable](https://img.shields.io/badge/contract-v1%20stable-brightgreen)](#versioning--compatibility)

---

## At a Glance

- **Data-only** -- no executable code, just JSON metadata describing every tool in the ecosystem.
- **Schema-validated** -- every entry is checked against a JSON Schema on commit and in CI.
- **Bundle system** -- tools are grouped into opinionated bundles (`core`, `agents`, `ops`, `evaluation`) by rules, not manual curation.
- **Fast discovery** -- a pre-built search index with keywords and facets ships inside the package.
- **Least privilege** -- tools default to zero capabilities; side-effects are opt-in and declared explicitly.
- **Reproducible** -- pin a registry version in your workspace and get deterministic metadata every time.

## Ecosystem

The registry sits at the center of the MCP Tool Shop ecosystem.

- **[mcpt CLI](https://github.com/mcp-tool-shop-org/mcpt)** -- the official client to discover, install, and run tools.
- **[Public Explorer](https://mcp-tool-shop-org.github.io/mcp-tool-registry/)** -- browse the registry on the web.
- **[Submit a Tool](https://github.com/mcp-tool-shop-org/mcp-tool-registry/issues/new/choose)** -- add your tool to the ecosystem.

## Quick Start

### Install

```bash
npm install @mcptoolshop/mcp-tool-registry
```

### Import the full registry

```javascript
import registry from "@mcptoolshop/mcp-tool-registry/registry.json" with { type: "json" };

console.log(`${registry.tools.length} tools registered`);
```

### Import a bundle

```javascript
import coreBundle from "@mcptoolshop/mcp-tool-registry/bundles/core.json" with { type: "json" };
```

### Use the search index

```javascript
import toolIndex from "@mcptoolshop/mcp-tool-registry/dist/registry.index.json" with { type: "json" };

const hits = toolIndex.filter(t => t.keywords.includes("accessibility"));
```

## Consumers

The registry is published as a standard npm package. There are three layers you can consume.

### Canonical metadata

`registry.json` is the source of truth. Every tool entry lives here.

```javascript
import registry from "@mcptoolshop/mcp-tool-registry/registry.json" with { type: "json" };
```

### Bundles

Bundles are curated subsets built by rules at publish time.

```javascript
import agents from "@mcptoolshop/mcp-tool-registry/bundles/agents.json" with { type: "json" };
```

Available bundles: `core`, `agents`, `ops`, `evaluation`.

### Derived indexes

Pre-built artifacts in `dist/` optimized for fast lookups.

| Artifact | Purpose |
| :--- | :--- |
| `dist/registry.index.json` | Search index with keywords and bundle membership |
| `dist/capabilities.json` | Reverse lookup: capability to tool IDs |
| `dist/derived.meta.json` | Build metadata, registry hash, tool count |
| `dist/registry.llms.txt` | Plain-text context file for LLM RAG pipelines |

```javascript
import meta from "@mcptoolshop/mcp-tool-registry/dist/derived.meta.json" with { type: "json" };

console.log(`Registry hash: ${meta.registry_hash}`);
```

## Bundles

Bundles group tools into installable collections. Membership is determined by declarative rules (tag matching or explicit ID lists), not manual curation. Deprecated tools are automatically excluded.

| Bundle | Description | Selection logic |
| :--- | :--- | :--- |
| **core** | Essential utilities | Explicit ID list |
| **agents** | Agent orchestration, navigation, context, tool selection | Explicit IDs + `agents` tag |
| **ops** | DevOps, infrastructure, deployment | Tags: `automation`, `packaging`, `release`, `monitoring` |
| **evaluation** | Testing, benchmarking, coverage | Tags: `testing`, `evaluation`, `benchmark`, `coverage` |

Bundle rules live in `bundles/rules/*.rules.json`.

## Structure

```
mcp-tool-registry/
├── registry.json              # Canonical tool registry (source of truth)
├── schema/
│   └── registry.schema.json   # JSON Schema for validation
├── bundles/                   # Rules-generated subsets
│   ├── core.json
│   ├── agents.json
│   ├── ops.json
│   ├── evaluation.json
│   └── rules/                 # Declarative bundle rules
├── dist/                      # Derived artifacts (generated at publish)
│   ├── registry.index.json    # Search index
│   ├── capabilities.json      # Capability reverse map
│   ├── derived.meta.json      # Build metadata
│   └── registry.llms.txt      # LLM-native context
├── curation/
│   └── featured.json          # Featured tools and collections
├── docs/                      # Deep-dive documentation
├── scripts/                   # Build, validate, search, policy tooling
└── site/                      # Public Explorer source
```

## Schema

Every tool entry in `registry.json` must conform to `schema/registry.schema.json`.

### Required fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Kebab-case identifier (e.g., `file-compass`) |
| `name` | `string` | Human-readable display name |
| `description` | `string` | What the tool does (min 10 characters) |
| `repo` | `string` (URI) | GitHub repository URL (HTTPS) |
| `install` | `object` | Installation config: `type`, `url`, `default_ref` |
| `tags` | `string[]` | Searchable tags for discovery |

### Optional fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `defaults` | `object` | Default settings (e.g., `safe_run: true`) |
| `ecosystem` | `string` | Ecosystem grouping (e.g., `accessibility`) |
| `verification` | `enum` | `none`, `community`, or `official` |
| `deprecated` | `boolean` | Whether the tool is deprecated |
| `deprecation_reason` | `string` | Why the tool was deprecated |
| `note` | `string` | Freeform note |

## Versioning & Compatibility

The registry follows SemVer. The current stable contract is **v1.x**.

| Component | Status | Compatibility |
| :--- | :--- | :--- |
| **registry.json** | Stable (v1) | Core data schema is frozen |
| **mcpt CLI** | v0.2.0+ | Supports v1 registry artifacts |
| **Bundler** | v1.0.0 | Generates v1 distribution |

New optional fields may be added in minor versions. Required fields and the shape of existing fields will not change within a major version.

## Adding a Tool

1. Read the [Registry Guidelines](docs/registry-guidelines.md).
2. Add an entry to `registry.json` (keep the `tools` array sorted by `id`).
3. Run `npm run validate` to check schema compliance.
4. Run `npm run policy` to check policy rules (ID format, description quality, HTTPS).
5. Submit a Pull Request.

## Pinning

When you set `registry-ref: v1.0.0` in your workspace, you are pinning the **registry metadata**, not the tool code.

- **Registry ref** controls which version of `registry.json` you read (tool IDs, descriptions, install URLs).
- **Tool ref** is the `default_ref` inside each tool entry (usually `main` or a release tag).

To pin a specific tool version: `mcpt add tool-id --ref v2.0.0`.

## Docs

| Document | Description |
| :--- | :--- |
| [HANDBOOK.md](HANDBOOK.md) | Deep-dive: architecture, data model, bundles, search, policy, contributing |
| [ECOSYSTEM.md](ECOSYSTEM.md) | Ecosystem navigation hub |
| [START_HERE.md](START_HERE.md) | Quick orientation for new visitors |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to add tools, update schema, submit PRs |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## License

[MIT](LICENSE)
