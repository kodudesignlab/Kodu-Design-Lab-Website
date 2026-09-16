# Kodu Design Lab

Personal portfolio site for Lachlan Sarv. Static HTML/CSS/JS with GSAP — no build step.

- `index.html` — homepage (project cards, intro animation, card → project transition)
- `projects/*.html` — standalone project pages (refresh/deep-link safe)
- `projects.js` — project data (images, aspect ratios, copy)
- `scripts/build-images.sh` — generates responsive JPG variants from source images

Run locally: `npx -y serve -l 5173 .`
