export function exportMermaidSvgAsPng(svgElement: SVGSVGElement): void {
  const canvas = document.createElement("canvas");

  // Use viewBox for the true diagram dimensions (unaffected by pan/zoom)
  const viewBox = svgElement.viewBox.baseVal;
  let width: number;
  let height: number;

  if (viewBox.width > 0 && viewBox.height > 0) {
    width = viewBox.width;
    height = viewBox.height;
  } else {
    width = svgElement.clientWidth || 800;
    height = svgElement.clientHeight || 600;
  }

  // Scale for high-res output, capped by browser canvas limits (~16384px per side)
  const maxDim = 16384;
  const scale = Math.max(1, Math.min(4, maxDim / width, maxDim / height));

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clone SVG for export
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Set SVG dimensions to match canvas pixels so it rasterizes at full resolution.
  // The viewBox maps diagram coordinates to these pixel dimensions.
  clone.setAttribute("width", String(canvas.width));
  clone.setAttribute("height", String(canvas.height));
  clone.style.removeProperty("max-width");
  clone.style.removeProperty("width");
  clone.style.removeProperty("height");

  // Remove svg-pan-zoom viewport transform to export the full unzoomed diagram
  const viewport = clone.querySelector(".svg-pan-zoom_viewport");
  if (viewport) {
    viewport.removeAttribute("transform");
  }

  // Remove svg-pan-zoom control icons from the exported image
  const controls = clone.querySelector("#svg-pan-zoom-controls");
  if (controls) {
    controls.remove();
  }

  const svgData = new XMLSerializer().serializeToString(clone);
  const img = new Image();

  img.onload = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const anchor = document.createElement("a");
    anchor.download = "diagram.png";
    anchor.href = canvas.toDataURL("image/png", 1.0);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  img.onerror = () => {
    console.error("Failed to load SVG as image for PNG export");
  };

  img.src =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgData)));
}

export function downloadMermaidCode(code: string): void {
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.download = "diagram.mmd";
  anchor.href = url;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
