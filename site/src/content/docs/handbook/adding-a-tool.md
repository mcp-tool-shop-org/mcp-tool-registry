---
title: Adding a Tool
description: How to submit your tool to the registry.
sidebar:
  order: 3
---

## Submission process

1. Read the [registry guidelines](https://github.com/mcp-tool-shop-org/mcp-tool-registry/blob/main/docs/registry-guidelines.md)
2. Add an entry to `registry.json` (keep the tools array sorted by `id`)
3. Run `npm run validate` and `npm run policy` to verify your entry
4. Submit a Pull Request

## Entry requirements

Every tool entry must include:

- **id** — Unique, lowercase, hyphen-separated identifier
- **name** — Human-readable name
- **description** — Clear description of what the tool does (minimum quality bar enforced)
- **repository** — HTTPS GitHub URL
- **install** — Installation method and package reference
- **capabilities** — List of capabilities the tool requires (defaults to none)
- **tags** — Categorization tags for search and bundle membership

## Validation

CI runs two checks on every PR:

- **Schema validation** (`npm run validate`) — Checks required fields, ID format, URL format, and structural rules
- **Policy check** (`npm run policy`) — Enforces ecosystem-wide policies like HTTPS URLs, description quality, and capability declarations

Both must pass before a PR can be merged.

## After merge

Once merged, your tool will:

- Appear in `registry.json` and the search index
- Be discoverable via `mcpt list`, `mcpt search`, and the web explorer
- Be eligible for bundle membership based on its tags and maturity level
- Show up in the next registry version published to npm
