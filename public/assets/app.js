// Dynamic content loader for Bechalof
const productGrid = document.getElementById('productGrid')
const categoryFilters = document.getElementById('categoryFilters')

window._siteConfig = {}
window._products = []

async function loadJSON(path){
  try{
    const res = await fetch(path, { cache: 'no-store' })
    if(!res.ok) throw new Error('Fetch failed '+res.status)
    return await res.json()
  }catch(e){
    console.error('loadJSON', path, e.message)
    return null
  }
}

function deriveCategories(products){
  const set = new Set(products.map(p=>p.category || 'Uncategorized'))
  return ['All', ...Array.from(set)]
}

function render(list){
  productGrid.innerHTML = ''
  list.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p style="margin-top:8px;font-weight:700">Rp ${Number(p.price).toLocaleString()}</p>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn add-to-cart" data-id="${p.id}">Add to cart</button>
        <button class="btn btn-outline view-detail" data-id="${p.id}">View</button>
      </div>
    `
    productGrid.appendChild(card)
    setTimeout(() => card.classList.add('visible'), 80 * i)
  })
  // wire add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(b=> b.onclick = (e)=>{ const id = Number(e.currentTarget.dataset.id); addToCart(id) })
}

function renderFilters(categories){
  categoryFilters.innerHTML = ''
  categories.forEach((cat) => {
    const btn = document.createElement('button')
    btn.className = 'btn-filter'
    btn.textContent = cat
    btn.onclick = () => {
      if (cat === 'All') return render(window._products)
      render(window._products.filter((p) => p.category === cat))
    }
    categoryFilters.appendChild(btn)
  })
}

async function init(){
  // load config and products
  const cfg = await loadJSON('/content/config.json')
  if(cfg) {
    window._siteConfig = cfg
    // wire contact links if present
    const wa = document.getElementById('waLink')
    const ig = document.getElementById('igLink')
    const tt = document.getElementById('ttLink')
    if(wa && cfg.whatsapp) wa.href = 'https://wa.me/' + cfg.whatsapp
    if(ig && cfg.instagram) ig.href = 'https://instagram.com/' + cfg.instagram
    if(tt && cfg.tiktok) tt.href = 'https://tiktok.com/@' + cfg.tiktok
  }

  const products = await loadJSON('/content/products.json')
  if(products && Array.isArray(products)){
    window._products = products.map(p => ({
      id: Number(p.id),
      name: p.name,
      category: p.category || 'Uncategorized',
      price: p.price,
      image_url: p.image_url,
      description: p.description
    }))
  }

  const categories = deriveCategories(window._products)
  renderFilters(categories)
  render(window._products)

  // expose product list for cart.js
  window._products = window._products
  window._siteConfig = window._siteConfig || {}

  // wire clear cart button
  const clearBtn = document.getElementById('clearCartBtn')
  if(clearBtn) clearBtn.onclick = ()=>{ if(confirm('Clear cart?')) { clearCart() } }
}

window.addEventListener('load', ()=>{ init() })
