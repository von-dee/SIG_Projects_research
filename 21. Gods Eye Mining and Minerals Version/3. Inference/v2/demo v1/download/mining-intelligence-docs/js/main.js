/* ============================================================
   Mining Intelligence Atlas — Shared JS
   Navigation, search, scroll-spy, accordion, filter, progress
   ============================================================ */

(function () {
  'use strict';

  // ----- Progress bar -----
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      progressBar.style.width = (scrolled * 100) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ----- Sidebar toggle (mobile) -----
  const menuToggle = document.querySelector('.topbar__menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('is-open'));
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          !sidebar.contains(e.target) &&
          !menuToggle.contains(e.target) &&
          sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
      }
    });
  }

  // ----- Scroll-spy for sidebar active link -----
  const headings = document.querySelectorAll('.section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar__link[data-target]');
  if (headings.length && sidebarLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          sidebarLinks.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-100px 0px -70% 0px' });
    headings.forEach((h) => observer.observe(h));
  }

  // ----- Source card accordion -----
  document.querySelectorAll('.source-card__header').forEach((header) => {
    header.addEventListener('click', () => {
      const card = header.closest('.source-card');
      const wasOpen = card.classList.contains('is-open');
      // Optionally close siblings — comment out to allow multiple open
      // card.parentElement.querySelectorAll('.source-card.is-open').forEach(c => c.classList.remove('is-open'));
      card.classList.toggle('is-open', !wasOpen);
    });
  });

  // ----- Filter chips -----
  const filterChips = document.querySelectorAll('.chip[data-filter]');
  const sourceCards = document.querySelectorAll('.source-card[data-method]');
  if (filterChips.length && sourceCards.length) {
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const filter = chip.dataset.filter;
        sourceCards.forEach((card) => {
          if (filter === 'all' || card.dataset.method === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ----- Expand / Collapse all -----
  const expandAll = document.querySelector('[data-action="expand-all"]');
  const collapseAll = document.querySelector('[data-action="collapse-all"]');
  if (expandAll) {
    expandAll.addEventListener('click', () => {
      document.querySelectorAll('.source-card').forEach(c => c.classList.add('is-open'));
    });
  }
  if (collapseAll) {
    collapseAll.addEventListener('click', () => {
      document.querySelectorAll('.source-card').forEach(c => c.classList.remove('is-open'));
    });
  }

  // ----- Search -----
  const searchInput = document.querySelector('.topbar__search input');
  if (searchInput) {
    const search = (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.source-card').forEach((card) => {
        if (!q) { card.style.display = ''; return; }
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
      // Also filter category cards on home
      document.querySelectorAll('.category-card').forEach((card) => {
        if (!q) { card.style.display = ''; return; }
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    };
    searchInput.addEventListener('input', search);
  }

  // ----- Animated counters -----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const dur = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => obs.observe(c));
  }

  // ----- Keyboard shortcuts -----
  document.addEventListener('keydown', (e) => {
    // '/' to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput && searchInput.focus();
    }
    // ESC to blur search
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.blur();
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
    }
  });

  // ----- Last-modified footer -----
  const lastMod = document.querySelector('[data-last-modified]');
  if (lastMod) {
    const d = new Date();
    lastMod.textContent = d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
})();
