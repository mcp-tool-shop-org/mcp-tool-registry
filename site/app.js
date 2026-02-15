// site/app.js

/**
 * MCP Tool Registry Explorer
 *
 * Fetches JSON artifacts from ../dist/ and renders them.
 * No backend required.
 */

const INDEX_URL = "../dist/registry.index.json"
const META_URL = "../dist/derived.meta.json"
const LOGO_URL = "../mcp-tool-registry_logo.png"

let registry = []
let filtered = []

const searchInput = document.getElementById("search")
const resultsContainer = document.getElementById("results")
const resultsHeader = document.getElementById("results-header")
const bundleFilters = document.getElementById("bundle-filters")
const tagFilters = document.getElementById("tag-filters")
const modal = document.getElementById("modal")
const modalBody = document.getElementById("modal-body")

// --- Init ---

async function init() {
  try {
    const [indexRes, metaRes] = await Promise.all([
      fetch(INDEX_URL),
      fetch(META_URL)
    ])

    if (!indexRes.ok) throw new Error("Failed to load registry index")

    registry = await indexRes.json()
    const meta = await metaRes.json()

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

// --- Filtering Logic (Replicates query.mjs) ---

function filterAndRender() {
  const query = searchInput.value.toLowerCase().trim()
  const activeBundles = Array.from(
    document.querySelectorAll('input[name="bundle"]:checked')
  ).map(cb => cb.value)
  const activeTags = Array.from(
    document.querySelectorAll('input[name="tag"]:checked')
  ).map(cb => cb.value)

  filtered = registry.filter(item => {
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

function renderResults() {
  resultsHeader.textContent = `Found ${filtered.length} tools`
  resultsContainer.innerHTML = ""

  filtered.forEach(tool => {
    const card = document.createElement("div")
    card.className = "card"
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

    card.innerHTML = `
            ${bundles}
            <h2>${tool.name}</h2>
            <div style="font-size: 0.8em; color: #666; margin-bottom: 5px;">${tool.id}</div>
            <p>${tool.description || "No description provided."}</p>
            <div class="tags">${tags}</div>
        `
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

  // In a real app we might fetch more details from registry.json if index is slim,
  // but our index is quite rich.

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
             <button onclick="navigator.clipboard.writeText('npx @mcptoolshop/cli install ${tool.id}'); alert('Copied!')"
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
