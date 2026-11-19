// Vice City Cover Maker — page wiring.
//
// Pick up to three photos (one per panel, or one photo for every panel),
// choose a layout, a colour grade and a post size, type a caption, and
// export a full-resolution PNG. Photos are read with object URLs on this
// machine only and are never uploaded. A `?shot=` query sets up a fixed
// scene for a screenshot instead (see ./shots.js).
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

export const SIZES = {
  square: { label: 'Square 1080 × 1080', w: 1080, h: 1080, file: 'cover-1080x1080.png' },
  portrait: { label: 'Portrait 1080 × 1350', w: 1080, h: 1350, file: 'cover-1080x1350.png' },
  wide: { label: 'Wide 1920 × 1080', w: 1920, h: 1080, file: 'cover-1920x1080.png' },
};

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const sizeNote = document.getElementById('size-note');

/** The poster's live state; every control edits this and calls redraw(). */
export const state = {
  photos: [null, null, null],
  layout: 'trio',
  grade: 'sunset',
  size: 'square',
  title: 'Sunset Heist',
  subtitle: 'Vice City • Leonida',
  crops: [{ zoom: 1, x: 0.5, y: 0.5 }, { zoom: 1, x: 0.5, y: 0.5 }, { zoom: 1, x: 0.5, y: 0.5 }],
  fillAll: true,
};

let selectedPanel = 0;

export function redraw() {
  state.title = titleInput.value;
  state.subtitle = subtitleInput.value;
  drawCover(canvas, state);
  const size = SIZES[state.size];
  sizeNote.textContent = `Preview — export is ${size.label}.`;
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Puts one loaded photo into a panel slot (or every slot when fill-all is on). */
export function placePhoto(img, slot) {
  if (state.fillAll) state.photos = [img, img, img];
  else state.photos[slot] = img;
  redraw();
}

async function loadFileInto(file, slot) {
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  placePhoto(img, slot);
  status.textContent = `Photo loaded into panel ${slot + 1}${state.fillAll ? ' (and every panel)' : ''}.`;
}

/** Segmented control: buttons with data-value inside a [data-group] wrapper. */
function wireGroup(group, onPick) {
  const wrap = document.querySelector(`[data-group="${group}"]`);
  if (!wrap) return;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    wrap.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === btn));
    onPick(btn.dataset.value);
  });
}

wireGroup('layout', (v) => { state.layout = v; redraw(); });
wireGroup('grade', (v) => { state.grade = v; redraw(); });
wireGroup('size', (v) => {
  state.size = v;
  const size = SIZES[v];
  canvas.width = size.w;
  canvas.height = size.h;
  redraw();
});

// Three photo pickers, one per panel slot.
[0, 1, 2].forEach((slot) => {
  const input = document.getElementById(`photo-${slot}`);
  if (!input) return;
  input.addEventListener('change', async (e) => {
    try { await loadFileInto(e.target.files[0], slot); }
    catch { status.textContent = 'That file could not be read as a photo.'; }
  });
});

document.getElementById('fill-all').addEventListener('change', (e) => {
  state.fillAll = e.target.checked;
  if (state.fillAll && state.photos[0]) state.photos = [state.photos[0], state.photos[0], state.photos[0]];
  redraw();
});

// Crop controls edit the selected panel's zoom and focal point.
document.getElementById('panel-pick').addEventListener('change', (e) => {
  selectedPanel = Number(e.target.value);
  syncCropControls();
});
function syncCropControls() {
  const crop = state.crops[selectedPanel];
  document.getElementById('zoom').value = crop.zoom;
  document.getElementById('pan-x').value = crop.x;
  document.getElementById('pan-y').value = crop.y;
}
document.getElementById('zoom').addEventListener('input', (e) => { state.crops[selectedPanel].zoom = Number(e.target.value); redraw(); });
document.getElementById('pan-x').addEventListener('input', (e) => { state.crops[selectedPanel].x = Number(e.target.value); redraw(); });
document.getElementById('pan-y').addEventListener('input', (e) => { state.crops[selectedPanel].y = Number(e.target.value); redraw(); });

// Sample photos: the kit's free-to-use samples, one click into every panel.
document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      const img = await loadImage(`samples/${btn.dataset.sample}.jpg`);
      state.photos = [img, img, img];
      redraw();
      status.textContent = `Sample “${btn.dataset.sample}” loaded into every panel.`;
    } catch { status.textContent = 'The sample photo could not be loaded.'; }
  });
});

titleInput.addEventListener('input', redraw);
subtitleInput.addEventListener('input', redraw);

document.getElementById('export').addEventListener('click', () => {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = size.file;
    a.click();
    status.textContent = `Saved ${size.file} (${size.w} × ${size.h}).`;
  }, 'image/png');
});

// Screenshot scenes: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with a sample photo loaded.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, state, { loadImage, redraw, syncCropControls });
} else {
  redraw();
}
