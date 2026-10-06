(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  $('#year').textContent = new Date().getFullYear();

  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // gentle fade-in for blocks
  const els = $$('.split__text,.split__media,.tiger__text,.event,.card,.social-row,.section__head,.contact .wrap');
  els.forEach(e => e.classList.add('fade'));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  } else els.forEach(e => e.classList.add('is-in'));

  // active link
  const links = $$('.nav__links a:not(.brand)');
  const map = { home: 'home', story: 'story', tiger: 'story', outreach: 'outreach', socials: 'socials', team: 'team', contact: 'contact' };
  const spy = new IntersectionObserver(en => en.forEach(x => {
    if (x.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + map[x.target.id]));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach(s => spy.observe(s));
})();
