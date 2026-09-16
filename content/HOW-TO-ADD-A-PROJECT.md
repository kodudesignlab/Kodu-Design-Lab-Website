# Adding a project

1. **Make a folder** in `content/` named with the URL you want, lowercase with dashes:
   `content/my-new-project/` → becomes `/projects/my-new-project`

2. **Drop your images in.** Name them with a number first so they're in order:
   ```
   01-hero.jpg          ← the first image is the hero AND the homepage card image
   02-detail.jpg
   03-photo-left.jpg
   04-photo-right.jpg
   ```
   Layout is picked automatically from each image's proportions:
   - wider than 1.7:1 (e.g. 16:9) → full width, 16:9 box
   - landscape otherwise (e.g. 16:10, 3:2) → full width, 16:10 box
   - portrait → half width (2 per row), 4:5 box

   To override, add a ratio word before `.jpg`:
   `05-poster.poster.jpg` (A4, 3 per row) · `06-screen.third.jpg` (4:5, 3 per row) ·
   `.portrait` · `.16-9` · `.16-10`

   Use the biggest files you have (3000px wide is ideal). Never upscaled — small files stay small.

3. **Add `project.json`** (copy from another project):
   ```json
   {
     "name": "My New Project",
     "info": "Branding & Web",
     "order": 3
   }
   ```
   - `order` — position on the homepage (1 = first)
   - The homepage card always shows the **first image** (cropped to 6:8, centred) — it has to be the
     same image as the hero so the card-to-page transition is seamless. Pick a hero that also crops
     well to portrait. (Drafts with no images can use a `cover.jpg` instead.)
   - `"draft": true` — show the card but don't link it / build a page

4. **Double-click `Preview.command`** to check it locally, then **`Publish.command`** to push it live.

To remove a project, delete its folder and publish. To reorder, change the `order` numbers.
