// Minimal, reliable PNG → ICO builder (256×256 only)
export function pngToIco(pngBuffers) {
    const png = pngBuffers[0];

    const headerSize = 6 + 16;
    const totalSize = headerSize + png.length;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // ICONDIR
    view.setUint16(offset, 0, true); offset += 2; // reserved
    view.setUint16(offset, 1, true); offset += 2; // type (icon)
    view.setUint16(offset, 1, true); offset += 2; // count

    // ICONDIRENTRY
    view.setUint8(offset++, 0); // width (256)
    view.setUint8(offset++, 0); // height (256)
    view.setUint8(offset++, 0); // colors
    view.setUint8(offset++, 0); // reserved
    view.setUint16(offset, 1, true); offset += 2; // planes
    view.setUint16(offset, 32, true); offset += 2; // bit count
    view.setUint32(offset, png.length, true); offset += 4; // image size
    view.setUint32(offset, headerSize, true); offset += 4; // image offset

    new Uint8Array(buffer, headerSize).set(png);
    return buffer;
}
