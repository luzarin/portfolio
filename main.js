document.addEventListener('DOMContentLoaded', () => {
  // nav link hover tint (simple, non-intrusive)
  document.querySelectorAll('.navlinks a, .logo a').forEach(link => {
    link.addEventListener('mouseenter', () => link.style.color = '#9accfd');
    link.addEventListener('mouseleave', () => link.style.color = '');
  });

  // mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    // ensure hidden initially (CSS handles it, but keep JS-safe)
    mobileMenu.style.display = 'none';
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });
    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && e.target !== mobileBtn) {
        mobileMenu.style.display = 'none';
      }
    });
  }

  // scroll handler: toggle .affix when scrolled
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (document.documentElement.scrollTop > 50 || window.scrollY > 50) nav.classList.add('affix');
    else nav.classList.remove('affix');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // project modal opener/closer handled below (delegated)
});

// project modal: open project content on "Ver Más" click only on small screens
const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openProjectModal(cardElement) {
  if (!modal || !modalBody || !cardElement) return;
  const clone = cardElement.cloneNode(true);
  const btn = clone.querySelector('.shrink-border');
  if (btn) btn.remove();
  modalBody.innerHTML = '';
  modalBody.appendChild(clone);
  modal.style.display = 'flex';
}

if (modalClose) modalClose.addEventListener('click', () => modal.style.display = 'none');
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// delegate "Ver Más" clicks: navigate by default; only open modal for explicit modal links
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.shrink-border');
  if (!btn) return;
  // If it's an anchor pointing to a page, let the browser navigate
  const href = btn.getAttribute('href');
  const explicitModal = btn.dataset && btn.dataset.modal === 'true';
  if (explicitModal || !href || href === '#') {
    const card = btn.closest('.card');
    if (card) {
      e.preventDefault();
      openProjectModal(card);
    }
  }
});