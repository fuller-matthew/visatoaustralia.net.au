(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('.sr-only').textContent = 'Open navigation';
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const narrow = window.matchMedia('(max-width: 760px)');
  narrow.addEventListener('change', () => { if (!narrow.matches) closeMenu(); });
  document.querySelector('#year').textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const play = (element, frames, options) => {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
    animation.oncancel = () => animations.delete(animation);
  };
  // Content starts visible. Motion is a progressive enhancement, never a gate.
  document.querySelectorAll('.hero-copy > *, .experience-stamp, .hero-bottom').forEach((element, index) => {
    play(element, [{opacity:0,translate:'0 22px'},{opacity:1,translate:'0 0'}],
      {duration:850,delay:Math.min(index * 75,525),easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
  });
  const heroPhoto = document.querySelector('.hero-scene img');
  if (heroPhoto) play(heroPhoto,[{scale:'1.06'},{scale:'1'}],
    {duration:1600,easing:'cubic-bezier(.2,.7,.2,1)'});
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const siblings = [...element.parentElement.children].filter(child => child.hasAttribute('data-reveal'));
        const delay = Math.min(Math.max(siblings.indexOf(element),0) * 65,195);
        play(element,[{opacity:0,translate:'0 25px'},{opacity:1,translate:'0 0'}],
          {duration:700,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
        reveals.unobserve(element);
      });
    }, {threshold:.08});
    document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
    const imageReveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const photo = element.querySelector('img');
        play(element,[{clipPath:'inset(0 0 0 7%)'},{clipPath:'inset(0 0 0 0%)'}],
          {duration:950,easing:'cubic-bezier(.2,.7,.2,1)'});
        if (photo) play(photo,[{scale:'1.07'},{scale:'1'}],
          {duration:1200,easing:'cubic-bezier(.2,.7,.2,1)'});
        imageReveals.unobserve(element);
      });
    }, {threshold:.12});
    document.querySelectorAll('[data-image-reveal]').forEach(element => imageReveals.observe(element));
  }
  // Category links never filter services; they follow the reader through the page.
  const groups = [...document.querySelectorAll('[data-service-group]')];
  const jumps = [...document.querySelectorAll('[data-jump]')];
  const progress = document.querySelector('.scroll-progress');
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  const timeline = document.querySelector('.steps');
  const steps = [...document.querySelectorAll('.steps li')];
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let scheduled = false;
  let active = '';
  const updateScroll = () => {
    scheduled = false;
    const offset = narrow.matches ? 175 : 205;
    let current = groups[0];
    groups.forEach(group => { if (group.getBoundingClientRect().top <= offset) current = group; });
    if (current && active !== current.dataset.serviceGroup) {
      active = current.dataset.serviceGroup;
      jumps.forEach(link => {
        if (link.dataset.jump === active) link.setAttribute('aria-current','true');
        else link.removeAttribute('aria-current');
      });
    }
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.max(0,Math.min(1,window.scrollY / height)) : 0})`;
    header.classList.toggle('is-scrolled',window.scrollY > 12);
    const heroTop = hero.getBoundingClientRect().top;
    const shift = !narrow.matches && finePointer.matches && !reducedMotion.matches
      ? Math.max(0,Math.min(70,-heroTop * .15)) : 0;
    hero.style.setProperty('--hero-shift',`${shift.toFixed(1)}px`);
    let reached = 0;
    steps.forEach(step => {
      const visible = step.getBoundingClientRect().top < window.innerHeight * .75;
      step.classList.toggle('is-in-view',visible);
      if (visible) reached++;
    });
    timeline.style.setProperty('--process-progress',steps.length > 1 ? Math.max(0,(reached-1)/(steps.length-1)) : 0);
  };
  const requestScrollUpdate = () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateScroll); }
  };
  window.addEventListener('scroll',requestScrollUpdate,{passive:true});
  window.addEventListener('resize',requestScrollUpdate,{passive:true});
  updateScroll();
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) animations.forEach(animation => animation.cancel());
    requestScrollUpdate();
  });
})();
