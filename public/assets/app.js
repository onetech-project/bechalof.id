const productGrid = document.getElementById('productGrid');

const products = [
  {id:1,name:'Croissant Classic',desc:'Buttery, flaky croissant made fresh daily.',img:'https://images.unsplash.com/photo-1604917877938-0b6e2f5e0df3?auto=format&fit=crop&w=800&q=60',price:'Rp20.000'},
  {id:2,name:'Chocolate Danish',desc:'Filled with rich chocolate and almond crumble.',img:'https://images.unsplash.com/photo-1548365328-9b96b5b1f4e1?auto=format&fit=crop&w=800&q=60',price:'Rp25.000'},
  {id:3,name:'Matcha Roll',desc:'Soft roll with matcha cream.',img:'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=60',price:'Rp22.000'},
  {id:4,name:'Blueberry Tart',desc:'Fresh blueberries with custard in crisp shell.',img:'https://images.unsplash.com/photo-1563805042-7684f0b0d3a0?auto=format&fit=crop&w=800&q=60',price:'Rp28.000'},
  {id:5,name:'Cinnamon Bun',desc:'Warm cinnamon filling with glaze.',img:'https://images.unsplash.com/photo-1604908176820-8a3b6d0d8a9b?auto=format&fit=crop&w=800&q=60',price:'Rp18.000'},
  {id:6,name:'Lemon Tart',desc:'Tangy lemon curd with buttery crust.',img:'https://images.unsplash.com/photo-1547592180-3bdc2b3bdebb?auto=format&fit=crop&w=800&q=60',price:'Rp26.000'}
];

function render(){
  productGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <p style="margin-top:8px;font-weight:700">${p.price}</p>
    `;
    productGrid.appendChild(card);
  });
}

// Contact links placeholders
const waLink = document.getElementById('waLink');
const igLink = document.getElementById('igLink');
const ttLink = document.getElementById('ttLink');
waLink.href = 'https://wa.me/6287770084807';
igLink.href = 'https://instagram.com/bechalofid';
ttLink.href = 'https://tiktok.com/@bechalofid';

// Address link - opens Google Maps (placeholder address)
const addrLink = document.getElementById('addrLink');
const mapsQuery = encodeURIComponent('Jl. Melati No. 10, Jakarta Selatan');
addrLink.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
addrLink.target = '_blank';
addrLink.rel = 'noopener';

render();
