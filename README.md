# AI for Interdisciplinary Design Portfolio

A three-page static portfolio built with HTML, CSS, and JavaScript. It is designed to run without a backend and to deploy under a GitHub Pages repository subdirectory.

## Pages

- `index.html` — interactive name-painting homepage and project navigation
- `album.html` — Album Art — Seasons of Solitude
- `workspace.html` — 2035 Creative Workspace

## Local preview

The painting canvas loads and exports image assets, so preview the project through a small local web server rather than opening the HTML files directly from the filesystem.

From the `web` directory, run either:

```powershell
py -m http.server 8000
```

or, if `py` is unavailable:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## GitHub Pages deployment

1. Commit the complete `web` directory to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing the site and the folder where these files live.
5. Save and wait for GitHub Pages to publish the site.

All links and asset paths are relative, so the site works when GitHub Pages hosts it beneath a repository subdirectory.

## Painting controls

- Choose **Splatter** and click or tap to place one randomly selected splatter.
- Choose **Brush** and drag to paint with randomly selected brush textures.
- Select one of the ten palette colors, or choose **Random**.
- Adjust the Size slider, reset the artwork, or save the full painted name as a PNG.
- Focus the canvas for keyboard mode. Arrow keys move the cursor; Space or Enter stamps; Shift + Arrow paints continuously; 1–0 selects colors; R chooses Random; [ and ] change size; Escape exits.

Painting is stored in `sessionStorage`, so it remains when navigating among the three pages in the same browser tab.

## Assets

The original project assets remain at the project root and are referenced without renaming:

- `Paint Splatter and Brush Stroke Asset Sheet.png` — transparent 5×4 sheet containing 10 splatters and 10 brush strokes; the browser crops the 20 cells at runtime
- `aLbum_cover.png`, `aLbum_CD.png`, `aLbum_record.png`
- `wOrkspace_1080p upscaled.mp4`
- `wOrkspace_Entrance.png`, `wOrkspace_Commons.png`, `wOrkspace_Contact_Sheet.png`

No replacement artwork or external libraries are used.
