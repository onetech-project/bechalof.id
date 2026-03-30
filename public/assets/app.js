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
  // wire view detail buttons
  document.querySelectorAll('.view-detail').forEach(b=> b.onclick = (e)=>{ const id = Number(e.currentTarget.dataset.id); showProductModal(id) })
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

  // inject floating cart button and modal container
  injectUIHelpers()
}

function injectUIHelpers(){
  if(document.getElementById('floatingCart')) return
  const fc = document.createElement('div')
  fc.id = 'floatingCart'
  fc.innerHTML = `<div class="cart-icon">🛒</div><div class="floating-badge" id="floatingBadge">0</div>`
  fc.onclick = ()=>{ window.scrollTo({top:document.querySelector('.cart').offsetTop-20,behavior:'smooth'}) }
  document.body.appendChild(fc)

  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.id = 'productModal'
  modal.innerHTML = `<div class="panel"><button class="close" id="modalClose">×</button><div id="modalContent"></div></div>`
  document.body.appendChild(modal)
  document.getElementById('modalClose').onclick = ()=>{ hideProductModal() }

  // update badge initially
  updateFloatingBadge()
}

function updateFloatingBadge(){ const cart = JSON.parse(localStorage.getItem('bechalof_cart_v1')||'[]'); const total = cart.reduce((s,c)=>s+c.qty,0); const b = document.getElementById('floatingBadge'); if(b) b.textContent = total }

function showProductModal(id){ const p = window._products.find(x=>x.id===id); if(!p) return; const modal = document.getElementById('productModal'); const content = document.getElementById('modalContent'); content.innerHTML = ` <img src="${p.image_url}" alt="${p.name}"><h3>${p.name}</h3><p>${p.description}</p><p style="margin-top:8px;font-weight:700">Rp ${Number(p.price).toLocaleString()}</p><div style="margin-top:12px"><button class="btn add-to-cart" data-id="${p.id}">Add to cart</button> <button class="btn btn-outline" id="modalCloseBtn">Close</button></div>`; document.querySelectorAll('#productModal .add-to-cart').forEach(b=>b.onclick=(e)=>{ const id=Number(e.currentTarget.dataset.id); addToCart(id); indicateAdded(e.currentTarget) }); document.getElementById('modalCloseBtn').onclick = ()=> hideProductModal(); modal.classList.add('show') }

function hideProductModal(){ const modal = document.getElementById('productModal'); if(modal) modal.classList.remove('show') }

// add-to-cart hook to show feedback
function indicateAdded(btnEl){ if(!btnEl) return; btnEl.classList.add('added'); setTimeout(()=>btnEl.classList.remove('added'),700) }

window.addEventListener('load', ()=>{ init() })
