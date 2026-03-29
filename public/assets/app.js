const productGrid = document.getElementById('productGrid')
const categoryFilters = document.getElementById('categoryFilters')

const categories = ['All', 'Cookies', 'Brownies', 'Savory', 'Drink']

const products = [
  {
    id: 1,
    name: 'Croissant Classic',
    category: 'Pastry',
    desc: 'Buttery, flaky croissant made fresh daily.',
    img: 'https://images.unsplash.com/photo-1604917877938-0b6e2f5e0df3?auto=format&fit=crop&w=800&q=60',
    price: 'Rp20.000',
  },
  {
    id: 2,
    name: 'Chocolate Danish',
    category: 'Pastry',
    desc: 'Filled with rich chocolate and almond crumble.',
    img: 'https://images.unsplash.com/photo-1548365328-9b96b5b1f4e1?auto=format&fit=crop&w=800&q=60',
    price: 'Rp25.000',
  },
  {
    id: 3,
    name: 'Matcha Roll',
    category: 'Pastry',
    desc: 'Soft roll with matcha cream.',
    img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=60',
    price: 'Rp22.000',
  },
  {
    id: 4,
    name: 'Blueberry Tart',
    category: 'Pastry',
    desc: 'Fresh blueberries with custard in crisp shell.',
    img: 'https://images.unsplash.com/photo-1563805042-7684f0b0d3a0?auto=format&fit=crop&w=800&q=60',
    price: 'Rp28.000',
  },
  {
    id: 5,
    name: 'Cinnamon Bun',
    category: 'Pastry',
    desc: 'Warm cinnamon filling with glaze.',
    img: 'https://images.unsplash.com/photo-1604908176820-8a3b6d0d8a9b?auto=format&fit=crop&w=800&q=60',
    price: 'Rp18.000',
  },
  {
    id: 6,
    name: 'Lemon Tart',
    category: 'Pastry',
    desc: 'Tangy lemon curd with buttery crust.',
    img: 'https://images.unsplash.com/photo-1547592180-3bdc2b3bdebb?auto=format&fit=crop&w=800&q=60',
    price: 'Rp26.000',
  },
  // Cookies
  {
    id: 101,
    name: 'Choco Chip Cookie',
    category: 'Cookies',
    desc: 'Chewy cookie loaded with chocolate chips.',
    img: 'https://images.unsplash.com/photo-1600180758890-4e1a15f4c9aa?auto=format&fit=crop&w=800&q=60',
    price: 'Rp8.000',
  },
  {
    id: 102,
    name: 'Oatmeal Raisin',
    category: 'Cookies',
    desc: 'Wholesome oats with plump raisins.',
    img: 'https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=800&q=60',
    price: 'Rp7.000',
  },
  // Brownies
  {
    id: 201,
    name: 'Classic Brownie',
    category: 'Brownies',
    desc: 'Dense fudgy brownie with crackly top.',
    img: 'https://images.unsplash.com/photo-1563805042-7684f0b0d3a0?auto=format&fit=crop&w=800&q=60',
    price: 'Rp15.000',
  },
  {
    id: 202,
    name: 'Walnut Brownie',
    category: 'Brownies',
    desc: 'Brownie studded with crunchy walnuts.',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=60',
    price: 'Rp17.000',
  },
  // Savory
  {
    id: 301,
    name: 'Quiche Lorraine',
    category: 'Savory',
    desc: 'Classic quiche with bacon and cheese.',
    img: 'https://images.unsplash.com/photo-1604908176820-8a3b6d0d8a9b?auto=format&fit=crop&w=800&q=60',
    price: 'Rp30.000',
  },
  {
    id: 302,
    name: 'Cheese Twist',
    category: 'Savory',
    desc: 'Flaky twist with cheddar filling.',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60',
    price: 'Rp12.000',
  },
  // Drink
  {
    id: 401,
    name: 'Iced Latte',
    category: 'Drink',
    desc: 'Smooth espresso over chilled milk.',
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=60',
    price: 'Rp20.000',
  },
  {
    id: 402,
    name: 'Herbal Tea',
    category: 'Drink',
    desc: 'Relaxing blend of herbs.',
    img: 'https://images.unsplash.com/photo-1504691342899-9a8d1a0b2dcf?auto=format&fit=crop&w=800&q=60',
    price: 'Rp12.000',
  },
]

function render(list = products) {
  productGrid.innerHTML = ''
  list.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <p style="margin-top:8px;font-weight:700">${p.price}</p>
    `
    productGrid.appendChild(card)
    // stagger reveal animation
    setTimeout(() => card.classList.add('visible'), 80 * i)
  })
}

function renderFilters() {
  categoryFilters.innerHTML = ''
  categories.forEach((cat) => {
    const btn = document.createElement('button')
    btn.className = 'btn-filter'
    btn.textContent = cat
    btn.onclick = () => {
      if (cat === 'All') return render(products)
      render(products.filter((p) => p.category === cat))
    }
    categoryFilters.appendChild(btn)
  })
}

// Contact links placeholders
const waLink = document.getElementById('waLink')
const igLink = document.getElementById('igLink')
const ttLink = document.getElementById('ttLink')
waLink.href = 'https://wa.me/6287770084807'
igLink.href = 'https://instagram.com/bechalof.id'
ttLink.href = 'https://tiktok.com/@bechalofid'

// Address link - opens Google Maps (placeholder address)
const addrLink = document.getElementById('addrLink')
const mapsQuery = encodeURIComponent('Jl. Melati No. 10, Jakarta Selatan')
addrLink.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
addrLink.target = '_blank'
addrLink.rel = 'noopener'

// reveal hero on load
window.addEventListener('load', () => {
  document.querySelector('.hero .container').classList.add('visible')
})

renderFilters()
render()
