document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll('.navlinks a, .logo a').forEach(link => {
      link.addEventListener('mouseenter', () => link.style.color = '#ddddddff');
      link.addEventListener('mouseleave', () => link.style.color = '');
    });
  } catch (e) { console.error(e); }

  const mobileBtn = document.getElementById('mobileMenuButton') || document.querySelector('.navTrigger');
  const mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');

  if (mobileMenu) {
    try { mobileMenu.style.display = 'none'; } catch (e) { console.error(e); }
  }

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && e.target !== mobileBtn) {
        mobileMenu.style.display = 'none';
      }
    });

    try {
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mobileMenu.style.display = 'none'; }));
    } catch (e) { console.error(e); }
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenu) {
      mobileMenu.style.display = 'none';
    }
  });

  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('affix');
    else nav.classList.remove('affix');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
