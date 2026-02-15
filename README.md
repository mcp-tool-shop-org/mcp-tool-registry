# MCP Tool Registry

<div align="center">
  <img src="logo.jpg" alt="MCP Tool Registry" width="500" />
</div>

[![Validate registry](https://github.com/mcp-tool-shop-org/mcp-tool-registry/actions/workflows/validate.yml/badge.svg)](https://github.com/mcp-tool-shop-org/mcp-tool-registry/actions/workflows/validate.yml)
[![NPM Version](https://img.shields.io/npm/v/@mcptoolshop/mcp-tool-registry)](https://www.npmjs.com/package/@mcptoolshop/mcp-tool-registry)

Metadata-only registry for MCP Tool Shop tools.

## Why This Exists

This registry serves as the "source of truth" for the MCP ecosystem. By decoupling tool metadata (what tools exist) from tool implementations (the code itself), we allow:

1. **Fast discovery**: Clients can search tools without cloning them.
2. **Safety**: We enforce schema validation before a tool is listed.
3. **Reproducibility**: You can pin your environment to a specific version of this registry.

## browse the Registry

You can browse the registry visually using our [Web Explorer](site/index.html).
_(Note: To view locally, open `site/index.html` in your browser)_

## Ecosystem

The MCP Tool Registry is the definitive source of truth for discoverable MCP tools. It connects tool authors with users across the ecosystem.

- **[mcpt CLI](https://github.com/mcp-tool-shop-org/mcpt)**: The official client to discover, install, and run tools.
- **[Public Explorer](https://mcp-tool-shop-org.github.io/mcp-tool-registry/)**: Browse the registry on the web.
- **[Submit a Tool](https://github.com/mcp-tool-shop-org/mcp-tool-registry/issues/new/choose)**: Add your tool to the ecosystem.

## Versioning & Compatibility

We adhere to SemVer. The current stable contract is **v1.x**.

| Component         | Status      | Compatibility                   |
| :---------------- | :---------- | :------------------------------ |
| **registry.json** | Stable (v1) | Core data schema is frozen.     |
| **mcpt CLI**      | v0.2.0+     | Supports v1 registry artifacts. |
| **bundler**       | v1.0.0      | Generates v1 distribution.      |

## Quick Links

- [Start Here](START_HERE.md) ✨
- [Contract & Stability](docs/contract.md)
- [Submitting Tools](docs/submitting-tools.md)
- [Bundle Definitions](docs/bundles.md)
- [AI Native Context](dist/registry.llms.txt)
- [Ecosystem Index](ECOSYSTEM.md)

## Core Concepts

- **Canonical Files**: The build process generates `registry.index.json`, the single static artifact that all clients (`mcpt`, explorer) consume.
- **Rules-Generated Bundles**: Tools are organized into bundles (`core`, `ops`, `agents`, `evaluation`) based on objective rules, not manual curation.
- **Least Privilege**: Tools allow no side effects (writes, network) by default.
- **Explicit Opt-in**: Capabilities are listed in the registry so users know what they are installing.
- **Data-Only**: This repo contains no code, only JSON metadata.

## Getting Started

```bash
# View available tags
git tag -l

# Validate schema locally
npm run validate

# Use with mcpt CLI (pin to a release)
mcpt init --registry-ref v0.1.0
```

## Consumers (Using as a Library)

The registry is published as a standard NPM package.

```bash
npm install @mcptoolshop/mcp-tool-registry
```

### Canonical Metadata

```javascript
import registry from "@mcptoolshop/mcp-tool-registry/registry.json" with { type: "json" }
// or
import coreBundle from "@mcptoolshop/mcp-tool-registry/bundles/core.json" with { type: "json" }
```

### Derived Metadata (Fast Lookups)

The package includes pre-built indexes for easier consumption:

- `dist/registry.index.json`: Optimized search index with keywords and bundle membership.
- `dist/capabilities.json`: Reverse lookup map (Capability -> Tool IDs).
- `dist/derived.meta.json`: Build metadata and registry hash.

```javascript
import toolIndex from "@mcptoolshop/mcp-tool-registry/dist/registry.index.json" with { type: "json" }

// Find tools related to "compliance"
const relevantTools = toolIndex.filter(t => t.keywords.includes("compliance"))
```

## Structure

```
mcp-tool-registry/
├── registry.json              # Canonical tool registry
├── dist/                      # Derived artifacts (generated on publish)
│   ├── registry.index.json    # Search index
│   └── capabilities.json      # Capability map
├── schema/
│   └── registry.schema.json   # JSON Schema for validation
├── bundles/                   # Curated subsets
```

## Usage

The registry is consumed by the `mcp` CLI tool. Tools are installed via git.

## Adding a Tool

1. Read [Contribution Guidelines](docs/registry-guidelines.md).
2. Add an entry to `registry.json`.
3. Ensure it validates against the schema.
4. Submit a PR.

## Schema

Each tool requires:

- `id`: kebab-case identifier (e.g., `file-compass`)
- `name`: Human-readable name
- `description`: What the tool does
- `repo`: GitHub repository URL
- `install`: Installation config (`type`, `url`, `default_ref`)
- `tags`: Array of tags for search/filtering
- `defaults` (optional): Default settings like `safe_run`

## Bundles

Bundles are curated collections of tools:

- **core**: Essential utilities
- **agents**: Agent orchestration tools
- **ops**: Operations and infrastructure

## Validation

The registry is validated on every PR/push via GitHub Actions.

## What Does Pinning Mean?

When you set `ref: v0.1.0` in your `mcp.yaml`, you're pinning the **registry metadata**, not the tool code itself.

- **Registry ref** → which version of `registry.json` you read (tool IDs, descriptions, install URLs)
- **Tool ref** → each tool has its own `default_ref` in the registry (usually `main` or a tag)

To pin a specific tool version, use `mcpt add tool-id --ref v1.0.0` in your workspace.
