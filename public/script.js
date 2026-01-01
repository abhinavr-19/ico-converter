const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const convertBtn = document.getElementById("convertBtn");
const previewContainer = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

const originalSection = document.getElementById("originalSection");
const originalPreview = document.getElementById("originalPreview");
const originalSize = document.getElementById("originalSize");
const icoSection = document.getElementById("icoSection");

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

let uploadedImage = null;
let imageReady = false;

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

/* ---------- Handle File ---------- */
function handleFile(file) {
    imageReady = false;

    const reader = new FileReader();
    reader.onload = () => {
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            imageReady = true;

            originalPreview.src = reader.result;
            originalSize.textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;

            originalSection.classList.remove("hidden");
            icoSection.classList.add("hidden");
            downloadLink.classList.add("hidden");
            previewContainer.innerHTML = "";
        };
        uploadedImage.src = reader.result;
    };
    reader.readAsDataURL(file);
}

/* ---------- Convert to ICO ---------- */
convertBtn.addEventListener("click", async () => {
    if (!imageReady) {
        alert("Please upload an image first.");
        return;
    }

    previewContainer.innerHTML = "";
    const pngBuffers = [];

    for (const size of ICON_SIZES) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(uploadedImage, 0, 0, size, size);

        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.className = "w-8 h-8 opacity-90";
        img.title = `${size}x${size}`;
        previewContainer.appendChild(img);

        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        const buffer = await blob.arrayBuffer();
        pngBuffers.push(new Uint8Array(buffer));
    }

    const icoBuffer = await window.pngToIco(pngBuffers);
    const icoBlob = new Blob([icoBuffer], { type: "image/x-icon" });

    downloadLink.href = URL.createObjectURL(icoBlob);
    downloadLink.download = "favicon.ico";

    icoSection.classList.remove("hidden");
    downloadLink.classList.remove("hidden");
});
