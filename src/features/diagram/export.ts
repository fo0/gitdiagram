export function exportMermaidSvgAsPng(svgElement: SVGSVGElement): void {
  const canvas = document.createElement("canvas");
  const scale = 4;

  const bbox = svgElement.getBBox();
  const transform = svgElement.getScreenCTM();

  // Use transform scaling if available, otherwise fall back to 1:1
  const scaleX = transform ? transform.a : 1;
  const scaleY = transform ? transform.d : 1;

  // Use clientWidth/clientHeight as fallback when getBBox returns 0
  const width =
    Math.ceil(bbox.width * scaleX) ||
    svgElement.clientWidth ||
    svgElement.viewBox.baseVal.width ||
    800;
  const height =
    Math.ceil(bbox.height * scaleY) ||
    svgElement.clientHeight ||
    svgElement.viewBox.baseVal.height ||
    600;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clone SVG and set explicit dimensions so the image renders at full size
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute("width", String(width));
  clonedSvg.setAttribute("height", String(height));

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const img = new Image();

  img.onload = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

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
