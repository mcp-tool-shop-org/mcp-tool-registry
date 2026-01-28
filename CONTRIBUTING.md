# Contributing to MCP Tool Registry

The MCP Tool Registry is a metadata-only registry for MCP Tool Shop tools. It maintains the canonical index of available tools and bundles.

## Adding or Updating a Tool

1. **Add an entry to `registry.json`** with the following fields:
   - `id`: kebab-case identifier (e.g., `file-compass`)
   - `name`: Human-readable tool name
   - `description`: Clear, concise description of what the tool does
   - `repo`: GitHub repository URL
   - `install`: Installation config:
     - `type`: `"git"` (current standard)
     - `url`: Git clone URL
     - `default_ref`: Default branch/tag to use (usually `main`)
   - `tags`: Array of searchable tags
   - `defaults` (optional): Default settings like `safe_run: true`

2. **Example entry:**
   ```json
   {
     "id": "my-tool",
     "name": "My Tool",
     "description": "Does something useful",
     "repo": "https://github.com/mcp-tool-shop/my-tool",
     "install": {
       "type": "git",
       "url": "https://github.com/mcp-tool-shop/my-tool.git",
       "default_ref": "main"
     },
     "tags": ["category", "use-case"],
     "defaults": {
       "safe_run": true
     }
   }
   ```

3. **Validate the schema locally:**
   ```bash
   npx ajv validate -s schema/registry.schema.json -d registry.json
   ```

4. **Submit a pull request** with your changes.

## Schema Updates

If you need to update `schema/registry.schema.json`:

1. Update the schema with your changes
2. Validate that all existing `registry.json` entries still validate
3. Document the schema change in your PR description

## Tags and Bundles

### Using Tags

Tags help users discover tools by category or capability:

- Use lowercase, hyphenated tags
- Be consistent with existing tags
- Include 2-4 relevant tags per tool

Common tag categories:
- **Functional**: automation, search, navigation, orchestration, scheduling
- **Domain**: image, audio, video, filesystem, database, api
- **Platform**: comfyui, pytorch, transformers, openai
- **Tool type**: cli, library, agent, integration

### Bundles

Bundles are curated collections in `bundles/`:

- **core.json**: Essential utilities
- **agents.json**: Agent orchestration tools
- **ops.json**: Operations and infrastructure

To add a tool to a bundle, add its ID to the appropriate `tools` array in `bundles/*.json`.

## CI Validation

Every PR is validated via GitHub Actions:

1. Registry JSON schema validation
2. All tools have required fields
3. All referenced repos are valid
4. No duplicate tool IDs

## Release Process

1. Tag the registry version: `git tag v0.x.y`
2. Push the tag: `git push origin v0.x.y`
3. Users pin this tag in their mcp.yaml: `registry-ref: v0.x.y`

## What's Stable?

- `registry.json` schema
- Tool ID format
- Install config format

What may change:
- Exact fields on tool entries (new optional fields may be added)
- Bundle organization
- Tag taxonomy

## Questions?

Open an issue or discussion in the [MCP Tool Shop](https://github.com/mcp-tool-shop) organization.
