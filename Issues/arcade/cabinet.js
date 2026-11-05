// Progressive enhancement: the original poster links are always the fallback.
(() => {
  const player = document.querySelector('.player');
  if (typeof player.showModal !== 'function') return;
  const posters = [...document.querySelectorAll('.poster')];
  let frame = player.querySelector('.game-screen');
  const heading = player.querySelector('h2');
  const direct = player.querySelector('.cabinet-direct');
  const exit = player.querySelector('.cabinet-exit');
  const status = player.querySelector('#player-status');
  const pocket = document.querySelector('.pocket');
  const soundButtons = [...document.querySelectorAll('.sound-toggle')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wallSlot = document.querySelector('.wall-slot');
  const pocketCoin = pocket.querySelector('.pocket-coin');
  const joystick = player.querySelector('.joystick');
  const slugs = posters.map(p => p.getAttribute('href').split('/').at(-2));
  const seenKey = 'hypermedia-arcade-visited-v1';
  let seen;
  try { seen = new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')); }
  catch { seen = new Set(); }
  const lastKey = 'hypermedia-arcade-last-v1';
  let last = '';
  try { last = localStorage.getItem(lastKey) || ''; } catch {}
  let drawBag = [];
  let current = -1;
  let origin = null;
  let returnSpot = 0;
  let ownedEntry = false;
  let focusGame = false;
  let audio = null;
  let sound = false;

  function tone(kind = 'start') {
    if (!sound || !audio || document.hidden) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const notes = kind === 'coin' ? [1245, 1661, 2489] : kind === 'exit' ? [523, 330] : [440, 554, 659];
    notes.forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const t = audio.currentTime + i * .055;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(.035, t + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, t + .13);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(t);
      oscillator.stop(t + .15);
    });
  }

  function stamp(poster) {
    if (poster.querySelector('.visit-stamp')) return;
    poster.classList.add('visited');
    const mark = document.createElement('span');
    mark.className = 'visit-stamp';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 60 60"><path d="M8 5h44v13a5 5 0 0 0 0 10v27H8V28a5 5 0 0 0 0-10Z"/><path d="M14 36h32"/><circle cx="30" cy="20" r="6"/></svg>';
    poster.append(mark);
    poster.setAttribute('aria-label', `${poster.dataset.title}, visited`);
  }
  posters.forEach((poster, i) => {
    poster.dataset.title = poster.getAttribute('aria-label');
    if (seen.has(slugs[i])) stamp(poster);
    if (last === slugs[i]) {
      poster.classList.add('last-played');
      poster.setAttribute('aria-label', `${poster.dataset.title}, last played`);
    }
    poster.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(i, true);
    });
  });

  function remember(i) {
    seen.add(slugs[i]);
    stamp(posters[i]);
    posters.forEach((poster, index) => {
      poster.classList.toggle('last-played', index === i);
      poster.setAttribute('aria-label', `${poster.dataset.title}${index === i ? ', last played' : seen.has(slugs[index]) ? ', visited' : ''}`);
    });
    try {
      localStorage.setItem(seenKey, JSON.stringify([...seen]));
      localStorage.setItem(lastKey, slugs[i]);
    } catch {}
  }
  function address(i, push) {
    const url = new URL(location.href);
    url.hash = `play=${slugs[i]}`;
    if (push) {
      history.pushState({ ...history.state, arcadePlayer: true }, '', url);
      ownedEntry = true;
    } else history.replaceState(history.state, '', url);
  }
  function load(i, focus = false) {
    current = (i + posters.length) % posters.length;
    const poster = posters[current];
    const title = poster.dataset.title;
    focusGame = focus;
    heading.textContent = title;
    direct.href = poster.href;
    player.classList.add('booting');
    mount(poster.href, title);
    remember(current);
    status.textContent = title;
  }
  function open(i, record = false, soundKind = 'start') {
    const wasOpen = player.open;
    if (!wasOpen) {
      const fromWall = document.activeElement !== document.body;
      origin = fromWall ? document.activeElement : posters[i];
      returnSpot = fromWall ? scrollY : Math.max(0, posters[i].getBoundingClientRect().top + scrollY - 100);
      document.body.classList.add('playing');
      player.showModal();
    }
    if (record) address(i, !wasOpen);
    load(i, !wasOpen);
    tone(soundKind);
  }
  function dismiss(fromHistory = false) {
    if (!player.open) return;
    player.close();
    player.classList.remove('booting');
    mount('about:blank', 'Arcade artwork');
    document.body.classList.remove('playing');
    if (!fromHistory) {
      if (ownedEntry && history.state?.arcadePlayer) history.back();
      else {
        const url = new URL(location.href);
        url.hash = '';
        history.replaceState(history.state, '', url);
      }
    }
    ownedEntry = false;
    if (origin?.isConnected) origin.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (!player.open) scrollTo({ left: 0, top: returnSpot, behavior: 'instant' });
    });
    tone('exit');
  }
  function step(direction) {
    const i = (current + direction + posters.length) % posters.length;
    open(i, true);
  }
  function surprise(point) {
    const unvisited = posters.map((_, i) => i).filter(i => !seen.has(slugs[i]));
    drawBag = drawBag.filter(i => i !== current && (!unvisited.length || !seen.has(slugs[i])));
    if (!drawBag.length) {
      drawBag = unvisited.length ? unvisited : posters.map((_, i) => i).filter(i => i !== current);
      for (let n = drawBag.length - 1; n > 0; n--) {
        const k = Math.floor(Math.random() * (n + 1));
        [drawBag[n], drawBag[k]] = [drawBag[k], drawBag[n]];
      }
    }
    const i = drawBag.pop();
    open(i, true, 'coin');
    if (!reduced.matches) {
      const target = player.querySelector('.cabinet-coin').getBoundingClientRect();
      const from = point?.x != null ? point : (() => { const b = pocketCoin.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })();
      const token = document.createElement('span');
      token.className = 'flying-coin';
      token.setAttribute('aria-hidden', 'true');
      token.innerHTML = pocketCoin.innerHTML;
      token.style.left = `${target.x + target.width / 2 - 25}px`;
      token.style.top = `${target.y + target.height * .3 - 25}px`;
      player.append(token);
      const flight = token.animate([
        { transform: `translate(${from.x - target.x - target.width / 2}px, ${from.y - target.y - target.height * .3}px) rotate(-25deg) scale(1)` },
        { transform: 'translate(0, 0) rotate(420deg) scale(.12)' }
      ], { duration: 520, easing: 'cubic-bezier(.22,.8,.3,1)' });
      flight.finished.then(() => token.remove(), () => token.remove());
    }
  }

  function mount(url, title) {
    // A fresh frame's initial load does not add 15 subframe entries to Back.
    // Removing the old document also stops its animation and sound immediately.
    const next = document.createElement('iframe');
    next.className = 'game-screen';
    next.title = title;
    next.allow = 'fullscreen';
    next.addEventListener('load', () => {
      if (frame !== next || !player.open || url === 'about:blank') return;
      player.classList.remove('booting');
      if (focusGame) frame.focus();
      // Capture only the cabinet exit key. Artwork keyboard controls stay native.
      try {
        frame.contentWindow.addEventListener('keydown', event => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopImmediatePropagation();
          dismiss();
        }, true);
      } catch { /* file:// may isolate frames; the visible exit remains available. */ }
    });
    next.src = url;
    frame.replaceWith(next);
    frame = next;
  }
  exit.addEventListener('click', () => dismiss());
  player.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  player.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...player.querySelectorAll('button:not([disabled]), a[href], iframe')].filter(el => el.getClientRects().length && el.tabIndex >= 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  player.querySelector('.game-prev').addEventListener('click', () => step(-1));
  player.querySelector('.game-next').addEventListener('click', () => step(1));
  let stickDrag = null;
  let ignoreStickClick = false;
  joystick.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    ignoreStickClick = false;
    stickDrag = { x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
    joystick.setPointerCapture(event.pointerId);
  });
  joystick.addEventListener('pointermove', event => {
    if (!stickDrag) return;
    stickDrag.dx = event.clientX - stickDrag.x;
    stickDrag.dy = event.clientY - stickDrag.y;
    joystick.style.setProperty('--stick-x', `${Math.max(-17, Math.min(17, stickDrag.dx))}px`);
    joystick.style.setProperty('--stick-y', `${Math.max(-7, Math.min(9, stickDrag.dy))}px`);
    joystick.style.setProperty('--stick-angle', `${Math.max(-24, Math.min(24, stickDrag.dx))}deg`);
  });
  function releaseStick(event, cancelled = false) {
    if (!stickDrag) return;
    const { dx, dy } = stickDrag;
    stickDrag = null;
    joystick.style.removeProperty('--stick-x');
    joystick.style.removeProperty('--stick-y');
    joystick.style.removeProperty('--stick-angle');
    if (!cancelled && Math.hypot(dx, dy) > 12) {
      ignoreStickClick = true;
      if (Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? -1 : 1);
      else surprise({ x: event.clientX, y: event.clientY });
    }
  }
  joystick.addEventListener('pointerup', event => releaseStick(event));
  joystick.addEventListener('pointercancel', event => releaseStick(event, true));
  joystick.addEventListener('click', () => {
    if (ignoreStickClick) { ignoreStickClick = false; return; }
    surprise();
  });
  player.querySelector('.cabinet-coin').addEventListener('click', event => surprise({ x: event.clientX, y: event.clientY }));
  wallSlot.addEventListener('click', event => surprise({ x: event.clientX, y: event.clientY }));
  let coinDrag = null;
  let ignoreCoinClick = false;
  pocketCoin.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    ignoreCoinClick = false;
    coinDrag = { x: event.clientX, y: event.clientY, token: null };
    pocketCoin.setPointerCapture(event.pointerId);
  });
  pocketCoin.addEventListener('pointermove', event => {
    if (!coinDrag || Math.hypot(event.clientX - coinDrag.x, event.clientY - coinDrag.y) < 8) return;
    if (!coinDrag.token) {
      coinDrag.token = document.createElement('span');
      coinDrag.token.className = 'flying-coin held';
      coinDrag.token.innerHTML = pocketCoin.innerHTML;
      coinDrag.token.setAttribute('aria-hidden', 'true');
      document.body.append(coinDrag.token);
      pocketCoin.classList.add('dragging');
      wallSlot.classList.add('accepting');
    }
    coinDrag.token.style.left = `${event.clientX - 25}px`;
    coinDrag.token.style.top = `${event.clientY - 25}px`;
  });
  function releaseCoin(event, cancelled = false) {
    if (!coinDrag) return;
    const dragging = coinDrag.token;
    coinDrag = null;
    pocketCoin.classList.remove('dragging');
    wallSlot.classList.remove('accepting');
    if (!dragging) return;
    dragging.remove();
    ignoreCoinClick = !cancelled;
    const slot = wallSlot.getBoundingClientRect();
    if (!cancelled && event.clientX >= slot.left - 35 && event.clientX <= slot.right + 35 && event.clientY >= slot.top - 35 && event.clientY <= slot.bottom + 35) surprise({ x: event.clientX, y: event.clientY });
  }
  pocketCoin.addEventListener('pointerup', event => releaseCoin(event));
  pocketCoin.addEventListener('pointercancel', event => releaseCoin(event, true));
  pocketCoin.addEventListener('click', () => {
    if (ignoreCoinClick) { ignoreCoinClick = false; return; }
    surprise();
  });
  soundButtons.forEach(soundButton => soundButton.addEventListener('click', () => {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { soundButton.disabled = true; return; }
    try {
      audio ||= new Audio();
      sound = !sound;
      soundButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(sound));
        button.setAttribute('aria-label', sound ? 'Mute arcade sounds' : 'Enable arcade sounds');
      });
      tone('coin');
    } catch { sound = false; }
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audio?.state === 'running') audio.suspend().catch(() => {});
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    for (const token of document.querySelectorAll('.flying-coin:not(.held)')) {
      token.getAnimations().forEach(animation => animation.cancel());
      token.remove();
    }
  });
  function syncAddress() {
    const slug = location.hash.startsWith('#play=') ? location.hash.slice(6) : '';
    const i = slugs.indexOf(slug);
    if (i < 0) dismiss(true);
    else if (!player.open || current !== i) {
      ownedEntry = !!history.state?.arcadePlayer;
      open(i);
    }
  }
  addEventListener('popstate', syncAddress);
  addEventListener('hashchange', syncAddress);
  pocket.hidden = false;
  wallSlot.disabled = false;
  syncAddress();
})();
