const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const previewContainer = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

const ICON_SIZES = [16, 32, 48, 64, 128, 256];
let uploadedImage = null;

// Handle image upload
imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        uploadedImage = new Image();
        uploadedImage.src = reader.result;

        // Reset previous output
        previewContainer.innerHTML = "";
        downloadLink.classList.add("hidden");
    };
    reader.readAsDataURL(file);
});

// Convert image → ICO
convertBtn.addEventListener("click", async () => {
    if (!uploadedImage) {
        alert("Please upload an image first.");
        return;
    }

    previewContainer.innerHTML = "";
    downloadLink.classList.add("hidden");

    const pngBuffers = [];

    for (const size of ICON_SIZES) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(uploadedImage, 0, 0, size, size);

        // Preview image
        const previewImg = document.createElement("img");
        previewImg.src = canvas.toDataURL("image/png");
        previewImg.title = `${size}×${size}`;
        previewImg.className = "w-8 h-8 opacity-90";
        previewContainer.appendChild(previewImg);

        // Canvas → PNG buffer
        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
        );
        const buffer = await blob.arrayBuffer();
        pngBuffers.push(new Uint8Array(buffer));
    }

    // Generate ICO
    try {
        const icoBuffer = await window.pngToIco(pngBuffers);
        const icoBlob = new Blob([icoBuffer], { type: "image/x-icon" });
        const icoURL = URL.createObjectURL(icoBlob);

        downloadLink.href = icoURL;
        downloadLink.download = "favicon.ico";
        downloadLink.classList.remove("hidden");
    } catch (error) {
        alert("Conversion failed. Please try a different image.");
        console.error(error);
    }
});
