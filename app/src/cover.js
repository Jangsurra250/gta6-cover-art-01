// Vice City Cover Maker — the cover painter.
//
// drawCover(canvas, state) paints a multi-panel GTA-style poster onto any
// canvas: two or three photo panels with thick white gutters, a painted sun
// and palm silhouettes on the hero panel, a sunset / neon / dusk / mono
// colour grade, and big bold caption lettering with a dark outline. All
// art is drawn here in code — no Rockstar logo, artwork or font anywhere.
//
// state: {
//   photos: [img|null, img|null, img|null],   // one per panel slot
//   layout: 'trio' | 'split' | 'hero',
//   grade: 'sunset' | 'neon' | 'dusk' | 'mono',
//   title: string, subtitle: string,
//   crops: [{ zoom, x, y }, ...]              // x,y = focal point 0..1
// }

const GRADES = {
  sunset: { sky: ['#ff9a3d', '#ff5e7a', '#7b2d8b'], wash: 'rgba(255, 94, 122, 0.22)', deep: 'rgba(43, 24, 56, 0.55)', sun: '#ffd166' },
  neon: { sky: ['#00e5ff', '#ff2ea6', '#7b2ff7'], wash: 'rgba(255, 46, 166, 0.28)', deep: 'rgba(16, 8, 48, 0.55)', sun: '#ffef5e' },
  dusk: { sky: ['#ffb347', '#b565d8', '#2b1055'], wash: 'rgba(120, 80, 220, 0.25)', deep: 'rgba(20, 10, 50, 0.6)', sun: '#ffcf8a' },
  mono: { sky: ['#e8e8e8', '#9a9a9a', '#222222'], wash: 'rgba(0, 0, 0, 0.18)', deep: 'rgba(0, 0, 0, 0.6)', sun: '#ffffff' },
};

/** Panel rectangles (fractions of the canvas) for a layout and aspect. */
export function panelsFor(layout, w, h) {
  const wide = w >= h;
  if (layout === 'split') {
    return wide
      ? [{ x: 0, y: 0, w: 0.58, h: 1, photo: 0 }, { x: 0.58, y: 0, w: 0.42, h: 0.5, photo: 1 }, { x: 0.58, y: 0.5, w: 0.42, h: 0.5, photo: 2 }]
      : [{ x: 0, y: 0, w: 1, h: 0.58, photo: 0 }, { x: 0, y: 0.58, w: 0.5, h: 0.42, photo: 1 }, { x: 0.5, y: 0.58, w: 0.5, h: 0.42, photo: 2 }];
  }
  if (layout === 'hero') {
    return wide
      ? [{ x: 0, y: 0, w: 1, h: 1, photo: 0 }, { x: 0.04, y: 0.62, w: 0.26, h: 0.32, photo: 1 }, { x: 0.7, y: 0.62, w: 0.26, h: 0.32, photo: 2 }]
      : [{ x: 0, y: 0, w: 1, h: 1, photo: 0 }, { x: 0.04, y: 0.66, w: 0.3, h: 0.28, photo: 1 }, { x: 0.66, y: 0.66, w: 0.3, h: 0.28, photo: 2 }];
  }
  // trio (default): one hero panel, two smaller ones beside / below it.
  return wide
    ? [{ x: 0, y: 0, w: 0.6, h: 1, photo: 0 }, { x: 0.6, y: 0, w: 0.4, h: 0.5, photo: 1 }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5, photo: 2 }]
    : [{ x: 0, y: 0, w: 1, h: 0.6, photo: 0 }, { x: 0, y: 0.6, w: 0.5, h: 0.4, photo: 1 }, { x: 0.5, y: 0.6, w: 0.5, h: 0.4, photo: 2 }];
}

/** Paints one photo into a rectangle, honouring its crop (zoom + focal point). */
export function drawPhotoInto(ctx, photo, rx, ry, rw, rh, crop, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  if (photo) {
    const zoom = crop?.zoom ?? 1;
    const scale = Math.max(rw / photo.naturalWidth, rh / photo.naturalHeight) * zoom;
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    const fx = crop?.x ?? 0.5;
    const fy = crop?.y ?? 0.5;
    const dx = rx + rw / 2 - pw * fx;
    const dy = ry + rh / 2 - ph * fy;
    if (grade === 'mono') ctx.filter = 'grayscale(1) contrast(1.12) brightness(1.05)';
    else if (grade === 'neon') ctx.filter = 'saturate(1.45) contrast(1.08)';
    else ctx.filter = 'saturate(1.25) contrast(1.06)';
    ctx.drawImage(photo, dx, dy, pw, ph);
    ctx.filter = 'none';
  } else {
    // Empty slot: a painted sunset sky so the poster still looks finished.
    const sky = ctx.createLinearGradient(rx, ry, rx, ry + rh);
    sky.addColorStop(0, GRADES[grade].sky[0]);
    sky.addColorStop(0.55, GRADES[grade].sky[1]);
    sky.addColorStop(1, GRADES[grade].sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `bold ${Math.max(14, rh * 0.07)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rx + rw / 2, ry + rh / 2);
  }
  // Grade wash + a soft dark foot so lettering stays readable.
  ctx.fillStyle = GRADES[grade].wash;
  ctx.fillRect(rx, ry, rw, rh);
  const foot = ctx.createLinearGradient(0, ry + rh * 0.55, 0, ry + rh);
  foot.addColorStop(0, 'rgba(0,0,0,0)');
  foot.addColorStop(1, GRADES[grade].deep);
  ctx.fillStyle = foot;
  ctx.fillRect(rx, ry, rw, rh);
  ctx.restore();
}

/** A palm silhouette, drawn in code: a tapered trunk, filled leaf blades
 *  fanning from the crown, and two coconuts. One solid shape reads as a
 *  palm at poster scale; thin strokes only read as a scribble. */
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  // Trunk: a filled, gently curving taper from base (x, y) to the crown.
  const topX = x + s * 0.14;
  const topY = y - s * 0.9;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.028, y);
  ctx.quadraticCurveTo(x + s * 0.02, y - s * 0.5, topX - s * 0.018, topY);
  ctx.lineTo(topX + s * 0.018, topY);
  ctx.quadraticCurveTo(x + s * 0.07, y - s * 0.5, x + s * 0.028, y);
  ctx.closePath();
  ctx.fill();
  // Fronds: six filled blades fanning upward from the crown.
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (1.05 + i * 0.19); // spread across the top
    const len = s * (0.38 + (i % 2) * 0.08);
    const tipX = topX + Math.cos(a) * len;
    const tipY = topY + Math.sin(a) * len * 0.75 + s * 0.1;
    const midX = topX + Math.cos(a) * len * 0.55;
    const midY = topY + Math.sin(a) * len * 0.45 - s * 0.1;
    const px = -Math.sin(a);
    const py = Math.cos(a);
    const wdt = s * 0.045;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX + px * wdt, midY + py * wdt, tipX, tipY);
    ctx.quadraticCurveTo(midX - px * wdt, midY - py * wdt, topX, topY);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts under the crown.
  ctx.beginPath();
  ctx.arc(topX - s * 0.02, topY + s * 0.03, s * 0.028, 0, Math.PI * 2);
  ctx.arc(topX + s * 0.03, topY + s * 0.035, s * 0.024, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The painted sun disc with horizontal cut lines, on the hero panel. */
export function drawSun(ctx, cx, cy, r, grade) {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.9);
  glow.addColorStop(0, GRADES[grade].sun);
  glow.addColorStop(1, 'rgba(255, 120, 80, 0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const disc = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  disc.addColorStop(0, '#fff3b0');
  disc.addColorStop(0.5, GRADES[grade].sun);
  disc.addColorStop(1, '#ff5e7a');
  ctx.fillStyle = disc;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // Cut lines across the lower half, the retro sunset look.
  ctx.fillStyle = 'rgba(43, 24, 56, 0.85)';
  for (let i = 0; i < 4; i++) {
    const yy = cy + r * (0.08 + i * 0.2);
    ctx.fillRect(cx - r, yy, r * 2, Math.max(2, r * 0.045));
  }
  ctx.restore();
}

/** Bold poster lettering: gradient fill, dark outline, soft shadow. */
export function drawTitle(ctx, text, x, y, maxWidth, size, grade) {
  const words = text.trim().toUpperCase().split(/\s+/);
  let lines = [''];
  let sizeNow = size;
  const fit = () => {
    ctx.font = `900 ${sizeNow}px "Arial Black", sans-serif`;
    lines = [''];
    for (const word of words) {
      const trial = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
      if (ctx.measureText(trial).width <= maxWidth || !lines[lines.length - 1]) lines[lines.length - 1] = trial;
      else lines.push(word);
    }
    return Math.max(...lines.map((l) => ctx.measureText(l).width));
  };
  while (fit() > maxWidth && sizeNow > 12) sizeNow -= 4;
  ctx.font = `900 ${sizeNow}px "Arial Black", sans-serif`;
  const grad = ctx.createLinearGradient(x, y - sizeNow * lines.length, x, y);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.55, GRADES[grade].sun);
  grad.addColorStop(1, '#ff5e7a');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = sizeNow * 0.18;
  ctx.shadowOffsetY = sizeNow * 0.05;
  lines.forEach((line, i) => {
    const ly = y - (lines.length - 1 - i) * sizeNow * 1.02;
    ctx.strokeStyle = '#1d0b26';
    ctx.lineWidth = Math.max(3, sizeNow * 0.09);
    ctx.strokeText(line, x, ly);
    ctx.fillStyle = grad;
    ctx.fillText(line, x, ly);
  });
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  return sizeNow;
}

/** The whole poster. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ? state.grade : 'sunset';
  const gutter = Math.max(6, Math.round(Math.min(w, h) * 0.008));
  // Outer paper: warm off-white, like a printed poster.
  ctx.fillStyle = '#fff6ec';
  ctx.fillRect(0, 0, w, h);
  const panels = panelsFor(state.layout || 'trio', w, h);
  const hero = panels[0];
  const hx = hero.x * w + gutter;
  const hy = hero.y * h + gutter;
  const hw = hero.w * w - gutter * 2;
  const hh = hero.h * h - gutter * 2;
  panels.forEach((p, i) => {
    const rx = p.x * w + gutter;
    const ry = p.y * h + gutter;
    const rw = p.w * w - gutter * 2;
    const rh = p.h * h - gutter * 2;
    const photo = state.photos[p.photo] ?? null;
    drawPhotoInto(ctx, photo, rx, ry, rw, rh, state.crops[p.photo], grade);
    // White frame + thin dark keyline around every panel.
    ctx.strokeStyle = '#fff6ec';
    ctx.lineWidth = gutter;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.strokeStyle = 'rgba(20, 8, 30, 0.35)';
    ctx.lineWidth = Math.max(1, gutter * 0.25);
    ctx.strokeRect(rx, ry, rw, rh);
    if (i === 0) {
      // Sun + palm live on the hero panel only, clipped to it so no frond
      // or sun edge can spill past the panel's white frame. The sun sits
      // high and right, clear of a centred face; the palm stands at the
      // bottom-right corner, clear of the caption block bottom-left.
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      drawSun(ctx, rx + rw * 0.82, ry + rh * 0.17, Math.min(rw, rh) * 0.13, grade);
      drawPalm(ctx, rx + rw * 0.86, ry + rh * 0.99, rh * 0.26, 'rgba(24, 8, 34, 0.92)');
      ctx.restore();
    }
  });
  // Caption block: title bottom-left of the hero panel, subtitle beneath it.
  const title = (state.title || 'Sunset Heist').trim() || 'Sunset Heist';
  const titleSize = Math.min(hw, hh) * 0.16;
  const tx = hx + hw * 0.045;
  const ty = hy + hh * 0.92;
  drawTitle(ctx, title, tx, ty, hw * 0.92, titleSize, grade);
  const sub = (state.subtitle || 'VICE CITY • LEONIDA').trim().toUpperCase();
  if (sub) {
    ctx.font = `700 ${Math.max(12, h * 0.018)}px sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, h * 0.004)}px`; } catch { /* older canvas: no letter spacing */ }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(sub, tx, ty + h * 0.032);
    try { ctx.letterSpacing = '0px'; } catch { /* reset */ }
  }
  // Small corner tag, top-left of the poster.
  ctx.font = `700 ${Math.max(11, h * 0.014)}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'left';
  ctx.fillText('★ FAN-MADE POSTER', hx + hw * 0.02, hy + h * 0.028);
}
