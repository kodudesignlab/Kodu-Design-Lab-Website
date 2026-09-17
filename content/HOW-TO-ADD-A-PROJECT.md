# Adding a project

1. **Make a folder** in `content/` named with the URL you want, lowercase with dashes:
   `content/my-new-project/` → becomes `/projects/my-new-project`

2. **Drop your images in.** Name them with a number first so they're in order:
   ```
   01-hero.jpg              ← the first image is the hero AND the homepage card image
   02-detail.jpg
   03-photo-left.2up.jpg    ← ".2up" = two side by side
   04-photo-right.2up.jpg
   05-screen-a.3up.jpg      ← ".3up" = three side by side
   06-screen-b.3up.jpg
   07-screen-c.3up.jpg
   ```

   **The naming rule:** `NUMBER-name.HINT.jpg`
   - `NUMBER` sets the order (two digits: 01, 02 … 12).
   - `name` is just for you (it becomes the alt text). Files can share a name, e.g. both `02-layout` and `03-layout` are fine.
   - `HINT` is optional and says **how many per row**: `.2up` or `.3up`. Leave it off for full width.

   Side-by-side images keep their own shape (the build measures them), so make sure the
   images in one row are the **same size** or they won't line up. Rows must be complete:
   two `.2up` files in a row, three `.3up` files in a row. The build warns you if not.

   Full-width images are cropped to 16:9 or 16:10 (whichever is closer). Portrait images with
   no hint default to `.2up`.

   Use the biggest files you have (3000px wide is ideal). Never upscaled, small files stay small.

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
