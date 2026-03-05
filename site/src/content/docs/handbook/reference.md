---
title: Reference
description: Schema versioning, security scope, and ecosystem links.
sidebar:
  order: 4
---

## Schema versioning

The v1 contract is stable:

- New optional fields may be added in minor versions
- Required fields and existing field shapes will not change within a major version
- The schema version is declared in `registry.json` and validated in CI

## Security & data scope

This is a **data-only** package — no executable code ships.

| Aspect               | Detail                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Data touched**     | Tool names, descriptions, tags, and repo URLs in `registry.json`; derived search indices in `dist/` |
| **Data NOT touched** | No user files, no OS credentials, no network requests at runtime                                    |
| **Telemetry**        | None collected or sent                                                                              |

## Ecosystem

| Package                                                                                                | Role                                               |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| [mcpt CLI](https://github.com/mcp-tool-shop-org/mcpt)                                                  | Official client — discover, install, and run tools |
| [Public Explorer](https://mcp-tool-shop-org.github.io/mcp-tool-registry/)                              | Browse available tools on the web                  |
| [Registry Contract](https://github.com/mcp-tool-shop-org/mcp-tool-registry/blob/main/docs/contract.md) | Stability and metadata guarantees                  |
| [Submit a Tool](https://github.com/mcp-tool-shop-org/mcp-tool-registry/issues/new/choose)              | Contribute to the ecosystem                        |

## Import paths

```javascript
// Full registry
import registry from "@mcptoolshop/mcp-tool-registry/registry.json"

// Individual bundles
import core from "@mcptoolshop/mcp-tool-registry/bundles/core.json"
import agents from "@mcptoolshop/mcp-tool-registry/bundles/agents.json"
import ops from "@mcptoolshop/mcp-tool-registry/bundles/ops.json"
import evaluation from "@mcptoolshop/mcp-tool-registry/bundles/evaluation.json"

// Derived artifacts
import index from "@mcptoolshop/mcp-tool-registry/dist/registry.index.json"
import caps from "@mcptoolshop/mcp-tool-registry/dist/capabilities.json"
import meta from "@mcptoolshop/mcp-tool-registry/dist/derived.meta.json"
```

All imports use `with { type: "json" }` for JSON modules in ESM contexts.
