/* =====================================================
   Tienda Demo - Variante sin servidor (JSON embebido)
   -----------------------------------------------------
   Qué hace este archivo:
   - Lee el catálogo desde un <script type="application/json"> dentro del HTML.
   - Genera dinámicamente botones de categoría y tarjetas de productos.
   - Implementa búsqueda por texto y filtro por categoría.
   - Implementa un carrito básico (agregar, sumar/restar, eliminar, subtotal).
   - No usa fetch, así que funciona con file:// (sin servidor local).
   ===================================================== */
(function(){
  'use strict';

  // Esperamos a que el DOM esté listo para tocar elementos
  document.addEventListener('DOMContentLoaded', init);

  // ==== Helpers cortos ====
  function $(s,root){ return (root||document).querySelector(s); }
  function $all(s,root){ return (root||document).querySelectorAll(s); }
  const money = (n)=>{
    // Formatea números a MXN con fallback si Intl no está disponible
    try { return Number(n||0).toLocaleString('es-MX', {style:'currency', currency:'MXN'}); }
    catch { return '$' + Number(n||0).toFixed(2); }
  };

  // Estado simple de la app
  let state = {
    catalog: [],   // Lista completa de productos
    filtered: [],  // Lista filtrada que se está mostrando
    cart: [],      // Carrito [{id, name, price, qty}]
    category: 'all',
    search: ''
  };

  function init(){
    // Tomamos referencias del DOM
    const productsEl     = $('#products');
    const searchEl       = $('#search');
    const categoryNav    = $('#categoryNav');
    const cartToggleBtn  = $('#cartToggle');
    const cartPanel      = $('#cartPanel');
    const closeCartBtn   = $('#closeCart');
    const cartItemsEl    = $('#cartItems');
    const cartCountEl    = $('#cartCount');
    const cartSubtotalEl = $('#cartSubtotal');
    const checkoutBtn    = $('#checkoutBtn');

    // Validación mínima de nodos esenciales
    if(!productsEl || !categoryNav || !cartPanel || !cartItemsEl || !cartCountEl || !cartSubtotalEl){
      console.warn('[TiendaDemo] Faltan nodos esenciales.');
      return;
    }

    // --- 1) Cargar catálogo desde el script JSON embebido ---
    try{
      const raw  = $('#catalogData').textContent;  // El contenido del <script>
      const data = JSON.parse(raw);                // Lo convertimos a objeto
      state.catalog = Array.isArray(data.products) ? data.products : [];
    }catch(err){
      console.error('No se pudo leer el JSON embebido:', err);
      productsEl.innerHTML = '<p style="opacity:.8">No se pudo cargar el catálogo.</p>';
      return;
    }

    // Render inicial
    buildCategories(categoryNav, state.catalog);
    state.filtered = state.catalog.slice();  // Copia superficial
    renderProducts(productsEl, state.filtered);
    renderCart(cartItemsEl, cartCountEl, cartSubtotalEl);

    // --- 2) Búsqueda por texto ---
    if(searchEl){
      searchEl.addEventListener('input', ()=>{
        state.search = (searchEl.value||'').trim().toLowerCase();
        applyFilters(productsEl);
      });
    }

    // --- 3) Click en categorías (delegación) ---
    categoryNav.addEventListener('click', (e)=>{
      const btn = e.target && e.target.closest('.nav-btn');
      if(!btn) return;
      state.category = btn.dataset.filter || 'all';

      // Marcar como activo el botón presionado
      for(const el of $all('.nav-btn', categoryNav)) el.classList.remove('active');
      btn.classList.add('active');

      applyFilters(productsEl);
    });

    // --- 4) Agregar al carrito (delegación sobre la grilla) ---
    productsEl.addEventListener('click', (e)=>{
      const btn  = e.target && e.target.closest('.add-btn');
      if(!btn) return;
      const card = btn.closest('.card'); if(!card) return;
      const id   = card.dataset.id;

      // Buscamos el producto en el catálogo original
      const found = state.catalog.find(p=>p.id===id);
      if(found){ addToCart(found); openCart(); }
    });

    // --- 5) Panel del carrito: abrir/cerrar y accesibilidad ---
    function openCart(){
      cartPanel.classList.add('open');
      cartPanel.setAttribute('aria-hidden','false');
      if(cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded','true');
      try{ cartPanel.focus(); }catch{ /* no-op */ }
    }
    function closeCart(){
      cartPanel.classList.remove('open');
      cartPanel.setAttribute('aria-hidden','true');
      if(cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded','false');
    }
    if(cartToggleBtn) cartToggleBtn.addEventListener('click', ()=>{
      cartPanel.classList.contains('open') ? closeCart() : openCart();
    });
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && cartPanel.classList.contains('open')) closeCart();
    });

    // --- 6) Controles dentro del carrito (delegación) ---
    cartItemsEl.addEventListener('click', (e)=>{
      const btn = e.target && e.target.closest('button'); if(!btn) return;
      const id = btn.dataset.id, action = btn.dataset.action; if(!id||!action) return;

      if(action==='inc')      changeQty(id, +1);
      else if(action==='dec') changeQty(id, -1);
      else if(action==='remove') removeFromCart(id);

      renderCart(cartItemsEl, cartCountEl, cartSubtotalEl);
    });

    // --- 7) Pagar (demo: sólo alerta y limpiar) ---
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', ()=>{
        if(state.cart.length===0){ alert('Tu carrito está vacío.'); return; }
        const total = state.cart.reduce((s,it)=>s+it.price*it.qty,0);
        alert('Gracias por tu compra!\nTotal: ' + money(total));
        state.cart = [];                // vaciar carrito
        renderCart(cartItemsEl, cartCountEl, cartSubtotalEl);
        closeCart();
      });
    }

    // ====== Funciones de vista/modelo ======

    // Construye botones de categoría a partir del catálogo
    function buildCategories(container, catalog){
      // Set de categorías únicas y ordenadas
      const cats = Array.from(new Set(catalog.map(p=>p.category))).sort();

      // Limpiar y crear botón "Todo"
      container.innerHTML='';
      const allBtn = document.createElement('button');
      allBtn.className='nav-btn active';
      allBtn.dataset.filter='all';
      allBtn.textContent='Todo';
      container.appendChild(allBtn);

      // Crear un botón por categoría
      cats.forEach(cat=>{
        const b=document.createElement('button');
        b.className='nav-btn';
        b.dataset.filter=cat;
        b.textContent=capitalize(cat);
        container.appendChild(b);
      });
    }

    // Pinta la grilla de productos
    function renderProducts(container, list){
      container.innerHTML='';
      list.forEach(p=>{
        const card = document.createElement('article');
        card.className='card';
        card.dataset.id=p.id;
        card.dataset.category=p.category;
        card.innerHTML = `
          <img src="${p.image}" alt="${escapeHtml(p.name)}">
          <div class="card-body">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="price">${money(p.price)}</p>
            <button class="add-btn">Agregar</button>
          </div>`;
        container.appendChild(card);
      });
      // Estado vacío (por búsqueda/filtro)
      if(!list.length){
        container.innerHTML = '<p style="opacity:.8">No hay productos para mostrar.</p>';
      }
    }

    // Aplica categoría + texto; actualiza estado y repinta
    function applyFilters(container){
      const byCat = state.category==='all'
        ? state.catalog
        : state.catalog.filter(p=>p.category===state.category);

      const byText = state.search
        ? byCat.filter(p=>(p.name||'').toLowerCase().includes(state.search))
        : byCat;

      state.filtered = byText;
      renderProducts(container, state.filtered);
    }

    // Añadir al carrito (o incrementar cantidad)
    function addToCart(prod){
      const f = state.cart.find(i=>i.id===prod.id);
      if(f) f.qty += 1;
      else state.cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
      renderCart(cartItemsEl, cartCountEl, cartSubtotalEl);
    }

    // Quitar del carrito por id
    function removeFromCart(id){
      state.cart = state.cart.filter(i=>i.id!=id);
    }

    // Cambiar cantidad (+/-)
    function changeQty(id, delta){
      const it = state.cart.find(i=>i.id==id);
      if(!it) return;
      it.qty += delta;
      if(it.qty <= 0) removeFromCart(id);
    }

    // Render del carrito y subtotal
    function renderCart(container, countEl, subtotalEl){
      container.innerHTML = '';
      let subtotal = 0;

      state.cart.forEach(it=>{
        subtotal += it.price * it.qty;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div>
            <p class="item-title">${escapeHtml(it.name)}</p>
            <small>${money(it.price)} c/u</small>
          </div>
          <div class="item-controls">
            <button class="qty-btn" data-action="dec" data-id="${it.id}">−</button>
            <span class="qty">${it.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${it.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${it.id}">Quitar</button>
          </div>`;
        container.appendChild(row);
      });

      // Actualizamos contador y total
      countEl.textContent = String(state.cart.reduce((a,b)=>a+b.qty,0));
      subtotalEl.textContent = money(subtotal);
    }

    // Utilidades varias
    function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }
    function escapeHtml(str){
      return String(str||'')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    }
  }
})();