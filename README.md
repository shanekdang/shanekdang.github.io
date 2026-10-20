# shanekdang.github.io

Personal site for Shane Dang, served by GitHub Pages at <https://shanekdang.github.io>.
Plain HTML, CSS, and JavaScript — no build step. Open `index.html` in a browser to preview.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page structure: nav, the two-sided business card, the portfolio folder, the project viewer |
| `style.css` | All styling (design tokens at the top, mobile rules near the bottom) |
| `script.js` | Card flip and tilt, Miata polaroid, portfolio folder and project pages, copy-email, typewriter |
| `projects.js` | **Portfolio content** — one entry per project (see below) |
| `media/` | Headshot, Miata photo, mascot icon, favicon, resume PDF, and `shane-dang.vcf` (the "Save contact" card) |

## Common edits

- **Add or change a portfolio project:** edit `projects.js`. Copy an existing entry and change its
  title, year, summary, tags, optional image (e.g. `media/my-project.jpg`), sections, and links.
  The folder lays itself out for any number of projects.
- **Update the resume:** replace `media/resume.pdf` (keep the same filename).
- **Update contact details:** the email / GitHub / LinkedIn links appear in `index.html`
  (front of card, back of card, nav), in `media/shane-dang.vcf`, and the email in `script.js` (`EMAIL`).
- **Change the typewriter roles:** the `words` list near the end of `script.js`.
