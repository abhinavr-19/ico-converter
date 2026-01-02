// ✅ Reliable ES module import (works on Vercel)
import pngToIco from "https://cdn.skypack.dev/png-to-ico";

// DOM Elements
const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const convertBtn = document.getElementById("convertBtn");
const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

const originalSection = document.getElementById("originalSection");
const originalPreview = document.getElementById("originalPreview");
const originalSize = document.getElementById("originalSize");
const icoSection = document.getElementById("icoSection");

// Fixed size
const ICON_SIZE = 256;

// State
let image = null;
let ready = false;

/* ---------- Drag & Drop ---------- */
["dragenter", "dragover"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add("border-accent");
    })
);

["dragleave", "drop"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove("border-accent");
    })
);

dropZone.addEventListener("drop", e => {
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

imageInput.addEventListener("change", e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

/* ---------- Handle Upload ---------- */
function handleFile(file) {
    ready = false;

    const reader = new FileReader();
    reader.onload = () => {
        image = new Image();
        image.onload = () => {
            ready = true;

            originalPreview.src = reader.result;
            originalSize.textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;

            originalSection.classList.remove("hidden");
            icoSection.classList.add("hidden");
            downloadLink.classList.add("hidden");
            preview.innerHTML = "";
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(file);
}

/* ---------- Convert to ICO ---------- */
convertBtn.addEventListener("click", async () => {
    if (!ready) {
        alert("Please upload an image first.");
        return;
    }

    // Resize to 256×256
    const canvas = document.createElement("canvas");
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
    ctx.drawImage(image, 0, 0, ICON_SIZE, ICON_SIZE);

    // Preview icon
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.className = "w-16 h-16";
    preview.appendChild(img);

    // Canvas → PNG buffer
    const blob = await new Promise(res =>
        canvas.toBlob(res, "image/png")
    );
    const buffer = await blob.arrayBuffer();

    // PNG → ICO
    const icoBuffer = await pngToIco([new Uint8Array(buffer)]);
    const icoBlob = new Blob([icoBuffer], { type: "image/x-icon" });

    downloadLink.href = URL.createObjectURL(icoBlob);
    downloadLink.download = "favicon.ico";

    icoSection.classList.remove("hidden");
    downloadLink.classList.remove("hidden");
});
