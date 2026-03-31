// ── Bechalof App.js – Modern Redesign ──

const productGrid = document.getElementById('productGrid')
const categoryFilters = document.getElementById('categoryFilters')

window._siteConfig = {}
window._products = []

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' })
    if (!res.ok) throw new Error('Fetch failed ' + res.status)
    return await res.json()
  } catch (e) {
    console.error('loadJSON', path, e.message)
    return null
  }
}

function deriveCategories(products) {
  const set = new Set(products.map(p => p.category || 'Lainnya'))
  return ['Semua', ...Array.from(set)]
}

function render(list) {
  productGrid.innerHTML = ''
  list.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy"/>
        <span class="card-badge">${p.category}</span>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
      </div>
      <div class="card-footer">
        <span class="card-price">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
        <button class="btn-add add-to-cart" data-id="${p.id}" title="Tambah ke keranjang">+</button>
      </div>
    `
    card.querySelector('.card-img-wrap').addEventListener('click', () => showProductModal(p.id))
    card.querySelector('.card-body').addEventListener('click', () => showProductModal(p.id))
    productGrid.appendChild(card)
    setTimeout(() => card.classList.add('visible'), 60 * i)
  })
  document.querySelectorAll('.add-to-cart').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation()
      addToCart(Number(e.currentTarget.dataset.id))
      animateAdd(e.currentTarget)
    })
  })
}

function animateAdd(btn) {
  btn.textContent = '✓'
  btn.style.background = 'var(--gold)'
  btn.style.color = 'var(--brown)'
  setTimeout(() => {
    btn.textContent = '+'
    btn.style.background = ''
    btn.style.color = ''
  }, 800)
}

let activeFilter = 'Semua'

function renderFilters(categories) {
  categoryFilters.innerHTML = ''
  categories.forEach((cat) => {
    const btn = document.createElement('button')
    btn.className = 'btn-filter' + (cat === activeFilter ? ' active' : '')
    btn.textContent = cat
    btn.addEventListener('click', () => {
      activeFilter = cat
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      if (cat === 'Semua') render(window._products)
      else render(window._products.filter(p => p.category === cat))
    })
    categoryFilters.appendChild(btn)
  })
}

// ── Sticky navbar ──
const header = document.getElementById('siteHeader')
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) header.classList.add('scrolled')
  else header.classList.remove('scrolled')
}, { passive: true })

// ── Hero BG lazy load ──
const heroBg = document.getElementById('heroBg')
if (heroBg) {
  const img = new Image()
  img.src = heroBg.style.backgroundImage
    ? heroBg.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1')
    : 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1800&q=70'
  img.onload = () => heroBg.classList.add('loaded')
}

// ── Scroll reveal ──
function setupReveal() {
  const els = document.querySelectorAll('.reveal')
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  els.forEach(el => obs.observe(el))
}

// ── Contact link wiring ──
function wireContacts(cfg) {
  const wa = document.getElementById('waLink')
  const waCta = document.getElementById('waCtaLink')
  const ig = document.getElementById('igLink')
  const tt = document.getElementById('ttLink')
  const waText = document.getElementById('waText')
  const igText = document.getElementById('igText')
  const ttText = document.getElementById('ttText')
  const addr = document.getElementById('addrLink')

  if (cfg.whatsapp) {
    const waNum = cfg.whatsapp.replace(/\D/g, '')
    if (wa) wa.href = `https://wa.me/${waNum}?text=Halo%20Bechalof%2C%20saya%20mau%20order!`
    if (waCta) waCta.href = `https://wa.me/${waNum}?text=Halo%20Bechalof%2C%20saya%20mau%20custom%20order!`
    if (waText) waText.textContent = cfg.whatsapp
  }
  if (cfg.instagram) {
    if (ig) ig.href = 'https://instagram.com/' + cfg.instagram.replace('@', '')
    if (igText) igText.textContent = cfg.instagram.startsWith('@') ? cfg.instagram : '@' + cfg.instagram
  }
  if (cfg.tiktok) {
    if (tt) tt.href = 'https://tiktok.com/@' + cfg.tiktok.replace('@', '')
    if (ttText) ttText.textContent = cfg.tiktok.startsWith('@') ? cfg.tiktok : '@' + cfg.tiktok
  }
  if (cfg.address && addr) {
    addr.href = 'https://maps.google.com/?q=' + encodeURIComponent(cfg.address)
    const addrVal = addr.querySelector('.contact-value')
    if (addrVal) addrVal.textContent = cfg.address
  }
}

// ── Cart section toggle ──
function toggleCartSection() {
  const section = document.getElementById('cartSection')
  if (!section) return
  const cart = JSON.parse(localStorage.getItem('bechalof_cart_v1') || '[]')
  if (cart.length > 0) section.classList.add('has-items')
  else section.classList.remove('has-items')
}

// ── Checkout via WhatsApp ──
function buildWhatsappOrder() {
  const cart = JSON.parse(localStorage.getItem('bechalof_cart_v1') || '[]')
  if (!cart.length) return
  const cfg = window._siteConfig || {}
  const waNum = (cfg.whatsapp || '').replace(/\D/g, '')
  if (!waNum) return

  let msg = 'Halo Bechalof! Saya mau order:\n\n'
  let total = 0
  cart.forEach(item => {
    const product = window._products.find(p => p.id === item.id)
    if (!product) return
    const subtotal = Number(product.price) * item.qty
    total += subtotal
    msg += `• ${product.name} x${item.qty} = Rp ${subtotal.toLocaleString('id-ID')}\n`
  })
  msg += `\n*Total: Rp ${total.toLocaleString('id-ID')}*`

  const notes = document.getElementById('orderNotes')
  if (notes && notes.value.trim()) msg += `\n\nCatatan: ${notes.value.trim()}`

  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank')
}

// ── Product Modal ──
function showProductModal(id) {
  const p = window._products.find(x => x.id === id)
  if (!p) return
  const modal = document.getElementById('productModal')
  const content = document.getElementById('modalContent')
  content.innerHTML = `
    <img src="${p.image_url}" alt="${p.name}" loading="lazy"/>
    <div class="modal-body">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="modal-price">Rp ${Number(p.price).toLocaleString('id-ID')}</div>
      <div class="modal-actions">
        <button class="btn btn-dark modal-add-btn" data-id="${p.id}">+ Tambah ke Keranjang</button>
        <button class="btn btn-outline-dark" id="modalCloseInner">Tutup</button>
      </div>
    </div>
  `
  modal.querySelector('.modal-add-btn').addEventListener('click', (e) => {
    addToCart(Number(e.currentTarget.dataset.id))
    animateAdd(e.currentTarget)
  })
  document.getElementById('modalCloseInner').addEventListener('click', hideProductModal)
  modal.classList.add('show')
  document.body.style.overflow = 'hidden'
}

function hideProductModal() {
  const modal = document.getElementById('productModal')
  if (modal) modal.classList.remove('show')
  document.body.style.overflow = ''
}

// ── Inject UI helpers ──
function injectUIHelpers() {
  // Floating cart
  if (!document.getElementById('floatingCart')) {
    const fc = document.createElement('div')
    fc.id = 'floatingCart'
    fc.innerHTML = `<div class="cart-icon">🛒</div><div class="floating-badge" id="floatingBadge">0</div>`
    fc.addEventListener('click', () => {
      const cartSec = document.getElementById('cartSection')
      if (cartSec && cartSec.classList.contains('has-items')) {
        cartSec.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' })
      }
    })
    document.body.appendChild(fc)
  }

  // Modal
  if (!document.getElementById('productModal')) {
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.id = 'productModal'
    modal.innerHTML = `<div class="panel"><button class="close" id="modalClose">×</button><div id="modalContent"></div></div>`
    document.body.appendChild(modal)
    document.getElementById('modalClose').addEventListener('click', hideProductModal)
    modal.addEventListener('click', (e) => { if (e.target === modal) hideProductModal() })
  }

  updateFloatingBadge()
}

function updateFloatingBadge() {
  const cart = JSON.parse(localStorage.getItem('bechalof_cart_v1') || '[]')
  const total = cart.reduce((s, c) => s + c.qty, 0)
  const b = document.getElementById('floatingBadge')
  if (b) b.textContent = total
}

// ── Cart button wiring ──
function wireCartButtons() {
  const clearBtn = document.getElementById('clearCartBtn')
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (confirm('Kosongkan keranjang?')) clearCart()
  })

  const checkoutBtn = document.getElementById('checkoutBtn')
  if (checkoutBtn) checkoutBtn.addEventListener('click', buildWhatsappOrder)
}

// ── Init ──
async function init() {
  const cfg = await loadJSON('/content/config.json')
  if (cfg) {
    window._siteConfig = cfg
    wireContacts(cfg)
  }

  const products = await loadJSON('/content/products.json')
  if (products && Array.isArray(products)) {
    window._products = products.map(p => ({
      id: Number(p.id),
      name: p.name,
      category: p.category || 'Lainnya',
      price: p.price,
      image_url: p.image_url,
      description: p.description
    }))
  }

  const categories = deriveCategories(window._products)
  renderFilters(categories)
  render(window._products)

  injectUIHelpers()
  wireCartButtons()
  setupReveal()

  // Re-render cart AFTER products loaded so item names resolve correctly
  renderCart()
  toggleCartSection()
}

window.addEventListener('load', init)
