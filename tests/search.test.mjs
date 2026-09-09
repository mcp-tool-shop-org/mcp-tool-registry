import { execSync } from "child_process"
import assert from "assert"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")
const queryScript = join(rootDir, "scripts", "query.mjs")

console.log("test:search :: Starting smoke tests for query.mjs...")

function runQuery(args) {
  try {
    const cmd = `node "${queryScript}" ${args} --json`
    console.log(`  Running: ${args}`)
    const output = execSync(cmd, { encoding: "utf-8" })
    return JSON.parse(output)
  } catch (error) {
    console.error(`  ❌ Failed running query: ${args}`)
    console.error(error.message)
    throw error
  }
}

// Test 1: Deterministic output for known ID
const idResults = runQuery("--id accessibility-suite")
assert.strictEqual(idResults.length, 1, "Should find exactly 1 tool by ID")
assert.strictEqual(idResults[0].id, "accessibility-suite", "ID should match")
console.log("  ✅ ID filter works")

// Test 2: Bundle filter works (core bundle should have tools)
// Assert against the bundle definition rather than a hardcoded id. The previous
// version expected tool-scan, which went away with the other ghost entries in
// 004edcf and left this test failing against every later registry.
const coreBundle = JSON.parse(
  readFileSync(join(rootDir, "bundles", "core.json"), "utf-8")
)
const bundleResults = runQuery("--bundle core")
assert.ok(bundleResults.length > 0, "Core bundle should not be empty")
assert.deepStrictEqual(
  bundleResults.map(t => t.id).sort(),
  [...coreBundle.tools].sort(),
  "Bundle filter should return exactly the tools the core bundle declares"
)
console.log("  ✅ Bundle filter works")

// Test 3: Keyword search ranking
const searchResults = runQuery('--q "accessibility" --explain')
assert.ok(searchResults.length > 0, "Should find accessibility tools")
// Top result should be related to accessibility
assert.ok(
  searchResults[0].id.includes("accessibility") ||
    searchResults[0].keywords.includes("accessibility"),
  "Top result relevant"
)
// Check explanation
assert.ok(searchResults[0]._reasons.length > 0, "Explanation should be present")
console.log("  ✅ Keyword search & ranking works")

// Test 4: Stable JSON Output
const json1 = runQuery('--q "test"')
const json2 = runQuery('--q "test"')
assert.deepStrictEqual(json1, json2, "Query should be deterministic")
console.log("  ✅ JSON output stable")

console.log("All search tests passed! 🎉")
