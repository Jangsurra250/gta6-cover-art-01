// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, at its export size.
// Query knobs: photo (pier|boulevard), caption, subtitle, layout, grade,
// size (square|portrait|wide). window.__shotReady is set once painted.
import { SIZES } from './main.js';

export async function runShot(shot, query, state, helpers) {
  const size = SIZES[query.get('size') ?? 'square'] ?? SIZES.square;
  const canvas = document.getElementById('cover');
  canvas.width = size.w;
  canvas.height = size.h;
  state.size = query.get('size') ?? 'square';
  state.layout = query.get('layout') ?? 'trio';
  state.grade = query.get('grade') ?? 'sunset';
  state.title = query.get('caption') ?? 'Sunset Heist';
  state.subtitle = query.get('subtitle') ?? 'Vice City • Leonida';
  document.getElementById('caption').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.querySelectorAll('[data-group="layout"] button').forEach((b) => b.classList.toggle('on', b.dataset.value === state.layout));
  document.querySelectorAll('[data-group="grade"] button').forEach((b) => b.classList.toggle('on', b.dataset.value === state.grade));
  document.querySelectorAll('[data-group="size"] button').forEach((b) => b.classList.toggle('on', b.dataset.value === state.size));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  try {
    const img = await helpers.loadImage(`samples/${query.get('photo') ?? 'pier'}.jpg`);
    state.photos = [img, img, img];
    // Give the panels different crops so the cover shows the multi-photo look.
    state.crops = [
      { zoom: 1.05, x: 0.5, y: 0.42 },
      { zoom: 1.35, x: 0.3, y: 0.55 },
      { zoom: 1.3, x: 0.68, y: 0.5 },
    ];
  } catch {
    state.photos = [null, null, null];
  }
  helpers.redraw();
  helpers.syncCropControls();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
