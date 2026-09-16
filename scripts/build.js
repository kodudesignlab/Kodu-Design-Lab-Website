#!/usr/bin/env node
/*  Kodu Design Lab — site builder
    Reads content/<slug>/project.json + images and generates:
      images/<slug>/            resized JPG variants (never upscaled)
      projects.js               data consumed by main.js
      projects/<slug>.html      standalone project pages
      index.html                homepage cards (between the <!-- projects --> markers)
    Run with:  node scripts/build.js   (or double-click Publish.command)
    Requires macOS (uses `sips` for resizing). No npm packages needed.            */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const WIDTHS = [1200, 2000, 2800];        // page images
const COVER_WIDTHS = [800, 1600];         // homepage card covers
const QUALITY = 88;
const RATIOS = ['16-10', '16-9', 'portrait', 'third', 'poster'];

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn('  ⚠︎', ...a);

/* ---------- helpers ---------- */
function imageSize(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]).toString();
  const w = +out.match(/pixelWidth:\s*(\d+)/)[1];
  const h = +out.match(/pixelHeight:\s*(\d+)/)[1];
  return { w, h };
}

function resize(src, dest, width) {
  const args = ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY)];
  if (width) args.push('--resampleWidth', String(width));
  execFileSync('sips', [...args, src, '--out', dest], { stdio: 'ignore' });
}

// Only rebuild a variant when the source is newer than the output
function needsBuild(src, dest) {
  if (!fs.existsSync(dest)) return true;
  return fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs;
}

// Guess a layout ratio from the image's own proportions
function detectRatio({ w, h }) {
  const r = w / h;
  if (r < 1) return 'portrait';
  return r >= 1.7 ? '16-9' : '16-10';
}

// "07-frame-01.third.jpg" → { order: 7, slug: 'frame-01', ratioHint: 'third' }
function parseImageName(file) {
  const base = file.replace(/\.(jpe?g|png)$/i, '');
  const parts = base.split('.');
  let ratioHint = null;
  if (parts.length > 1 && RATIOS.includes(parts[parts.length - 1])) ratioHint = parts.pop();
  const name = parts.join('.');
  const m = name.match(/^(\d+)[-_ ]*(.*)$/);
  return {
    order: m ? +m[1] : 9999,
    slug: (m ? m[2] : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image',
    ratioHint,
  };
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const titleCase = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ---------- read content ---------- */
if (!fs.existsSync(CONTENT)) { console.error('No content/ folder found'); process.exit(1); }

const projects = fs.readdirSync(CONTENT)
  .filter((d) => !d.startsWith('_') && !d.startsWith('.') && fs.existsSync(path.join(CONTENT, d, 'project.json')))
  .map((slug) => {
    const dir = path.join(CONTENT, slug);
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
    const files = fs.readdirSync(dir)
      .filter((f) => /\.(jpe?g|png)$/i.test(f) && !/^cover\./i.test(f)) // a numbered image can double as the cover
      .map((f) => ({ file: f, ...parseImageName(f) }))
      .sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));
    return { slug, dir, meta, files };
  })
  .sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999) || a.slug.localeCompare(b.slug));

if (!projects.length) { console.error('No projects found in content/'); process.exit(1); }

/* ---------- build images + data ---------- */
const data = {};
const cards = [];

for (const p of projects) {
  const outDir = path.join(ROOT, 'images', p.slug);
  fs.mkdirSync(outDir, { recursive: true });
  log(`\n${p.meta.name}  (${p.slug})${p.meta.draft ? '  — draft' : ''}`);

  // Homepage card cover — ALWAYS the first page image (the hero), so the card → hero
  // transition is seamless. Only a draft with no page images may use a cover.jpg instead.
  if (p.meta.cover) warn(`"cover" in project.json is ignored — the first image is always the cover`);
  let coverFile = p.files[0] && p.files[0].file;
  if (!coverFile) {
    const fallback = fs.readdirSync(p.dir).find((f) => /^cover\.(jpe?g|png)$/i.test(f));
    if (fallback) coverFile = fallback;
  }
  if (!coverFile) {
    warn('no images — the card needs at least one image (or a cover.jpg for a draft)');
  } else {
    const src = path.join(p.dir, coverFile);
    const { w } = imageSize(src);
    const coverWidths = [];
    for (const cw of COVER_WIDTHS) {
      if (cw > w) continue;
      const dest = path.join(outDir, `cover-${cw}.jpg`);
      if (needsBuild(src, dest)) resize(src, dest, cw);
      coverWidths.push(cw);
    }
    if (!coverWidths.length) { // tiny source — keep native
      const dest = path.join(outDir, `cover-${w}.jpg`);
      if (needsBuild(src, dest)) resize(src, dest);
      coverWidths.push(w);
    }
    cards.push({ slug: p.slug, meta: p.meta, coverWidths });
    log(`  cover ← ${coverFile}  [${coverWidths.join(', ')}]`);
  }

  if (p.meta.draft) continue;
  if (!p.files.length) { warn('no page images'); }

  // Page images
  const images = [];
  for (const f of p.files) {
    const src = path.join(p.dir, f.file);
    const size = imageSize(src);
    const ratio = f.ratioHint || detectRatio(size);
    const widths = [];
    for (const w of WIDTHS) {
      if (w > size.w) continue;
      const dest = path.join(outDir, `${f.slug}-${w}.jpg`);
      if (needsBuild(src, dest)) resize(src, dest, w);
      widths.push(w);
    }
    // keep a native-width copy when the source isn't already one of the standard sizes
    if (size.w < 2800 && !WIDTHS.includes(size.w)) {
      const dest = path.join(outDir, `${f.slug}-${size.w}.jpg`);
      if (needsBuild(src, dest)) resize(src, dest);
      widths.push(size.w);
    }
    widths.sort((a, b) => a - b);
    images.push({
      src: `images/${p.slug}/${f.slug}`,
      widths,
      ratio,
      alt: f.alt || `${p.meta.name}: ${titleCase(f.slug)}`,
    });
    log(`  ${f.file.padEnd(34)} ${ratio.padEnd(9)} [${widths.join(', ')}]`);
  }

  data[p.slug] = { name: p.meta.name, info: p.meta.info || '', images };

  // Remove stale generated files for this project
  const keep = new Set([
    ...images.flatMap((im) => im.widths.map((w) => `${path.basename(im.src)}-${w}.jpg`)),
    ...(cards.find((c) => c.slug === p.slug)?.coverWidths || []).map((w) => `cover-${w}.jpg`),
  ]);
  for (const f of fs.readdirSync(outDir)) if (!keep.has(f)) fs.unlinkSync(path.join(outDir, f));
}

/* ---------- write projects.js ---------- */
const js = `/* GENERATED by scripts/build.js from content/ — do not edit by hand.
   To add or change a project, edit content/<slug>/ then run the build (or Publish.command). */
window.KODU_PROJECTS = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, 'projects.js'), js);

/* ---------- write projects/<slug>.html ---------- */
const template = fs.readFileSync(path.join(__dirname, 'templates', 'project.html'), 'utf8');
const pagesDir = path.join(ROOT, 'projects');
fs.mkdirSync(pagesDir, { recursive: true });
const wanted = new Set();
for (const slug of Object.keys(data)) {
  const html = template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(data[slug].name))
    .replace(/\{\{SLUG\}\}/g, slug);
  fs.writeFileSync(path.join(pagesDir, `${slug}.html`), html);
  wanted.add(`${slug}.html`);
}
for (const f of fs.readdirSync(pagesDir)) if (f.endsWith('.html') && !wanted.has(f)) fs.unlinkSync(path.join(pagesDir, f));

/* ---------- write homepage cards ---------- */
const cardSizes = '(max-width: 1199px) calc(50vw - 25px), calc(16.66vw - 12px)';
const cardHtml = cards.map(({ slug, meta, coverWidths }, i) => {
  const srcset = coverWidths.map((w) => `images/${slug}/cover-${w}.jpg ${w}w`).join(', ');
  const src = `images/${slug}/cover-${coverWidths[0]}.jpg`;
  const open = meta.draft
    ? `<div class="project-card project-card--draft">`
    : `<a class="project-card" href="projects/${slug}" data-project="${slug}">`;
  const close = meta.draft ? '</div>' : '</a>';
  return `      ${open}
        <div class="project-card__media">
          <img src="${src}" srcset="${srcset}" sizes="${cardSizes}"
               alt="${escapeHtml(meta.name)}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async">
        </div>
        <div class="project-card__meta">
          <p class="project-card__name">${escapeHtml(meta.name)}</p>
          <p class="project-card__info">${escapeHtml(meta.info || '')}</p>
        </div>
      ${close}`;
}).join('\n\n');

const indexPath = path.join(ROOT, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
const START = '<!-- projects:start -->', END = '<!-- projects:end -->';
if (!index.includes(START) || !index.includes(END)) {
  console.error(`index.html is missing the ${START} / ${END} markers`); process.exit(1);
}
index = index.replace(
  new RegExp(`${START}[\\s\\S]*?${END}`),
  `${START}\n${cardHtml}\n      ${END}`
);
fs.writeFileSync(indexPath, index);

log(`\n✓ Built ${Object.keys(data).length} project page(s), ${cards.length} homepage card(s).`);
