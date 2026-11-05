(() => {
  'use strict';
  const pieces = (window.HMC_MANIFEST?.pieces || [])
    .filter(piece => piece.category === 'games' && piece.wip === false && !piece.rejected)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const floor = document.getElementById('cabinets');
  document.getElementById('count').textContent = `${String(pieces.length).padStart(2, '0')} selected works / In sequence`;
  for (const [index, piece] of pieces.entries()) {
    const item = document.createElement('li');
    item.className = 'cabinet';
    const link = document.createElement('a');
    link.className = 'piece-link';
    link.href = `../pieces/${encodeURIComponent(piece.slug)}/index.html`;
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('h3');
    title.textContent = piece.title;
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    marquee.append(number, title, arrow);
    const bezel = document.createElement('div');
    bezel.className = 'bezel';
    const image = document.createElement('img');
    image.src = `../pieces/${encodeURIComponent(piece.slug)}/${encodeURIComponent(piece.thumbnail || 'thumbnail.jpg')}`;
    image.alt = `${piece.title} — artwork preview`;
    image.width = 800;
    image.height = 600;
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    bezel.append(image);
    link.append(marquee, bezel);
    item.append(link);
    floor.append(item);
  }
})();
