// Fetch properties.json, render listing cards, and wire the lightbox/gallery.
// Place this file next to housing.html and properties.json
document.addEventListener('DOMContentLoaded', () => {
  // Helpers
  const el = sel => document.querySelector(sel);
  const els = sel => Array.from(document.querySelectorAll(sel));
  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatCurrency = (amount, currency) => {
    if (amount == null || amount === '') return '';
    if (currency === 'NGN') return '₦' + Number(amount).toLocaleString();
    return currency + ' ' + Number(amount).toLocaleString();
  };

  // DOM references
  const grid = el('.listings-grid');
  const lightbox = el('#lightbox');
  const lightboxImg = el('#lightbox-img');
  const lbClose = el('#lightbox-close');

  let lbImages = [];
  let lbIndex = 0;

  function openLightbox(images, index = 0) {
    lbImages = images && images.length ? images : [];
    lbIndex = Math.max(0, Math.min(index, lbImages.length - 1));
    lightboxImg.src = lbImages[lbIndex] || '';
    lightboxImg.alt = '';
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImages = [];
    lbIndex = 0;
  }
  function lbNext() {
    if (!lbImages.length) return;
    lbIndex = (lbIndex + 1) % lbImages.length;
    lightboxImg.src = lbImages[lbIndex];
  }
  function lbPrev() {
    if (!lbImages.length) return;
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    lightboxImg.src = lbImages[lbIndex];
  }

  // Add prev/next buttons to lightbox (if not present)
  function ensureLightboxControls() {
    if (!el('#lb-prev')) {
      const prev = document.createElement('button');
      prev.id = 'lb-prev';
      prev.className = 'lightbox-nav';
      prev.title = 'Previous';
      prev.innerHTML = '‹';
      prev.style = 'position:absolute;left:18px;top:50%;transform:translateY(-50%);font-size:2.4rem;background:none;border:0;color:#fff;cursor:pointer;';
      prev.addEventListener('click', lbPrev);
      lightbox.appendChild(prev);
    }
    if (!el('#lb-next')) {
      const next = document.createElement('button');
      next.id = 'lb-next';
      next.className = 'lightbox-nav';
      next.title = 'Next';
      next.innerHTML = '›';
      next.style = 'position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:2.4rem;background:none;border:0;color:#fff;cursor:pointer;';
      next.addEventListener('click', lbNext);
      lightbox.appendChild(next);
    }
  }

  // Render properties into .listings-grid
  function renderProperties(properties) {
    if (!grid) return;
    const html = properties.map(p => {
      const thumb = (p.images && p.images[0]) || '';
      const imgsJson = (p.images && Array.isArray(p.images)) ? JSON.stringify(p.images) : '[]';
      const featuredBadge = p.featured ? `<span class="badge" aria-hidden="true">Featured</span>` : '';
      const availability = p.availability ? `<div class="muted" style="margin-top:6px">${escapeHtml(p.availability)}</div>` : '';
      return `
        <article class="listing-card" id="${escapeHtml(p.id)}" data-images='${escapeHtml(imgsJson)}'>
          <div class="img-wrap">
            <img loading="lazy" alt="${escapeHtml(p.title)}" src="${escapeHtml(thumb)}">
          </div>
          <div class="listing-body">
            ${featuredBadge}
            <h3>${escapeHtml(p.title)}</h3>
            <p class="muted">${formatCurrency(p.price, p.price_currency)} · ${escapeHtml(String(p.baths || 0))} baths · ${escapeHtml(p.furnished || '')}</p>
            <p class="small">${escapeHtml(p.description)}</p>
            ${availability}
            <div class="card-actions">
              <a class="btn btn-primary" href="https://wa.me/${String(p.contact_phone || '').replace(/[^0-9]/g,'')}" target="_blank" rel="noopener">Enquire</a>
              <button class="btn btn-outline view-btn" data-images='${escapeHtml(imgsJson)}' aria-label="View photos">View</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    grid.innerHTML = html;

    // bind view buttons and clickable thumbs
    els('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const imgs = JSON.parse(btn.dataset.images || '[]');
        openLightbox(imgs, 0);
      });
    });
    els('.listing-card .img-wrap img').forEach(img => {
      img.addEventListener('click', (e) => {
        const card = img.closest('.listing-card');
        if (!card) return;
        const imgs = JSON.parse(card.dataset.images || '[]');
        openLightbox(imgs, 0);
      });
    });
  }

  // Fetch properties.json and render
  fetch('properties.json', {cache: "no-cache"})
    .then(res => {
      if (!res.ok) throw new Error('Failed to load properties.json');
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('properties.json must be an array');
      renderProperties(data);
    })
    .catch(err => {
      console.error('Error loading properties:', err);
      if (grid) grid.innerHTML = '<p style="color:var(--muted)">Unable to load listings. Make sure <code>properties.json</code> is present and valid.</p>';
    });

  // Wire lightbox behaviors
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  ensureLightboxControls();

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.style.display !== 'flex') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNext();
    if (e.key === 'ArrowLeft') lbPrev();
  });

  // Mobile nav toggle and simple year set (if present)
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      primaryNav.style.display = expanded ? 'none' : 'block';
    });
  }
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
