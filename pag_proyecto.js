// pag_proyecto.js
// Mobile menu toggle and navbar affix for project pages
document.addEventListener('DOMContentLoaded', () => {
  // nav link hover tint (simple, non-intrusive) — parity with main.js
  try {
    document.querySelectorAll('.navlinks a, .logo a').forEach(link => {
      link.addEventListener('mouseenter', () => link.style.color = '#ddddddff');
      link.addEventListener('mouseleave', () => link.style.color = '');
    });
  } catch (e) {}

  // Prefer explicit IDs used in index.html, fall back to legacy classes if present
  const mobileBtn = document.getElementById('mobileMenuButton') || document.querySelector('.navTrigger');
  const mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');

  if (mobileMenu) {
    // ensure hidden initially
    try { mobileMenu.style.display = 'none'; } catch (e) {}
  }

  if (mobileBtn && mobileMenu) {
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

    // close when a menu link is clicked
    try {
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mobileMenu.style.display = 'none'; }));
    } catch (e) {}
  }

  // Hide menu when resizing to desktop widths
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenu) {
      mobileMenu.style.display = 'none';
    }
  });

  // Simple affix behavior on scroll (same as main.js)
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('affix');
    else nav.classList.remove('affix');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
