import { readFile, writeFile, mkdir, readdir } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { createHash } from "crypto"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")
const distDir = join(rootDir, "dist")

async function buildDerived() {
  console.log("🏗️  Building derived metadata...")

  try {
    // Ensure dist exists
    await mkdir(distDir, { recursive: true })

    // Read Source Data
    const registryPath = join(rootDir, "registry.json")
    const registryContent = await readFile(registryPath, "utf-8")
    const registry = JSON.parse(registryContent)
    
    // Read Package Version
    const pkgPath = join(rootDir, "package.json")
    const pkgContent = await readFile(pkgPath, "utf-8")
    const pkg = JSON.parse(pkgContent)

    // 1. derived.meta.json
    console.log("   - Generating derived.meta.json")
    const metaStr = JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        registry_hash: createHash("sha256")
          .update(registryContent)
          .digest("hex"),
        schema_version: registry.schema_version,
        registry_version: pkg.version,
        tool_count: registry.tools.length
      },
      null,
      2
    )
    await writeFile(join(distDir, "derived.meta.json"), metaStr)

    // 2. registry.index.json
    console.log("   - Generating registry.index.json")
    const tools = registry.tools || []

    // Sort tools by ID for deterministic output
    tools.sort((a, b) => a.id.localeCompare(b.id))

    // Helper to normalize and tokenize text
    const tokenize = text => {
      if (!text) return []
      return text
        .toLowerCase()
        .split(/[\s\-_,]+/)
        .filter(t => t.length > 2) // Filter very short words
        .sort() // Sort for stability (though usually we just use set)
    }

    const index = tools.map(tool => {
      const keywords = new Set([
        ...tokenize(tool.name),
        ...tokenize(tool.description),
        ...(tool.tags || []).map(t => t.toLowerCase())
      ])

      // Find bundle membership (we'd need to read bundles for this, let's load them)
      // For now, we'll implement bundle loading if strictness requires it,
      // but let's first get the basic index structure.

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        keywords: Array.from(keywords).sort(), // Stable order
        tags: (tool.tags || []).sort()
        // capabilities: tool.capabilities // If present in schema later
        // bundle_membership: [] // To be populated
      }
    })

    // Bundle Membership Logic
    const bundlesDir = join(rootDir, 'bundles');
    const bundleMap = new Map(); // toolId -> Set(bundleNames)
    
    // Read generated bundles directly from file system
    // Filter for JSON files, exclude rules directory (though readdir is shallow)
    const bundleFiles = (await readdir(bundlesDir)).filter(f => f.endsWith('.json') && !f.includes('rules'));

    for (const file of bundleFiles) {
        const bundleName = file.replace('.json', '');
        try {
            const bundleContent = await readFile(join(bundlesDir, file), 'utf-8');
            const bundle = JSON.parse(bundleContent);
            if (bundle.tools && Array.isArray(bundle.tools)) {
                bundle.tools.forEach(tid => {
                    if (!bundleMap.has(tid)) bundleMap.set(tid, new Set());
                    bundleMap.get(tid).add(bundleName);
                });
            }
        } catch (e) { 
            console.warn(`    ⚠️ Warning: Failed to read bundle ${file}: ${e.message}`);
        }
    }

    // Attach bundle membership & default capabilities
    index.forEach(entry => {
      if (bundleMap.has(entry.id)) {
        entry.bundle_membership = Array.from(bundleMap.get(entry.id)).sort()
      } else {
        entry.bundle_membership = []
      }
      // Capabilities placeholder - to be populated from tool definition if schema updates
      // For now, we initialize empty array to support querying
      entry.capabilities = [] 
    })

    await writeFile(
      join(distDir, "registry.index.json"),
      JSON.stringify(index, null, 2)
    )

    // 3. capabilities.json
    console.log(
      "   - Generating capabilities.json (placeholder for future schema)"
    )
    // Currently registry schema doesn't seem to have "capabilities" field on tools explicitly
    // based on previous "read_file" of registry.json.
    // Assuming if it existed or if we infer from tags simply for now?
    // The prompt says "capabilities (if present in registry)".
    // Let's implement the logic to check for it.

    const capabilitiesMap = {}
    tools.forEach(tool => {
      // Hypothethical 'capabilities' array in tool definition
      const toolCaps = tool.capabilities || []
      toolCaps.forEach(cap => {
        const capKey = cap.toLowerCase()
        if (!capabilitiesMap[capKey]) capabilitiesMap[capKey] = []
        capabilitiesMap[capKey].push(tool.id)
      })
    })

    // Ensure sorted tool lists
    const sortedCaps = {}
    Object.keys(capabilitiesMap)
      .sort()
      .forEach(key => {
        sortedCaps[key] = capabilitiesMap[key].sort()
      })

    await writeFile(
      join(distDir, "capabilities.json"),
      JSON.stringify(sortedCaps, null, 2)
    )

    console.log("✅ Derived artifacts built successfully.")
  } catch (error) {
    console.error("❌ Error building derived metadata:", error)
    process.exit(1)
  }
}

buildDerived()
