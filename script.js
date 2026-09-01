const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');

if (menuToggle && navPanel) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => observer.observe(element));


