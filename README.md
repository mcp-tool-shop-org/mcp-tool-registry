# MCP Tool Registry

<div align="center">
  <img src="mcp-tool-registry_logo.png" alt="MCP Tool Registry Logo" height="150" />
</div>

[![Validate registry](https://github.com/mcp-tool-shop-org/mcp-tool-registry/actions/workflows/validate.yml/badge.svg)](https://github.com/mcp-tool-shop-org/mcp-tool-registry/actions/workflows/validate.yml)
[![NPM Version](https://img.shields.io/npm/v/@mcptoolshop/mcp-tool-registry)](https://www.npmjs.com/package/@mcptoolshop/mcp-tool-registry)

Metadata-only registry for MCP Tool Shop tools.

## Why This Exists

This registry serves as the "source of truth" for the MCP ecosystem. By decoupling tool metadata (what tools exist) from tool implementations (the code itself), we allow:

1. **Fast discovery**: Clients can search tools without cloning them.
2. **Safety**: We enforce schema validation before a tool is listed.
3. **Reproducibility**: You can pin your environment to a specific version of this registry.

## Registry Philosophy

- **Least Privilege**: Tools allow no side effects (writes, network) by default.
- **Explicit Opt-in**: Capabilities are listed in the registry so users know what they are installing.
- **Data-Only**: This repo contains no code, only JSON metadata.

## How MCP Tool Shop Fits Together

- **Registry** → what tools exist (this repo)
- **CLI** ([mcpt](https://github.com/mcp-tool-shop-org/mcpt)) → how you consume them
- **Examples** ([mcp-examples](https://github.com/mcp-tool-shop-org/mcp-examples)) → how you learn the model
- **Tags** (v0.1.0, v0.2.0) → stability, reproducibility
- **main** → development only; may change without notice; builds may break
- **Tools default to least privilege** → no network, no writes, no side effects
- **Capability is always explicit and opt-in** → you decide when to enable

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
