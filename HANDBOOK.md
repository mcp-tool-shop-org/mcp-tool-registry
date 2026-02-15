# MCP Tool Registry Handbook

Welcome to the MCP Tool Registry Handbook! This guide will help you understand how to use, contribute to, and search the registry.

## Table of Contents

- [Quick Start](#quick-start)
- [Searching the Registry](#searching-the-registry)
- [Contributing New Tools](CONTRIBUTING.md)
- [Registry Structure & Schema](schema/registry.schema.json)
- [Architecture](ARCHITECTURE.md) (Coming Soon)

## Quick Start

The registry is a JSON API, but we provide CLI tools to explore it.

1. **Install Dependencies**:

```bash
npm install
```

2. **Search for Tools**:

```bash
node scripts/query.mjs --q "accessibility"
```

3. **Get Insights**:

```bash
node scripts/facets.mjs
node scripts/health-report.mjs
```

## Searching the Registry

See [Search Documentation](docs/search.md) for full details on CLI usage, filtering, and ranking.

## For Tool Authors

If you want to add your tool or package it into a bundle:

1. Add your tool metadata to `registry.json`.
2. Run `npm run validate` to check schema compliance.
3. Submit a Pull Request.

Guidelines:

- Use clear, descriptive names.
- Provide valid repository URLs.
- Tag your tools appropriately (e.g., `ai`, `accessibility`, `testing`).
