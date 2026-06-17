const anchorLinks = document.querySelectorAll('a[href^="#"]');
const revealBlocks = document.querySelectorAll('.reveal');
const heroStage = document.querySelector('.hero-stage');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    const target = href ? document.querySelector(href) : null;

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });
});

if (prefersReducedMotion) {
  revealBlocks.forEach((block) => block.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealBlocks.forEach((block) => revealObserver.observe(block));
}

if (heroStage && !prefersReducedMotion) {
  const parallaxHero = () => {
    const offset = Math.min(window.scrollY * 0.04, 28);
    heroStage.style.transform = `translateY(${offset}px)`;
  };

  window.addEventListener('scroll', parallaxHero, { passive: true });
}
