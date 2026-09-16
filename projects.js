/* Kodu Design Lab — project data
   `ratio` options: '16-10', '16-9' (full width), 'portrait' (4:5, 2 per row),
   'third' (4:5, 3 per row), 'poster' (A4, 3 per row).
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
  'grampians-sandstone': {
    name: 'Grampians Sandstone',
    info: 'Website Design & Build',
    images: [
      { src: 'images/grampians-sandstone/hero',           widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Grampians Sandstone homepage hero' },
      { src: 'images/grampians-sandstone/text-overlay',   widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Text section over sandstone photography' },
      { src: 'images/grampians-sandstone/photo-01',       widths: [1200, 1500],       ratio: 'portrait', alt: 'Sandstone building photography' },
      { src: 'images/grampians-sandstone/photo-02',       widths: [1200, 1500],       ratio: 'portrait', alt: 'Sandstone clock tower photography' },
      { src: 'images/grampians-sandstone/product-slider', widths: [1200, 2000, 2800], ratio: '16-10',    alt: 'Product slider section' },
      { src: 'images/grampians-sandstone/image-slider',   widths: [1200, 2000, 2800], ratio: '16-9',     alt: 'Image slider on grey background' },
      { src: 'images/grampians-sandstone/frame-01',       widths: [1200, 2000, 2400], ratio: 'third',    alt: 'Product specifications page' },
      { src: 'images/grampians-sandstone/frame-02',       widths: [1200, 2000, 2400], ratio: 'third',    alt: 'Website page frame' },
      { src: 'images/grampians-sandstone/frame-03',       widths: [1200, 2000, 2400], ratio: 'third',    alt: 'Website page frame' },
      { src: 'images/grampians-sandstone/digger',         widths: [1200, 2000, 2440], ratio: '16-10',    alt: 'Quarry loader moving sandstone blocks' },
      { src: 'images/grampians-sandstone/mobile-overlay', widths: [1200, 2000, 2800], ratio: '16-9',     alt: 'Mobile layouts' },
    ],
  },
};
