document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navlinks a, .logo a').forEach(link => {
    link.addEventListener('mouseenter', () => link.style.color = '#ddddddff');
    link.addEventListener('mouseleave', () => link.style.color = '');
  });

  // menú toggle móvil
  const mobileBtn = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileMenu.style.display = 'none';
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && e.target !== mobileBtn) {
        mobileMenu.style.display = 'none';
      }
    });
  }

  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (document.documentElement.scrollTop > 50 || window.scrollY > 50) nav.classList.add('affix');
    else nav.classList.remove('affix');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const profilePhoto = document.getElementById('profilePhoto');
  const photoModal = document.getElementById('photoModal');
  if (profilePhoto && photoModal) {
    profilePhoto.addEventListener('click', () => {
      photoModal.classList.add('open');
    });

    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) {
        photoModal.classList.remove('open');
      }
    });
  }

});

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

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.shrink-border');
  if (!btn) return;
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