document.querySelectorAll('.navlinks a, .logo a').forEach(function(link) {
    link.addEventListener('mouseenter', function() {
        link.style.color = '#00ff88'; // Color al pasar el mouse
    });
    link.addEventListener('mouseleave', function() {
        link.style.color = ''; // Vuelve al color original (usa el CSS)
    });
});