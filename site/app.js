// site/app.js

/**
 * MCP Tool Registry Explorer
 *
 * Fetches JSON artifacts from ./dist/ and renders them.
 * No backend required.
 */

const INDEX_URL = "./dist/registry.index.json"
const META_URL = "./dist/derived.meta.json"
const FEATURED_URL = "./dist/featured.json"
const LOGO_URL = "./mcp-tool-registry_logo.png"

let registry = []
let filtered = []
let featuredData = { featured: [], collections: [] }
let activeCollectionId = null

const searchInput = document.getElementById("search")
const resultsContainer = document.getElementById("results")
const resultsHeader = document.getElementById("results-header")
const bundleFilters = document.getElementById("bundle-filters")
const tagFilters = document.getElementById("tag-filters")
const modal = document.getElementById("modal")
const modalBody = document.getElementById("modal-body")
const featuredSection = document.getElementById("featured-section")
const featuredGrid = document.getElementById("featured-grid")
const collectionsGrid = document.getElementById("collections-grid")

// --- Init ---

async function init() {
  try {
    const [indexRes, metaRes, featuredRes] = await Promise.all([
      fetch(INDEX_URL),
      fetch(META_URL),
      fetch(FEATURED_URL).catch(() => ({ ok: false }))
    ])

    if (!indexRes.ok) throw new Error("Failed to load registry index")

    registry = await indexRes.json()
    const meta = await metaRes.json()

    if (featuredRes.ok) {
      try {
        featuredData = await featuredRes.json()
        renderFeaturedSection()
      } catch (e) {
        console.warn("Failed to parse featured.json", e)
      }
    }

    document.getElementById("version").innerHTML = `
            v${meta.registry_version} <span style="opacity:0.6; font-size: 0.8em; margin-left: 5px;">(hash: ${meta.registry_hash.substring(0, 7)})</span>
        `

    // Render Facets
    renderFacets()

    // Check URL for direct link or search
    handleRouting()

    // Initial Render
    filterAndRender()
  } catch (err) {
    resultsHeader.textContent = `Error loading registry: ${err.message}`
    console.error(err)
  }
}

// --- Featured & Collections ---

function renderFeaturedSection() {
  if (!featuredData.featured.length && !featuredData.collections.length) return

  // Only show if we haven't searched yet? For now, always show at top.
  featuredSection.style.display = "block"

  // Render Featured Tools
  featuredGrid.innerHTML = ""
  featuredData.featured.forEach(toolId => {
    const tool = registry.find(t => t.id === toolId)
    if (!tool) return

    const card = createToolCard(tool, true)
    featuredGrid.appendChild(card)
  })

  // Render Collections
  collectionsGrid.innerHTML = ""
  featuredData.collections.forEach(col => {
    const div = document.createElement("div")
    div.className = "card" // Reuse card style but smaller
    div.style.minWidth = "200px"
    div.style.flex = "1"
    div.style.cursor = "pointer"

    // Count tools in collection
    const count = col.tools.filter(tid =>
      registry.find(r => r.id === tid)
    ).length

    div.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 5px;">
                <h3 style="margin:0; font-size:1rem; color: #58a6ff;">${col.name}</h3>
                <span style="font-size:0.8rem; background:#238636; padding:2px 6px; border-radius:10px;">${count}</span>
            </div>
            <p style="font-size:0.8rem; color:#8b949e; margin:0;">${col.description}</p>
        `
    div.onclick = () => selectCollection(col.id)
    collectionsGrid.appendChild(div)
  })
}

function selectCollection(collectionId) {
  if (activeCollectionId === collectionId) {
    activeCollectionId = null
  } else {
    activeCollectionId = collectionId
  }

  updateCollectionUI()
  filterAndRender()
}

function updateCollectionUI() {
  const cards = collectionsGrid.querySelectorAll(".card")
  cards.forEach((card, idx) => {
    const colId = featuredData.collections[idx].id
    if (colId === activeCollectionId) {
      card.style.borderColor = "#238636"
      // Reset others
    } else {
      card.style.borderColor = "#30363d"
    }
  })
}

// --- Filtering Logic (Replicates query.mjs) ---

function filterAndRender() {
  const query = searchInput.value.toLowerCase().trim()
  const activeBundles = Array.from(
    document.querySelectorAll('input[name="bundle"]:checked')
  ).map(cb => cb.value)
  const activeTags = Array.from(
    document.querySelectorAll('input[name="tag"]:checked')
  ).map(cb => cb.value)

  // Collection Filter Logic
  let collectionToolIds = null
  if (activeCollectionId) {
    const col = featuredData.collections.find(c => c.id === activeCollectionId)
    if (col) collectionToolIds = col.tools
  }

  filtered = registry.filter(item => {
    // Collection Filter
    if (collectionToolIds && !collectionToolIds.includes(item.id)) return false

    // Bundle Filter
    if (activeBundles.length > 0) {
      const intersection = (item.bundle_membership || []).filter(b =>
        activeBundles.includes(b)
      )
      if (intersection.length === 0) return false
    }

    // Tag Filter
    if (activeTags.length > 0) {
      const intersection = (item.tags || []).filter(t => activeTags.includes(t))
      if (intersection.length === 0) return false
    }

    // Keyword Search
    if (query) {
      const text =
        `${item.id} ${item.name} ${item.description} ${(item.keywords || []).join(" ")}`.toLowerCase()
      return text.includes(query)
    }

    return true
  })

  renderResults()
}

// --- Rendering ---

function createToolCard(tool, isFeatured = false) {
  const card = document.createElement("div")
  card.className = "card"
  if (isFeatured) {
    card.style.borderColor = "#58a6ff"
    card.style.borderWidth = "1px" // Keep it subtle
  }
  card.onclick = () => openModal(tool)

  // Bundle badging
  const bundles = (tool.bundle_membership || [])
    .map(b => `<span class="bundle-badge">${b}</span>`)
    .join(" ")

  // Tags
  const tags = (tool.tags || [])
    .slice(0, 3)
    .map(t => `<span class="tag">${t}</span>`)
    .join("")

  const featuredBadge = isFeatured
    ? `<span style="background:#58a6ff; color:white; padding:2px 6px; border-radius:4px; font-size:0.75em; margin-right:5px; font-weight:bold; vertical-align:middle;">FEATURED</span>`
    : ""

  card.innerHTML = `
            ${bundles}
            <h2>${featuredBadge}${tool.name}</h2>
            <div style="font-size: 0.8em; color: #666; margin-bottom: 5px;">${tool.id}</div>
            <p>${tool.description || "No description provided."}</p>
            <div class="tags">${tags}</div>
        `
  return card
}

function renderResults() {
  resultsHeader.textContent = activeCollectionId
    ? `Collection: ${featuredData.collections.find(c => c.id === activeCollectionId).name} (${filtered.length} tools)`
    : `Found ${filtered.length} tools`

  resultsContainer.innerHTML = ""

  filtered.forEach(tool => {
    // Check if tool is featured to add badge - only if not already in featured section?
    // Actually consistent branding is good.
    const isFeatured = featuredData.featured.includes(tool.id)
    const card = createToolCard(tool, isFeatured)
    resultsContainer.appendChild(card)
  })
}

function renderFacets() {
  // 1. Bundles
  const bundles = new Set()
  registry.forEach(r =>
    (r.bundle_membership || []).forEach(b => bundles.add(b))
  )

  Array.from(bundles)
    .sort()
    .forEach(b => {
      const label = document.createElement("label")
      label.innerHTML = `
            <input type="checkbox" name="bundle" value="${b}" onchange="filterAndRender()">
            ${b}
        `
      bundleFilters.appendChild(label)
    })

  // 2. Top Tags
  const tagCounts = {}
  registry.forEach(r =>
    (r.tags || []).forEach(t => (tagCounts[t] = (tagCounts[t] || 0) + 1))
  )

  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1]) // Descending
    .slice(0, 8) // Top 8
    .forEach(([tag, count]) => {
      const label = document.createElement("label")
      label.innerHTML = `
                <input type="checkbox" name="tag" value="${tag}" onchange="filterAndRender()">
                ${tag} <span style="color:#666; font-size: 0.8em">(${count})</span>
            `
      tagFilters.appendChild(label)
    })
}

// --- Modal / Detail View ---

function openModal(tool) {
  window.location.hash = `tool/${tool.id}`

  const bundles = (tool.bundle_membership || [])
    .map(b => `<span class="bundle-badge">${b}</span>`)
    .join(" ")
  const tags = (tool.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join(" ")

  modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" height="60" style="margin-bottom: 10px;">
            <h1>${tool.name}</h1>
            <code style="font-size: 1.2em">${tool.id}</code>
        </div>
        
        <div style="margin-bottom: 20px; text-align: center;">
            ${bundles}
        </div>

        <h3>Description</h3>
        <p>${tool.description}</p>

        <h3>Tags</h3>
        <div class="tags" style="margin-bottom: 20px;">${tags}</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
            <a href="https://github.com/search?q=${tool.id}" target="_blank" 
               style="background: #238636; color: white; padding: 10px; text-align: center; border-radius: 6px; text-decoration: none;">
               Find Source (GitHub)
            </a>
             <button onclick="navigator.clipboard.writeText('npx @mcptoolshop/mcpt install ${tool.id}'); alert('Copied!')"
               style="background: #1f6feb; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer;">
               Copy Install Command
            </button>
        </div>
    `

  modal.style.display = "flex"
}

function closeModal() {
  modal.style.display = "none"
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search
  )
}

// --- Routing ---

function handleRouting() {
  const hash = window.location.hash
  if (hash.startsWith("#tool/")) {
    const id = hash.replace("#tool/", "")
    const tool = registry.find(t => t.id === id)
    if (tool) openModal(tool)
  }
}

// --- Event Listeners ---

searchInput.addEventListener("input", filterAndRender)
document.querySelector(".close-btn").addEventListener("click", closeModal)
window.onclick = function (event) {
  if (event.target == modal) closeModal()
}

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.key === "/") {
    e.preventDefault()
    searchInput.focus()
  }
  if (e.key === "Escape") {
    closeModal()
  }
})

init()
