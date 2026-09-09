# Skyward Airlines

A static, multi-page website for Skyward Airlines, a fictional East African regional airline. Built with plain HTML, CSS and JavaScript — no build step, no dependencies to install, no backend.

## Structure

- `index.html` — homepage
- `booking.html` — the full booking flow (search results → seat selection → passengers → extras → review → contact enquiry)
- `destination.html` / `destinations.html` — destination pages (data-driven)
- `js/data.js` — all airports, routes, destinations, fleet, offers, news and FAQ content
- `js/main.js` — shared header, footer and mobile navigation
- `js/booking.js` — booking flow logic and state
- `js/content.js` + `js/template.js` — shared renderer for the travel-information / policy pages
- `css/styles.css` — the full design system (colors, type, components)
- All other `.html` files — individual pages (about, fleet, contact, FAQ, policies, etc.)

There is no build step. Every page is opened directly by the browser and pulls in the shared JS/CSS files via relative paths.

## Deploying

This is a plain static site — every link and asset reference uses relative paths, with no build step and no server-side code — so it can be deployed to any static host by uploading the folder contents as-is, with `index.html` at the top level (not nested in a subfolder).

**GitHub Pages**
1. Create a repository and push all files to the `main` branch, with `index.html` at the repo root.
2. Go to **Settings → Pages**, set **Source** to the `main` branch and `/ (root)`, then save.
3. The site publishes at `https://<username>.github.io/<repo-name>/`.
The included `.nojekyll` file tells GitHub Pages to skip Jekyll processing (not needed here, and it can otherwise interfere with filenames starting with `_`).

**Netlify**
- Drag-and-drop the folder onto the Netlify dashboard ("Deploy manually"), or connect the repo. No build command is needed — leave the build command blank and set the publish directory to the folder root.

**Vercel**
- Import the repo (or use `vercel` CLI from this folder). Framework preset: "Other". No build command needed; output directory is the root.

**Cloudflare Pages**
- Connect the repo or use direct upload. Build command: none. Build output directory: `/` (root).

**Amazon S3 + CloudFront (or any object storage)**
- Upload all files to the bucket, enable static website hosting, and set `index.html` as the index document.

**Any traditional web host / shared hosting (Apache, Nginx, cPanel, etc.)**
- Upload the folder contents via FTP/SFTP into the public web root (e.g. `public_html/` or `www/`). No server configuration is required beyond serving static files.

**Testing locally**
- From this folder, run `python3 -m http.server 8000` (or any static file server) and open `http://localhost:8000/`.

## Notes

- No backend or payment processing is implemented — booking flows end at a contact/enquiry step, by design.
- All data (routes, fares, destinations) is local to `js/data.js`. Swap this file for real API calls when you're ready to connect a live inventory system.
- Imagery is CSS/SVG-generated placeholder art, not real photography — replace with licensed photos before using this commercially.
