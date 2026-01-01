const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const previewContainer = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

let uploadedImage = null;

// Handle image upload
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        uploadedImage = new Image();
        uploadedImage.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Convert image to ICO
convertBtn.addEventListener("click", async () => {
    if (!uploadedImage) {
        alert("Please upload an image first!");
        return;
    }

    previewContainer.innerHTML = "";
    const pngBuffers = [];

    for (let size of ICON_SIZES) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(uploadedImage, 0, 0, size, size);

        // Preview
        const previewImg = document.createElement("img");
        previewImg.src = canvas.toDataURL("image/png");
        previewImg.title = `${size}x${size}`;
        previewContainer.appendChild(previewImg);

        // Convert canvas → PNG buffer
        const blob = await new Promise((res) =>
            canvas.toBlob(res, "image/png")
        );
        const arrayBuffer = await blob.arrayBuffer();
        pngBuffers.push(new Uint8Array(arrayBuffer));
    }

    // Convert PNG buffers → ICO
    const icoBuffer = await window.pngToIco(pngBuffers);

    // Create download link
    const icoBlob = new Blob([icoBuffer], { type: "image/x-icon" });
    const icoURL = URL.createObjectURL(icoBlob);

    downloadLink.href = icoURL;
    downloadLink.download = "favicon.ico";
    downloadLink.style.display = "inline-block";
    downloadLink.innerText = "Download ICO";
});
