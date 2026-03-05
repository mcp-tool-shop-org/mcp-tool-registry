---
title: Bundles & Structure
description: How bundles work and what ships in the package.
sidebar:
  order: 2
---

## Bundles

Bundles are rule-generated groupings of tools. Membership is determined by declarative rules — not manual curation.

| Bundle         | Description                                              | Selection logic                                          |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| **core**       | Essential utilities every workspace needs                | Explicit ID list                                         |
| **agents**     | Agent orchestration, navigation, context, tool selection | Explicit IDs + `agents` tag                              |
| **ops**        | DevOps, infrastructure, deployment, monitoring           | Tags: `automation`, `packaging`, `release`, `monitoring` |
| **evaluation** | Testing, benchmarking, coverage analysis                 | Tags: `testing`, `evaluation`, `benchmark`, `coverage`   |

## Package structure

```
mcp-tool-registry/
├── registry.json              # Canonical source of truth
├── schema/registry.schema.json
├── bundles/                   # Rules-generated subsets
├── dist/                      # Derived artifacts (generated at publish)
│   ├── registry.index.json    # Search index
│   ├── capabilities.json      # Capability reverse map
│   ├── derived.meta.json      # Build metadata + registry hash
│   └── registry.llms.txt      # LLM-native context
└── curation/featured.json     # Featured tools and collections
```

## Derived artifacts

These artifacts are generated at publish time from the canonical `registry.json`:

| Artifact              | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `registry.index.json` | Pre-built search index with keywords and facets            |
| `capabilities.json`   | Reverse map from capabilities to tools                     |
| `derived.meta.json`   | Build metadata and registry content hash                   |
| `registry.llms.txt`   | Plain-text tool descriptions optimized for LLM consumption |

## Design principles

**Data-only** — Zero executable code. Consumers import JSON metadata and use it however they need.

**Schema-validated** — Every tool entry is validated against a JSON Schema in CI. Required fields, ID format, description quality, HTTPS URLs, and policy rules are all checked before merge.

**Least privilege** — Tools default to zero capabilities. Side-effects are opt-in and must be declared explicitly in the schema. Deprecated tools are automatically excluded from all bundles.

**Reproducible** — Pin a version, get deterministic metadata every time.
