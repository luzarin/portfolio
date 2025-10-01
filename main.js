document.querySelectorAll('.navlinks a, .logo a').forEach(function(link) {
    link.addEventListener('mouseenter', function() {
        link.style.color = '#86c4ebff'; // Color al pasar el mouse
    });
    link.addEventListener('mouseleave', function() {
        link.style.color = ''; // Vuelve al color original (usa el CSS)
    });
});

// mobile menu toggle
const mobileBtn = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
  });
  // close if click outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== mobileBtn) {
      mobileMenu.style.display = 'none';
    }
  });
}

// project modal: open project content on "Ver Más" click only on small screens
const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openProjectModal(cardElement) {
  if (!modal || !modalBody) return;
  // clone card content (title, image, body) into modalBody
  const clone = cardElement.cloneNode(true);
  // remove button inside to avoid double actions
  const btn = clone.querySelector('.shrink-border');
  if (btn) btn.remove();
  modalBody.innerHTML = '';
  modalBody.appendChild(clone);
  modal.style.display = 'flex';
}

if (modalClose) modalClose.addEventListener('click', () => modal.style.display = 'none');
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// delegate "Ver Más" clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.shrink-border');
  if (!btn) return;
  // only on small screens open modal
  if (window.innerWidth <= 768) {
    // find closest .card element
    const card = btn.closest('.card');
    if (card) {
      openProjectModal(card);
      e.preventDefault();
    }
  }
}); 