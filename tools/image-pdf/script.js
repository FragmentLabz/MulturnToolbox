// ============================================================
//  Image ↔ PDF — the behaviour
// ============================================================


// ---------- Switching between the two tabs ----------

for (const tab of document.querySelectorAll(".tab")) {
  tab.addEventListener("click", () => {
    // Light up the clicked tab, dim the others
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Show the matching panel, hide the other one
    document.getElementById("to-pdf").classList.toggle("hidden", tab.dataset.mode !== "to-pdf");
    document.getElementById("to-images").classList.toggle("hidden", tab.dataset.mode !== "to-images");
  });
}


// ---------- A reusable helper for drop zones ----------
// Makes a box accept files by dragging them in OR by clicking it.
// "onFiles" is the function that runs with the files you picked.

function setUpDropZone(zone, input, onFiles) {
  zone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    onFiles([...input.files]);
    input.value = ""; // reset, so picking the same file again still works
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault(); // without this the browser just opens the file
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    onFiles([...e.dataTransfer.files]);
  });
}


// ---------- A helper that makes the browser download a file ----------

function downloadFile(blob, fileName) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}


// ============================================================
//  MODE 1: Images → PDF
// ============================================================

let pickedImages = []; // the image files, in the order they'll appear in the PDF

const imageList = document.getElementById("image-list");
const makePdfButton = document.getElementById("make-pdf");
const pdfStatus = document.getElementById("pdf-status");

setUpDropZone(
  document.getElementById("image-drop"),
  document.getElementById("image-input"),
  (files) => {
    // Only keep files that are actually images
    pickedImages.push(...files.filter((f) => f.type.startsWith("image/")));
    drawImageList();
  }
);

// Shows the picked images with buttons to reorder or remove them
function drawImageList() {
  imageList.innerHTML = "";

  pickedImages.forEach((file, i) => {
    const row = document.createElement("li");
    row.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="">
      <span class="name"></span>
      <button title="Move up">↑</button>
      <button title="Move down">↓</button>
      <button title="Remove">✕</button>
    `;
    row.querySelector(".name").textContent = `${i + 1}. ${file.name}`;

    const [up, down, remove] = row.querySelectorAll("button");
    up.onclick = () => moveImage(i, i - 1);
    down.onclick = () => moveImage(i, i + 1);
    remove.onclick = () => { pickedImages.splice(i, 1); drawImageList(); };

    imageList.appendChild(row);
  });

  makePdfButton.disabled = pickedImages.length === 0;
}

function moveImage(from, to) {
  if (to < 0 || to >= pickedImages.length) return;
  const [file] = pickedImages.splice(from, 1);
  pickedImages.splice(to, 0, file);
  drawImageList();
}

// PDFs measure pages in "points" (72 points = 1 inch)
const PAGE_SIZES = {
  a4: [595, 842],
  letter: [612, 792],
};

makePdfButton.addEventListener("click", async () => {
  makePdfButton.disabled = true;
  pdfStatus.textContent = "Making your PDF…";

  try {
    const pdf = await PDFLib.PDFDocument.create();
    const sizeChoice = document.getElementById("page-size").value;

    for (const file of pickedImages) {
      const image = await embedImage(pdf, file);

      if (sizeChoice === "fit") {
        // Page is exactly the size of the image
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      } else {
        // Fixed paper size: shrink the image to fit and centre it
        const [pageW, pageH] = PAGE_SIZES[sizeChoice];
        const page = pdf.addPage([pageW, pageH]);
        const margin = 24;
        const scale = Math.min((pageW - margin * 2) / image.width, (pageH - margin * 2) / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
      }
    }

    const bytes = await pdf.save();
    downloadFile(new Blob([bytes], { type: "application/pdf" }), "images.pdf");
    pdfStatus.textContent = `Done! Saved a ${pickedImages.length}-page PDF to your Downloads.`;
  } catch (error) {
    console.error(error);
    pdfStatus.textContent = "Something went wrong: " + error.message;
  }

  makePdfButton.disabled = false;
});

// Puts one image file into the PDF. PDFs understand PNG and JPG directly;
// anything else (like WebP) gets redrawn as a PNG first.
async function embedImage(pdf, file) {
  const bytes = await file.arrayBuffer();
  if (file.type === "image/jpeg") return pdf.embedJpg(bytes);
  if (file.type === "image/png") return pdf.embedPng(bytes);

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  const pngBlob = await new Promise((done) => canvas.toBlob(done, "image/png"));
  return pdf.embedPng(await pngBlob.arrayBuffer());
}


// ============================================================
//  MODE 2: PDF → Images
// ============================================================

const imagesStatus = document.getElementById("images-status");
const results = document.getElementById("results");

// pdf.js normally does its work in a background "worker". We loaded the
// worker file in the HTML already, so point pdf.js at it.
pdfjsLib.GlobalWorkerOptions.workerSrc = "../../lib/pdf.worker.min.js";

setUpDropZone(
  document.getElementById("pdf-drop"),
  document.getElementById("pdf-input"),
  (files) => {
    const pdfFile = files.find((f) => f.type === "application/pdf");
    if (pdfFile) convertPdfToImages(pdfFile);
  }
);

async function convertPdfToImages(file) {
  results.innerHTML = "";
  imagesStatus.textContent = "Opening PDF…";

  try {
    const format = document.getElementById("image-format").value; // "png" or "jpeg"
    const extension = format === "jpeg" ? "jpg" : "png";
    const baseName = file.name.replace(/\.pdf$/i, "");

    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      imagesStatus.textContent = `Converting page ${pageNumber} of ${pdf.numPages}…`;

      // Draw the page onto a canvas. scale 2 = twice the normal size, so it's sharp.
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // white background (JPG has no transparency)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Turn the canvas into an image file and show a download link for it
      const blob = await new Promise((done) => canvas.toBlob(done, "image/" + format, 0.92));
      const fileName = `${baseName}-page-${pageNumber}.${extension}`;
      const url = URL.createObjectURL(blob);

      const item = document.createElement("div");
      item.innerHTML = `<img src="${url}" alt=""><a href="${url}"></a>`;
      const link = item.querySelector("a");
      link.download = fileName;
      link.textContent = "⬇ " + fileName;
      results.appendChild(item);
    }

    imagesStatus.innerHTML = `Done! ${pdf.numPages} page(s) ready. `;
    const allButton = document.createElement("button");
    allButton.className = "primary";
    allButton.textContent = "Download all";
    allButton.onclick = () => results.querySelectorAll("a").forEach((a) => a.click());
    imagesStatus.appendChild(allButton);
  } catch (error) {
    console.error(error);
    imagesStatus.textContent = "Couldn't read that PDF: " + error.message;
  }
}
