(() => {
  'use strict';
  const pieces = (window.HMC_MANIFEST?.pieces || [])
    .filter(piece => piece.category === 'games' && piece.wip === false && !piece.rejected)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const floor = document.getElementById('cabinets');
  for (const [index, piece] of pieces.entries()) {
    const item = document.createElement('li');
    item.className = 'cabinet';
    const link = document.createElement('a');
    link.className = 'piece-link';
    link.href = `../pieces/${encodeURIComponent(piece.slug)}/index.html`;
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    const title = document.createElement('h3');
    title.textContent = piece.title;
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    marquee.append(title, arrow);
    const bezel = document.createElement('div');
    bezel.className = 'bezel';
    const image = document.createElement('img');
    image.src = `../pieces/${encodeURIComponent(piece.slug)}/${encodeURIComponent(piece.thumbnail || 'thumbnail.jpg')}`;
    image.alt = `${piece.title} — artwork preview`;
    image.width = 800;
    image.height = 600;
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    const film = ({'008-vectrex-asteroids':'asteroids','007-hydra':'snake','005-only-invaders':'warlords'})[piece.slug];
    if (film) {
      item.id = film;
      link.dataset.attract = film;
      image.src = `arcade/assets/${film}-attract.png`;
      image.alt = `${({snake:'SNAKES!',asteroids:'Asteroids Assemble',warlords:'Warlords'})[film]} — 0 cents to play`;
      const media = document.createElement('div');
      media.className = 'attract-media';
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.setAttribute('aria-hidden', 'true');
      media.append(image, canvas);
      bezel.append(media);
    } else bezel.append(image);
    link.append(marquee, bezel);
    item.append(link);
    floor.append(item);
  }
})();
