// The control panel. On fxhash these eleven parameters were set in the minting
// interface before an edition was made; here they are set live, and the piece
// re-forms as you move them. Closed by default so the artwork opens unobscured.
(() => {
  'use strict';

  const root = document.querySelector('.panel-root');
  const toggle = root.querySelector('.panel-toggle');
  const body = root.querySelector('.panel-body');
  const fields = root.querySelector('.panel-fields');
  const hashOut = root.querySelector('.panel-hash');
  const inputs = new Map();

  let open = false;
  setOpen(false);

  toggle.addEventListener('click', () => setOpen(!open));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
  });

  function setOpen(next) {
    open = next;
    body.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Controls';
  }

  // Build one row per parameter definition.
  for (const def of $fx.getDefinitions()) {
    const row = document.createElement('div');
    row.className = 'panel-row';

    const label = document.createElement('label');
    label.textContent = def.name;
    label.htmlFor = 'p-' + def.id;

    let input;
    let readout = null;

    if (def.type === 'number') {
      input = document.createElement('input');
      input.type = 'range';
      input.min = def.options.min;
      input.max = def.options.max;
      input.step = def.options.step;
      readout = document.createElement('output');
      readout.className = 'panel-value';
    } else if (def.type === 'boolean') {
      input = document.createElement('input');
      input.type = 'checkbox';
      row.classList.add('is-boolean');
    } else {
      input = document.createElement('select');
      for (const opt of def.options.options) {
        const o = document.createElement('option');
        o.value = o.textContent = opt;
        input.appendChild(o);
      }
    }

    input.id = 'p-' + def.id;
    input.addEventListener('input', () => {
      $fx.emit('params:update', { [def.id]: read(def, input) });
      if (readout) readout.textContent = format(def, $fx.getParam(def.id));
      reform();
    });

    row.append(label, input);
    if (readout) row.appendChild(readout);
    fields.appendChild(row);
    inputs.set(def.id, { input, readout, def });
  }

  root.querySelector('.panel-random').addEventListener('click', () => {
    const updates = {};
    for (const def of $fx.getDefinitions()) updates[def.id] = $fx.getRandomParam(def.id);
    $fx.emit('params:update', updates);
    sync();
    reform();
  });

  root.querySelector('.panel-reseed').addEventListener('click', () => {
    // Same as clicking the artwork: a new hash rerolls everything.
    newIteration();
  });

  function read(def, input) {
    if (def.type === 'number') return Number(input.value);
    if (def.type === 'boolean') return input.checked;
    return input.value;
  }

  function format(def, value) {
    if (def.type !== 'number') return String(value);
    const places = (String(def.options.step).split('.')[1] || '').length;
    return Number(value).toFixed(places);
  }

  // Push current parameter values back into the controls, after a reseed or a
  // randomise.
  function sync() {
    for (const [id, { input, readout, def }] of inputs) {
      const value = $fx.getParam(id);
      if (def.type === 'boolean') input.checked = !!value;
      else input.value = value;
      if (readout) readout.textContent = format(def, value);
    }
    hashOut.textContent = $fx.hash;
  }

  function reform() {
    if (typeof applyParams !== 'function') return;
    applyParams();
    if (typeof isLooping === 'function' && !isLooping()) redraw();
  }

  window.syncPanel = sync;

  // p5 calls setup() on window load; the parameters exist before that, so the
  // controls can be filled in immediately.
  sync();
})();
