# MCP Tool Registry

Metadata-only registry for MCP Tool Shop tools.

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
npx ajv validate -s schema/registry.schema.json -d registry.json

# Use with mcpt CLI (pin to a release)
mcpt init --registry-ref v0.1.0
```

## Structure

```
mcp-tool-registry/
├── registry.json              # Main tool registry
├── schema/
│   └── registry.schema.json   # JSON Schema for validation
├── bundles/
│   ├── core.json              # Core utilities bundle
│   ├── agents.json            # Agent tools bundle
│   └── ops.json               # Operations bundle
└── .github/
    └── workflows/
        └── validate.yml       # CI validation
```

## Usage

The registry is consumed by the `mcp` CLI tool. Tools are installed via git.

## Adding a Tool

1. Add an entry to `registry.json`
2. Ensure it validates against the schema
3. Submit a PR

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
