/* Kodu Design Lab — project data
   `ratio` options: '16-10', '16-9' (full width), 'portrait' (2 per row), 'poster' (3 per row).
   `src` is the image base name; `widths` lists the generated variants (<base>-<width>.jpg),
   built by scripts/build-images.sh. main.js turns these into srcset/sizes. */
window.KODU_PROJECTS = {
  'courtside-wines': {
    name: 'Courtside Wines',
    info: 'Branding, Print & Web',
    images: [
      { src: 'images/courtside-wines/tote',             widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Courtside Vineyard tote bag in royal blue' },
      { src: 'images/courtside-wines/vineyard-graphic', widths: [1200, 2000, 2800], ratio: '16-9',     alt: 'Courtside graphic over a vineyard photograph' },
      { src: 'images/courtside-wines/tshirt-front',     widths: [1200, 2000, 2309], ratio: 'portrait', alt: 'Boxy t-shirt, front' },
      { src: 'images/courtside-wines/tshirt-back',      widths: [1200, 2000, 2309], ratio: 'portrait', alt: 'Boxy t-shirt, back' },
      { src: 'images/courtside-wines/business-card',    widths: [1200, 2000, 2800], ratio: '16-9',     alt: 'Business card on rock' },
      { src: 'images/courtside-wines/poster-01',        widths: [1188],             ratio: 'poster',   alt: 'Poster Designers A4 poster' },
      { src: 'images/courtside-wines/poster-02',        widths: [1188],             ratio: 'poster',   alt: 'Poster Designers A4 poster, truck' },
      { src: 'images/courtside-wines/poster-03',        widths: [1188],             ratio: 'poster',   alt: 'Poster Designers A4 poster' },
      { src: 'images/courtside-wines/multi-mag',        widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Magazine spread mockups' },
      { src: 'images/courtside-wines/macbook-01',       widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Website on a MacBook, concrete' },
      { src: 'images/courtside-wines/macbook-02',       widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Website on a MacBook, light' },
    ],
  },
};
