# Changelog

All notable changes to the MCP Tool Registry will be documented in this file.

## [0.3.0] - 2026-02-14

### Changed

- **BREAKING**: Bumped to v0.3.0 due to changes in public exports.
- Exported `bundles/evaluation.json` in `package.json` (previously hidden).

### Added

- **Governance**: Phase 7 complete.
  - Added `docs/registry-guidelines.md` and `docs/lifecycle.md`.
  - Added `scripts/policy-check.mjs` for enforcing ID format, description quality, and HTTPS.
  - Added `.github/pull_request_template.md`, Issue Templates, and `CODEOWNERS`.
- **Schema**: Added `deprecated` (boolean) and `deprecation_reason` (string) fields to tools.

### Changed

- **Regulation**: `npm run lint` now includes policy checks.
- **Data**: Bumped `registry.json` schema_version to `0.3`.

## [0.3.0] - 2026-02-14

- Initial release of the metadata-only registry.
- Support for `core`, `agents`, and `ops` bundles.
