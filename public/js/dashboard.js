// ================== কমন হেল্পার ==================
const API = '/api';
const getToken = () => localStorage.getItem('pibery_token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'অজানা ত্রুটি হয়েছে');
  return data;
}

// ================== ড্যাশবোর্ড (Builder Panel) ==================
if (document.querySelector('.dash-layout')) {
  const tabs = document.querySelectorAll('.side-nav a');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  const getShopId = () => document.getElementById('shopId').value.trim();

  window.loadDashboard = async () => {
    const shopId = getShopId();
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    try {
      const { stats } = await apiFetch(`${API}/business/${shopId}/dashboard`);
      document.getElementById('stat-revenue').textContent = `৳${stats.totalRevenue}`;
      document.getElementById('stat-orders').textContent = stats.totalOrders;
      document.getElementById('stat-customers').textContent = stats.totalCustomers;
      document.getElementById('stat-pending').textContent = stats.pendingOrders;
      loadProducts();
      loadOrders();
      loadCustomers();
      loadCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- ক্যানভাস বিল্ডার ----------
  let canvasSections = [];
  window.addSection = (type) => {
    canvasSections.push({ type, order: canvasSections.length, content: {} });
    renderCanvas();
  };
  function renderCanvas() {
    const el = document.getElementById('canvas-preview');
    el.innerHTML = canvasSections
      .map((s, i) => `<div class="canvas-block">#${i + 1} — ${s.type}</div>`)
      .join('');
  }
  window.saveCanvas = async () => {
    const shopId = getShopId();
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    try {
      await apiFetch(`${API}/shops/${shopId}`, {
        method: 'PUT',
        body: JSON.stringify({ sections: canvasSections }),
      });
      alert('ক্যানভাস সেভ হয়েছে ✅');
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- প্রোডাক্ট ----------
  async function loadProducts() {
    const shopId = getShopId();
    const { products } = await apiFetch(`${API}/products/shop/${shopId}`);
    const tbody = document.querySelector('#product-table tbody');
    tbody.innerHTML = products
      .map(
        (p) => `<tr>
          <td>${p.name}</td><td>৳${p.price}</td><td>${p.stock}</td><td>${p.category}</td>
          <td><button class="btn" onclick="deleteProduct('${p._id}')">ডিলিট</button></td>
        </tr>`
      )
      .join('');
  }

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopId = getShopId();
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    const fd = new FormData(e.target);
    try {
      await apiFetch(`${API}/products`, {
        method: 'POST',
        body: JSON.stringify({
          shop: shopId,
          name: fd.get('name'),
          price: Number(fd.get('price')),
          stock: Number(fd.get('stock')),
          category: fd.get('category') || 'General',
        }),
      });
      e.target.reset();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  });

  window.deleteProduct = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    await apiFetch(`${API}/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  // ---------- অর্ডার ----------
  async function loadOrders() {
    const shopId = getShopId();
    const { orders } = await apiFetch(`${API}/business/${shopId}/orders`);
    const tbody = document.querySelector('#order-table tbody');
    tbody.innerHTML = orders
      .map(
        (o) => `<tr>
          <td>${o._id}</td><td>৳${o.total}</td><td>${o.status}</td>
          <td>
            <select onchange="updateOrderStatus('${o._id}', this.value)">
              ${['pending', 'processing', 'shipped', 'completed', 'cancelled']
                .map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </td>
        </tr>`
      )
      .join('');
  }
  window.updateOrderStatus = async (orderId, status) => {
    await apiFetch(`${API}/business/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note: `স্ট্যাটাস পরিবর্তন করা হয়েছে: ${status}` }),
    });
    loadOrders();
  };

  // ---------- কাস্টমার ----------
  async function loadCustomers() {
    const shopId = getShopId();
    const { customers } = await apiFetch(`${API}/business/${shopId}/customers`);
    const tbody = document.querySelector('#customer-table tbody');
    tbody.innerHTML = customers
      .map((c) => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.totalOrders}</td><td>${c.loyaltyPoints}</td></tr>`)
      .join('');
  }

  // ---------- মার্কেটিং ----------
  async function loadCoupons() {
    const shopId = getShopId();
    const { marketing } = await apiFetch(`${API}/business/${shopId}/marketing`);
    const tbody = document.querySelector('#coupon-table tbody');
    tbody.innerHTML = marketing
      .map(
        (m) => `<tr><td>${m.code}</td><td>${m.title}</td><td>${m.discountValue}${m.discountType === 'percentage' ? '%' : '৳'}</td><td>${m.usedCount}</td></tr>`
      )
      .join('');
  }
  document.getElementById('coupon-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopId = getShopId();
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    const fd = new FormData(e.target);
    try {
      await apiFetch(`${API}/business/${shopId}/marketing`, {
        method: 'POST',
        body: JSON.stringify({
          code: fd.get('code'),
          title: fd.get('title'),
          discountType: fd.get('discountType'),
          discountValue: Number(fd.get('discountValue')),
        }),
      });
      e.target.reset();
      loadCoupons();
    } catch (err) {
      alert(err.message);
    }
  });

  // ---------- থিম ----------
  window.saveTheme = async () => {
    const shopId = getShopId();
    const color = document.getElementById('theme-color').value;
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    try {
      await apiFetch(`${API}/shops/${shopId}`, {
        method: 'PUT',
        body: JSON.stringify({ theme: { primaryColor: color, mode: document.body.classList.contains('dark') ? 'dark' : 'light' } }),
      });
      alert('থিম সেভ হয়েছে ✅');
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- এক্সপোর্ট (সিমুলেটর) ----------
  window.exportProject = async () => {
    const shopId = getShopId();
    if (!shopId) return alert('প্রথমে শপ আইডি দিন');
    try {
      const { shop } = await apiFetch(`${API}/shops/${shopId}`);
      document.getElementById('export-output').textContent = JSON.stringify(shop, null, 2);
    } catch (err) {
      alert(err.message);
    }
  };
}

// ================== স্টোরফ্রন্ট (Customer Shop) ==================
if (document.getElementById('product-grid')) {
  let currentShop = null;
  let cart = [];

  async function initStorefront() {
    try {
      const { shop } = await apiFetch(`${API}/shops/subdomain/${window.PIBERY_SHOP_SUBDOMAIN}`);
      currentShop = shop;
      document.getElementById('shop-name').textContent = shop.name;
      loadStoreProducts();
    } catch (err) {
      document.getElementById('shop-name').textContent = 'দোকান খুঁজে পাওয়া যায়নি';
    }
  }

  async function loadStoreProducts(search = '') {
    if (!currentShop) return;
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const { products } = await apiFetch(`${API}/products/storefront/${currentShop._id}${qs}`);
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products
      .map(
        (p) => `<div class="product-card">
          <img src="${p.images?.[0] || 'https://placehold.co/300x200'}" alt="${p.name}" />
          <div class="info">
            <h4>${p.name}</h4>
            <div class="price">৳${p.price}</div>
            <button class="btn btn-primary" onclick='addToCart(${JSON.stringify({ id: p._id, name: p.name, price: p.price })})'>কার্টে যোগ করুন</button>
          </div>
        </div>`
      )
      .join('');
  }

  document.getElementById('search-box').addEventListener('input', (e) => loadStoreProducts(e.target.value));

  window.addToCart = (product) => {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
  };

  function renderCart() {
    document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('cart-items').innerHTML = cart
      .map((i) => `<div>${i.name} × ${i.quantity} — ৳${i.price * i.quantity}</div>`)
      .join('');
    document.getElementById('cart-total').textContent = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('hidden');

  window.submitCheckout = async () => {
    if (!currentShop || cart.length === 0) return alert('কার্ট খালি রয়েছে');
    try {
      const { order } = await apiFetch(`${API}/store/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          shopId: currentShop._id,
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
          guestInfo: {
            name: document.getElementById('guest-name').value,
            email: document.getElementById('guest-email').value,
            phone: document.getElementById('guest-phone').value,
          },
          couponCode: document.getElementById('coupon-code').value,
          paymentMethod: 'cod',
        }),
      });
      alert(`অর্ডার সফল হয়েছে ✅ অর্ডার আইডি: ${order._id}`);
      cart = [];
      renderCart();
      toggleCart();
    } catch (err) {
      alert(err.message);
    }
  };

  initStorefront();
}
 