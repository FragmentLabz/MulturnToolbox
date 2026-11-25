# 🧰 My Toolbox

## Open it on your Mac

1. Download the whole `toolbox` folder and put it somewhere easy, like your Documents.
2. Double-click `index.html`. It opens in Safari or Chrome.
3. Tip: bookmark it, or drag the tab to your Dock.

Your files never get uploaded anywhere. Everything happens inside your browser.

## How the folder is laid out

```
toolbox/
├── index.html        ← the home screen (you rarely touch this)
├── tools.js          ← THE LIST of tools on the home screen (edit this to add one)
├── style.css         ← colours and looks shared by every page
├── lib/              ← helper libraries saved locally so things work offline
└── tools/
    ├── _template/    ← copy this to start a new tool
    └── image-pdf/    ← your first tool: Image ↔ PDF
        ├── index.html   (the layout)
        └── script.js    (the behaviour)
```

## Add a new tool in 4 steps

1. **Copy** `tools/_template` and rename the copy, e.g. `tools/word-counter`.
2. **Edit** the copy's `index.html`: change the title, heading and layout.
3. **Write** what it does in the copy's `script.js`. The template has a tiny working example to start from.
4. **Add it to the home screen**: open `tools.js` and add a block like this to the list:

   ```js
   {
     name: "Word Counter",
     description: "Count words and characters in any text.",
     icon: "🔢",
     link: "tools/word-counter/index.html",
     tags: ["text", "count"],
   },
   ```

Refresh the home screen and your new card is there.

## Handy things already in `style.css`

You can reuse these class names in any tool so it matches the rest:

| Class | What it gives you |
|---|---|
| `panel` | a white rounded box to hold your tool |
| `dropzone` | a dashed "drop files here" area |
| `primary` | the main purple button (put it on a `<button>`) |
| `tabs` + `tab` | pill-shaped tab buttons |
| `status` | small grey text for messages like "Done!" |

Look at `tools/image-pdf/script.js` for a `setUpDropZone` helper and a `downloadFile` helper you can copy into your own tools.

## Tool ideas for later

- HEIC → JPG (iPhone photos)
- Image resizer / compressor
- Merge, split or rotate PDF pages
- QR code maker
- Password generator
- Word & character counter
- Unit converter
- Colour picker from an image

## Turning it into a real Mac app (later)

Because it's just a folder of web pages, you can wrap it as a Mac app with [Tauri](https://tauri.app) without rewriting anything. Worth doing once you have a few tools.

## Libraries used

- [pdf-lib](https://pdf-lib.js.org) (MIT) for making PDFs
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla (Apache 2.0) for reading PDFs
