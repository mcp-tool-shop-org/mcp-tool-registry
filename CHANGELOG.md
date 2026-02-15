# Changelog

All notable changes to the MCP Tool Registry will be documented in this file.

## [1.0.0] - 2026-02-15

### Stability Guarantees Formalized

- **v1.x Contract**: Established rigid stability guarantees for `registry.json` schema and `dist` artifacts.
- **Ecosystem Index**: Added `ECOSYSTEM.md` as the central hub.
- **Navigation**: Added `START_HERE.md` and "Quick Links" to README.
- **Exports Verified**: CI now enforces the presence of all critical artifacts (`registry.json`, `dist/registry.index.json`, `registry.llms.txt`).

### Changed

- **Documentation**: Standardized terminology across registry and `mcpt` CLI.
- **Package**: Bumped to `1.0.0` to signal production readiness.

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
