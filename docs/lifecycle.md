# Lifecycle Policy

We enforce strict lifecycle stages for tools to ensure reliable consumption.

## Stages

### 1. Active

Tools are considered **Active** by default. Consumers can rely on them being available and maintained (to the extent of the repo owner).

### 2. Deprecated

A tool is **Deprecated** when it is no longer recommended for new use, but still exists in the registry.

- **Why?** Replaced by a better tool, repo archived, or critical security flaw unpatched.
- **Consumer Action**: Warn users but allow install.

**How to deprecate:**
Add the following fields to the tool entry in `registry.json`:

```json
{
  "id": "old-tool",
  ...
  "deprecated": true,
  "deprecation_reason": "Replaced by new-tool-v2"
}
```

### 3. Removed (Archived)

A tool is **Removed** when it is deleted from the `tools` array.

- **Why?** Malware, legal takedown, or completely broken.
- **Consumer Action**: Tool is gone. `mcpt install` will fail.
- **Record**: Check `archived` array in `registry.json` (optional historical record).

## Policy Logic

Our CI enforces:

- If `"deprecated": true` is present, `"deprecation_reason"` is **required**.
- IDs of removed tools are permanently retired (do not reuse).
