// ── Bechalof Cart.js – Modern Redesign ──

const CART_KEY = 'bechalof_cart_v1'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch (e) { return [] }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

function addToCart(itemId) {
  const cart = loadCart()
  const existing = cart.find(c => c.id === itemId)
  if (existing) existing.qty += 1
  else cart.push({ id: itemId, qty: 1 })
  saveCart(cart)
  renderCart()
  if (typeof updateFloatingBadge === 'function') updateFloatingBadge()
  if (typeof toggleCartSection === 'function') toggleCartSection()
}

function updateQty(itemId, qty) {
  const cart = loadCart()
  const it = cart.find(c => c.id === itemId)
  if (!it) return
  it.qty = qty
  if (it.qty <= 0) { const idx = cart.findIndex(c => c.id === itemId); cart.splice(idx, 1) }
  saveCart(cart)
  renderCart()
  if (typeof updateFloatingBadge === 'function') updateFloatingBadge()
  if (typeof toggleCartSection === 'function') toggleCartSection()
}

function clearCart() {
  localStorage.removeItem(CART_KEY)
  renderCart()
  if (typeof updateFloatingBadge === 'function') updateFloatingBadge()
  if (typeof toggleCartSection === 'function') toggleCartSection()
}

function renderCart() {
  const cart = loadCart()
  const el = document.getElementById('cart')
  if (!el) return

  if (cart.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:8px 0">Keranjang kamu masih kosong 🥐</p>'
    return
  }

  let total = 0
  let html = '<h3>Keranjang Belanja 🛒</h3><ul>'
  cart.forEach(ci => {
    const p = window._products ? window._products.find(x => x.id === ci.id) : null
    if (!p) return
    const subtotal = Number(p.price) * ci.qty
    total += subtotal
    html += `
      <li>
        <div class="item-left">
          <strong>${p.name}</strong>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">Rp ${Number(p.price).toLocaleString('id-ID')}</div>
        </div>
        <div class="item-right">
          <button class="btn-qty dec" data-id="${p.id}" style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(59,42,26,.15);background:transparent;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">−</button>
          <span class="qty">${ci.qty}</span>
          <button class="btn-qty inc" data-id="${p.id}" style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(59,42,26,.15);background:transparent;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">+</button>
          <span style="min-width:96px;text-align:right;font-weight:700;font-size:14px">Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
      </li>`
  })
  html += '</ul>'
  html += `<div style="padding:16px 0 0;border-top:1px solid rgba(59,42,26,.08);margin-top:8px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:13px;color:var(--muted)">Total</span>
    <span style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--brown)">Rp ${total.toLocaleString('id-ID')}</span>
  </div>`
  html += '<textarea id="orderNotes" placeholder="Catatan (opsional)..."></textarea>'

  el.innerHTML = html

  el.querySelectorAll('.dec').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.id)
    const c = loadCart(); const it = c.find(x => x.id === id)
    if (it) updateQty(id, it.qty - 1)
  }))
  el.querySelectorAll('.inc').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.id)
    const c = loadCart(); const it = c.find(x => x.id === id)
    if (it) updateQty(id, it.qty + 1)
  }))
}

// Cart renders after products are loaded (triggered by app.js init)
