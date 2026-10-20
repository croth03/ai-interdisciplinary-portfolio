(() => {
  "use strict";

  const canvas = document.querySelector("#paint-canvas");
  if (!canvas) return;
  const interactionSurface = document.querySelector("#paint-surface") || canvas;
  const paintingStage = canvas.closest(".painting-stage");

  const context = canvas.getContext("2d");
  const paintLayer = document.createElement("canvas");
  const paintContext = paintLayer.getContext("2d");
  const maskLayer = document.createElement("canvas");
  const maskContext = maskLayer.getContext("2d");
  const compositeLayer = document.createElement("canvas");
  const compositeContext = compositeLayer.getContext("2d");
  const stampScratch = document.createElement("canvas");
  const stampContext = stampScratch.getContext("2d", { willReadFrequently: false });
  const sheet = new Image();
  const paletteButtons = [...document.querySelectorAll("[data-color]")];
  const palettePhoto = document.querySelector(".palette-photo");
  const paletteSampleMarker = document.querySelector(".palette-sample-marker");
  const status = document.querySelector("#paint-status");
  const paletteColorMap = window.PALETTE_COLOR_MAP;

  const STORAGE_KEY = "christopher-roth-portfolio-painting-v1";
  const COLOR_VALUES = [
    "rgb(243, 234, 216)",
    "rgb(239, 71, 111)",
    "rgb(247, 140, 47)",
    "rgb(255, 209, 102)",
    "rgb(121, 194, 103)",
    "rgb(52, 198, 190)",
    "rgb(77, 163, 255)",
    "rgb(155, 110, 232)",
    "rgb(106, 69, 51)",
    "rgb(23, 24, 26)"
  ];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const randomIndex = (length) => Math.floor(Math.random() * length);
  const randomColor = () => COLOR_VALUES[randomIndex(COLOR_VALUES.length)];

  let selectedColor = COLOR_VALUES[0];
  let randomMode = false;
  let paintingSize = 62;
  let automaticSizePending = true;
  let logicalWidth = 0;
  let logicalHeight = 0;
  let pixelRatio = 1;
  let sheetReady = false;
  let pointerActive = false;
  let dragStarted = false;
  let pointerStart = null;
  let lastPoint = null;
  let activeStrokeColor = selectedColor;
  let keyboardActive = false;
  let keyboardCursor = null;
  let keyboardStrokeColor = null;
  let restoredSession = false;
  let resizeFrame = 0;
  let paletteLookupBytes = null;
  let activePointerId = null;
  let lastPointerClient = null;
  let autoScrollFrame = 0;
  let autoScrollLastTime = 0;

  const AUTO_SCROLL_EDGE = 88;
  const AUTO_SCROLL_MAX_SPEED = 980;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function chooseStrokeColor() {
    return randomMode ? randomColor() : selectedColor;
  }

  function setupLayer(layer, layerContext, width, height) {
    layer.width = Math.max(1, Math.round(width * pixelRatio));
    layer.height = Math.max(1, Math.round(height * pixelRatio));
    layerContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    layerContext.imageSmoothingEnabled = true;
    layerContext.imageSmoothingQuality = "high";
  }

  function measureNameGeometry(target, width) {
    const compact = width <= 720;
    const pad = clamp(width * 0.022, 10, 28);
    const stageRect = paintingStage?.getBoundingClientRect();
    const paletteRect = palettePhoto?.getBoundingClientRect();
    const paletteRight = stageRect && paletteRect
      ? paletteRect.right - stageRect.left
      : width * (compact ? 0.44 : 0.24);
    const paletteGap = compact ? clamp(width * 0.065, 24, 34) : clamp(width * 0.042, 48, 72);
    const minimumTextWidth = compact ? 132 : 300;
    const minimumHorizontalX = compact ? 166 : (width <= 960 ? 236 : 286);
    const horizontalX = Math.round(clamp(paletteRight + paletteGap, minimumHorizontalX, width - minimumTextWidth));
    const horizontalY = 0;
    const horizontalWidth = width - horizontalX - pad;

    let rothSize = compact
      ? Math.min(92, horizontalWidth * 0.38)
      : Math.min(290, width * 0.205);
    target.font = `900 ${rothSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
    let measured = target.measureText("ROTH");
    const measuredWidth = measured.width;
    if (measuredWidth > horizontalWidth) rothSize *= horizontalWidth / measuredWidth;
    target.font = `900 ${rothSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
    measured = target.measureText("ROTH");
    const rothDrawX = horizontalX - Math.max(0, measured.actualBoundingBoxLeft || 0);
    const rothAscent = measured.actualBoundingBoxAscent || rothSize * 0.76;
    const rothDescent = measured.actualBoundingBoxDescent || rothSize * 0.04;
    const rothDrawY = horizontalY + rothAscent;
    const titleX = horizontalX + rothSize * 0.07;

    const verticalSize = compact ? clamp(width * 0.28, 96, 132) : clamp(width * 0.15, 220, 320);
    const verticalX = verticalSize * 0.18;
    const measuredPaletteBottom = stageRect && paletteRect ? paletteRect.bottom - stageRect.top : 0;
    const fallbackTop = compact ? 100 : 200;
    const verticalTop = Math.max(
      fallbackTop,
      Math.round(measuredPaletteBottom - verticalSize * 0.18 + (compact ? 8 : 12))
    );
    target.font = `900 ${verticalSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
    const verticalLength = target.measureText("CHRISTOPHER").width;

    return {
      compact,
      horizontalX,
      rothDrawX,
      rothDrawY,
      titleX,
      horizontalY,
      rothSize,
      titleTop: Math.round(horizontalY + rothAscent + rothDescent + (compact ? 12 : 18)),
      verticalX,
      verticalTop,
      verticalSize,
      verticalLength
    };
  }

  function updateStageGeometry(width) {
    if (!paintingStage) return;
    const geometry = measureNameGeometry(maskContext, width);
    const bottomSpace = geometry.compact ? 300 : 250;
    const requiredHeight = Math.ceil(geometry.verticalTop + geometry.verticalLength + bottomSpace);
    const contentOffset = Math.ceil(geometry.verticalX + geometry.verticalSize * 0.84 + (geometry.compact ? 22 : 42));
    paintingStage.style.minHeight = `${requiredHeight}px`;
    paintingStage.style.setProperty("--headline-left", `${geometry.titleX}px`);
    paintingStage.style.setProperty("--headline-title-top", `${geometry.titleTop}px`);
    paintingStage.style.setProperty("--name-end-y", `${Math.ceil(geometry.verticalTop + geometry.verticalLength)}px`);
    paintingStage.style.setProperty("--name-content-offset", `${contentOffset}px`);
    paintingStage.style.setProperty("--paint-column-width", `${Math.max(contentOffset - 18, 112)}px`);
  }

  function drawNameMask(target) {
    const geometry = measureNameGeometry(target, logicalWidth);

    target.save();
    target.fillStyle = "#f3f0e9";
    target.textAlign = "left";
    target.textBaseline = "alphabetic";
    target.font = `900 ${geometry.rothSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
    target.fillText("ROTH", geometry.rothDrawX, geometry.rothDrawY);

    target.font = `900 ${geometry.verticalSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
    target.translate(geometry.verticalX, geometry.verticalTop);
    target.rotate(Math.PI / 2);
    target.textAlign = "left";
    target.textBaseline = "middle";
    target.fillText("CHRISTOPHER", 0, 0);
    target.restore();
  }

  function rebuildMask() {
    maskContext.clearRect(0, 0, logicalWidth, logicalHeight);
    drawNameMask(maskContext);
  }

  function rebuildComposite() {
    compositeContext.setTransform(1, 0, 0, 1, 0, 0);
    compositeContext.clearRect(0, 0, compositeLayer.width, compositeLayer.height);
    compositeContext.globalCompositeOperation = "source-over";
    compositeContext.drawImage(paintLayer, 0, 0);
    compositeContext.globalCompositeOperation = "destination-in";
    compositeContext.drawImage(maskLayer, 0, 0);
    compositeContext.globalCompositeOperation = "source-over";
  }

  function drawComposition(target, includeKeyboardCursor = true) {
    target.save();
    target.clearRect(0, 0, logicalWidth, logicalHeight);

    target.globalAlpha = 0.82;
    target.drawImage(maskLayer, 0, 0, logicalWidth, logicalHeight);
    target.globalAlpha = 1;

    rebuildComposite();
    target.drawImage(compositeLayer, 0, 0, logicalWidth, logicalHeight);

    if (includeKeyboardCursor && keyboardActive && keyboardCursor) {
      const radius = Math.max(10, paintingSize * 0.16);
      target.strokeStyle = "#ffd166";
      target.lineWidth = 2;
      target.beginPath();
      target.arc(keyboardCursor.x, keyboardCursor.y, radius, 0, Math.PI * 2);
      target.moveTo(keyboardCursor.x - radius - 5, keyboardCursor.y);
      target.lineTo(keyboardCursor.x + radius + 5, keyboardCursor.y);
      target.moveTo(keyboardCursor.x, keyboardCursor.y - radius - 5);
      target.lineTo(keyboardCursor.x, keyboardCursor.y + radius + 5);
      target.stroke();
    }
    target.restore();
  }

  function render() {
    if (!logicalWidth || !logicalHeight) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    drawComposition(context, true);
  }

  function restoreFromSession() {
    if (restoredSession) return;
    restoredSession = true;

    let saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      saved = null;
    }

    if (!saved?.data) return;

    const image = new Image();
    image.addEventListener("load", () => {
      paintContext.save();
      paintContext.setTransform(1, 0, 0, 1, 0, 0);
      paintContext.clearRect(0, 0, paintLayer.width, paintLayer.height);
      paintContext.drawImage(image, 0, 0, paintLayer.width, paintLayer.height);
      paintContext.restore();
      render();
      announce("Your painting from this session has been restored.");
    }, { once: true });
    image.src = saved.data;
  }

  function resizeCanvas() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const initialRect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(300, Math.round(initialRect.width));
      updateStageGeometry(nextWidth);
      const resizedRect = canvas.getBoundingClientRect();
      const nextHeight = Math.max(400, Math.round(resizedRect.height));
      if (nextWidth === logicalWidth && nextHeight === logicalHeight) return;

      const previousPaint = document.createElement("canvas");
      previousPaint.width = paintLayer.width;
      previousPaint.height = paintLayer.height;
      if (paintLayer.width && paintLayer.height) {
        previousPaint.getContext("2d").drawImage(paintLayer, 0, 0);
      }

      logicalWidth = nextWidth;
      logicalHeight = nextHeight;
      pixelRatio = logicalHeight > 1600 ? 1 : clamp(window.devicePixelRatio || 1, 1, 2);
      if (automaticSizePending) {
        paintingSize = clamp(logicalWidth * 0.052, 44, 78);
        automaticSizePending = false;
      }

      canvas.width = Math.round(logicalWidth * pixelRatio);
      canvas.height = Math.round(logicalHeight * pixelRatio);
      setupLayer(paintLayer, paintContext, logicalWidth, logicalHeight);
      setupLayer(maskLayer, maskContext, logicalWidth, logicalHeight);
      setupLayer(compositeLayer, compositeContext, logicalWidth, logicalHeight);

      if (previousPaint.width && previousPaint.height) {
        paintContext.save();
        paintContext.setTransform(1, 0, 0, 1, 0, 0);
        paintContext.drawImage(previousPaint, 0, 0, previousPaint.width, previousPaint.height, 0, 0, paintLayer.width, paintLayer.height);
        paintContext.restore();
      }

      keyboardCursor = keyboardCursor
        ? { x: clamp(keyboardCursor.x, 0, logicalWidth), y: clamp(keyboardCursor.y, 0, logicalHeight) }
        : { x: logicalWidth * 0.5, y: logicalHeight * 0.5 };

      rebuildMask();
      render();
      restoreFromSession();
    });
  }

  function prepareTintedSprite(spriteIndex, color) {
    const columns = 5;
    const rows = 4;
    const column = spriteIndex % columns;
    const row = Math.floor(spriteIndex / columns);
    const sourceX = Math.round((column * sheet.naturalWidth) / columns);
    const sourceY = Math.round((row * sheet.naturalHeight) / rows);
    const sourceX2 = Math.round(((column + 1) * sheet.naturalWidth) / columns);
    const sourceY2 = Math.round(((row + 1) * sheet.naturalHeight) / rows);
    const sourceWidth = sourceX2 - sourceX;
    const sourceHeight = sourceY2 - sourceY;

    stampScratch.width = sourceWidth;
    stampScratch.height = sourceHeight;
    stampContext.setTransform(1, 0, 0, 1, 0, 0);
    stampContext.clearRect(0, 0, sourceWidth, sourceHeight);
    stampContext.globalCompositeOperation = "source-over";
    stampContext.drawImage(sheet, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    stampContext.globalCompositeOperation = "source-in";
    stampContext.fillStyle = color;
    stampContext.fillRect(0, 0, sourceWidth, sourceHeight);
    stampContext.globalCompositeOperation = "source-over";
  }

  function stamp(spriteIndex, point, color, options = {}) {
    if (!sheetReady) {
      announce("Painting textures are still loading.");
      return;
    }

    prepareTintedSprite(spriteIndex, color);
    const isBrush = spriteIndex >= 10;
    const randomScale = options.scale ?? randomBetween(0.84, 1.16);
    const baseSize = paintingSize * randomScale;
    const width = isBrush ? baseSize * 2.25 : baseSize * 1.65;
    const height = isBrush ? baseSize * 0.72 : baseSize * 1.38;
    const rotation = options.rotation ?? randomBetween(-0.32, 0.32);

    paintContext.save();
    paintContext.translate(point.x, point.y);
    paintContext.rotate(rotation);
    paintContext.globalAlpha = randomBetween(0.82, 1);
    paintContext.drawImage(stampScratch, -width / 2, -height / 2, width, height);
    paintContext.restore();
    if (options.render !== false) render();
  }

  function placeSplatter(point) {
    const spriteIndex = randomIndex(10);
    const color = randomMode ? randomColor() : selectedColor;
    stamp(spriteIndex, point, color, {
      rotation: randomBetween(-Math.PI, Math.PI),
      scale: randomBetween(0.82, 1.2)
    });
  }

  function placeBrushStamp(point, color, rotation = 0, renderAfter = true) {
    const spriteIndex = 10 + randomIndex(10);
    stamp(spriteIndex, point, color, {
      rotation: rotation + randomBetween(-0.16, 0.16),
      scale: randomBetween(0.82, 1.13),
      render: renderAfter
    });
  }

  function paintBrushSegment(from, to, color) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const spacing = Math.max(5, paintingSize * 0.2);
    const steps = Math.max(1, Math.ceil(distance / spacing));
    const direction = Math.atan2(to.y - from.y, to.x - from.x);

    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      placeBrushStamp({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t
      }, color, direction, false);
    }
    render();
  }

  function pointFromPointer(event) {
    return pointFromClient(event.clientX, event.clientY);
  }

  function pointFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * logicalWidth, 0, logicalWidth),
      y: clamp(((clientY - rect.top) / rect.height) * logicalHeight, 0, logicalHeight)
    };
  }

  function autoScrollVelocity(clientY) {
    const edge = Math.min(AUTO_SCROLL_EDGE, window.innerHeight * 0.24);
    if (clientY < edge) {
      const intensity = clamp((edge - clientY) / edge, 0, 1);
      return -AUTO_SCROLL_MAX_SPEED * intensity * intensity;
    }
    if (clientY > window.innerHeight - edge) {
      const intensity = clamp((clientY - (window.innerHeight - edge)) / edge, 0, 1);
      return AUTO_SCROLL_MAX_SPEED * intensity * intensity;
    }
    return 0;
  }

  function stopAutoScroll() {
    if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
    autoScrollFrame = 0;
    autoScrollLastTime = 0;
  }

  function continueStrokeAtClientPosition() {
    if (!pointerActive || !dragStarted || !lastPointerClient || !lastPoint) return;
    const point = pointFromClient(lastPointerClient.x, lastPointerClient.y);
    if (Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 0.5) return;
    paintBrushSegment(lastPoint, point, activeStrokeColor);
    lastPoint = point;
    keyboardCursor = point;
  }

  function autoScrollTick(timestamp) {
    autoScrollFrame = 0;
    if (!pointerActive || !dragStarted || !lastPointerClient) return;

    const velocity = autoScrollVelocity(lastPointerClient.y);
    if (!velocity) {
      autoScrollLastTime = 0;
      return;
    }

    const elapsed = autoScrollLastTime ? Math.min((timestamp - autoScrollLastTime) / 1000, 0.05) : 1 / 60;
    autoScrollLastTime = timestamp;
    const beforeScroll = window.scrollY;
    window.scrollBy(0, velocity * elapsed);
    if (window.scrollY !== beforeScroll) continueStrokeAtClientPosition();

    const atTop = window.scrollY <= 0 && velocity < 0;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1 && velocity > 0;
    if (!atTop && !atBottom && pointerActive) autoScrollFrame = requestAnimationFrame(autoScrollTick);
  }

  function updateAutoScroll() {
    if (!pointerActive || !dragStarted || !lastPointerClient || !autoScrollVelocity(lastPointerClient.y)) {
      stopAutoScroll();
      return;
    }
    if (!autoScrollFrame) autoScrollFrame = requestAnimationFrame(autoScrollTick);
  }

  function persistPainting() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        width: logicalWidth,
        height: logicalHeight,
        data: paintLayer.toDataURL("image/png")
      }));
    } catch {
      announce("The painting is visible, but this browser could not preserve it for navigation.");
    }
  }

  function setColor(nextColor, announceChange = true, colorLabel = "") {
    randomMode = nextColor === "random";
    if (!randomMode) selectedColor = nextColor;
    paletteSampleMarker?.classList.toggle("is-random", randomMode);

    paletteButtons.forEach((button) => {
      const active = button.dataset.color === nextColor;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (announceChange) {
      const activeButton = paletteButtons.find((button) => button.dataset.color === nextColor);
      announce(`${colorLabel || activeButton?.getAttribute("aria-label") || "Paint color"} selected.`);
    }
  }

  function preparePaletteLookup() {
    if (paletteLookupBytes) return true;
    if (!paletteColorMap?.data || !paletteColorMap.width || !paletteColorMap.height) return false;

    try {
      const binary = atob(paletteColorMap.data);
      paletteLookupBytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return paletteLookupBytes.length === paletteColorMap.width * paletteColorMap.height * 3;
    } catch (error) {
      console.error("The packaged palette color lookup could not be decoded.", error);
      paletteLookupBytes = null;
      return false;
    }
  }

  const PALETTE_OUTLINE = [
    [0.04, 0.55], [0.06, 0.38], [0.12, 0.22], [0.24, 0.11],
    [0.39, 0.04], [0.62, 0.04], [0.80, 0.09], [0.92, 0.20],
    [0.97, 0.35], [0.94, 0.51], [0.89, 0.68], [0.78, 0.84],
    [0.63, 0.94], [0.43, 0.97], [0.25, 0.91], [0.12, 0.79]
  ];

  function pointInPolygon(x, y, polygon) {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
      const [currentX, currentY] = polygon[index];
      const [previousX, previousY] = polygon[previous];
      const crosses = (currentY > y) !== (previousY > y)
        && x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function isPaletteSurface(normalizedX, normalizedY) {
    if (!pointInPolygon(normalizedX, normalizedY, PALETTE_OUTLINE)) return false;
    const holeX = (normalizedX - 0.714) / 0.073;
    const holeY = (normalizedY - 0.616) / 0.087;
    return holeX * holeX + holeY * holeY > 1;
  }

  function lookupPaletteColor(normalizedX, normalizedY) {
    if (!preparePaletteLookup()) return null;
    const mapX = clamp(Math.floor(normalizedX * paletteColorMap.width), 0, paletteColorMap.width - 1);
    const mapY = clamp(Math.floor(normalizedY * paletteColorMap.height), 0, paletteColorMap.height - 1);
    const offset = (mapY * paletteColorMap.width + mapX) * 3;
    return [paletteLookupBytes[offset], paletteLookupBytes[offset + 1], paletteLookupBytes[offset + 2]];
  }

  function palettePointFromPointer(clientX, clientY) {
    const board = palettePhoto.closest(".palette-board");
    const rect = board.getBoundingClientRect();
    const width = palettePhoto.clientWidth;
    const height = palettePhoto.clientHeight;
    const matrixValue = getComputedStyle(board).transform;
    const transform = matrixValue === "none" ? new DOMMatrix() : new DOMMatrix(matrixValue);
    const inverse = transform.inverse();
    const centeredPoint = new DOMPoint(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
    const localPoint = centeredPoint.matrixTransform(inverse);
    return { x: localPoint.x + width / 2, y: localPoint.y + height / 2 };
  }

  function samplePaletteAt(localX, localY) {
    if (!preparePaletteLookup()) {
      announce("The packaged palette color data could not be read; the active color was not changed.");
      return;
    }

    const boxWidth = palettePhoto.clientWidth;
    const boxHeight = palettePhoto.clientHeight;
    const naturalWidth = palettePhoto.naturalWidth || Number(palettePhoto.getAttribute("width")) || 1536;
    const naturalHeight = palettePhoto.naturalHeight || Number(palettePhoto.getAttribute("height")) || 1024;
    const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;
    const insetX = (boxWidth - renderedWidth) / 2;
    const insetY = (boxHeight - renderedHeight) / 2;

    if (localX < insetX || localY < insetY || localX > insetX + renderedWidth || localY > insetY + renderedHeight) {
      announce("Click a painted area of the palette to choose a color.");
      return;
    }

    const normalizedX = (localX - insetX) / renderedWidth;
    const normalizedY = (localY - insetY) / renderedHeight;
    if (!isPaletteSurface(normalizedX, normalizedY)) {
      announce("Click directly on the painted wooden palette to choose a color.");
      return;
    }

    const sampled = lookupPaletteColor(normalizedX, normalizedY);
    if (!sampled) {
      announce("That palette location could not be sampled; the active color was not changed.");
      return;
    }
    const [red, green, blue] = sampled;

    const sampledColor = `rgb(${red}, ${green}, ${blue})`;
    setColor(sampledColor, true, `RGB ${red}, ${green}, ${blue}`);

    if (paletteSampleMarker) {
      paletteSampleMarker.style.left = `${(localX / boxWidth) * 100}%`;
      paletteSampleMarker.style.top = `${(localY / boxHeight) * 100}%`;
      paletteSampleMarker.style.backgroundColor = sampledColor;
      paletteSampleMarker.classList.add("is-visible");
    }
  }

  function samplePaletteColor(event) {
    const point = palettePointFromPointer(event.clientX, event.clientY);
    samplePaletteAt(point.x, point.y);
  }

  function updateSize(nextSize, announceChange = false) {
    paintingSize = clamp(Number(nextSize), 28, 132);
    automaticSizePending = false;
    if (announceChange) announce(`Painting size ${Math.round(paintingSize)}.`);
    render();
  }

  function clearPainting() {
    paintContext.clearRect(0, 0, logicalWidth, logicalHeight);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // The visual reset still succeeds when storage is unavailable.
    }
    render();
    announce("Painting reset.");
  }

  function moveKeyboardCursor(dx, dy, shouldPaint) {
    const step = Math.max(7, paintingSize * 0.22);
    const previous = { ...keyboardCursor };
    keyboardCursor.x = clamp(keyboardCursor.x + dx * step, 0, logicalWidth);
    keyboardCursor.y = clamp(keyboardCursor.y + dy * step, 0, logicalHeight);

    if (shouldPaint) {
      if (!keyboardStrokeColor) keyboardStrokeColor = chooseStrokeColor();
      paintBrushSegment(previous, keyboardCursor, keyboardStrokeColor);
      persistPainting();
    } else {
      keyboardStrokeColor = null;
      render();
    }
    ensureKeyboardCursorVisible();
  }

  function ensureKeyboardCursorVisible() {
    if (!keyboardCursor || !logicalHeight) return;
    const rect = canvas.getBoundingClientRect();
    const viewportY = rect.top + (keyboardCursor.y / logicalHeight) * rect.height;
    const margin = Math.min(96, window.innerHeight * 0.22);
    let scrollAmount = 0;
    if (viewportY > window.innerHeight - margin) scrollAmount = viewportY - (window.innerHeight - margin);
    if (viewportY < margin) scrollAmount = viewportY - margin;
    if (Math.abs(scrollAmount) > 1) {
      window.scrollBy({ top: scrollAmount, left: 0, behavior: "smooth" });
    }
  }

  interactionSurface.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    const point = pointFromPointer(event);
    keyboardCursor = point;
    pointerActive = true;
    dragStarted = false;
    pointerStart = point;
    lastPoint = point;
    activePointerId = event.pointerId;
    lastPointerClient = { x: event.clientX, y: event.clientY };
    activeStrokeColor = chooseStrokeColor();
    interactionSurface.setPointerCapture(event.pointerId);
  });

  interactionSurface.addEventListener("pointermove", (event) => {
    if (!pointerActive) return;
    event.preventDefault();
    lastPointerClient = { x: event.clientX, y: event.clientY };
    const point = pointFromPointer(event);

    if (!dragStarted) {
      const movement = Math.hypot(point.x - pointerStart.x, point.y - pointerStart.y);
      const threshold = Math.max(6, logicalWidth * 0.004);
      if (movement < threshold) return;
      dragStarted = true;
      paintBrushSegment(pointerStart, point, activeStrokeColor);
    } else {
      paintBrushSegment(lastPoint, point, activeStrokeColor);
    }
    lastPoint = point;
    keyboardCursor = point;
    updateAutoScroll();
  });

  function finishPointerStroke(event) {
    if (!pointerActive) return;
    stopAutoScroll();
    const point = pointFromPointer(event);
    pointerActive = false;
    if (!dragStarted) {
      placeSplatter(point);
      announce("One randomized splatter placed.");
    } else {
      announce("Brush stroke added with randomized textures.");
    }
    dragStarted = false;
    pointerStart = null;
    lastPoint = null;
    activePointerId = null;
    lastPointerClient = null;
    if (interactionSurface.hasPointerCapture(event.pointerId)) interactionSurface.releasePointerCapture(event.pointerId);
    persistPainting();
  }

  function cancelPointerStroke(event) {
    if (!pointerActive) return;
    stopAutoScroll();
    pointerActive = false;
    dragStarted = false;
    pointerStart = null;
    lastPoint = null;
    activePointerId = null;
    lastPointerClient = null;
    if (interactionSurface.hasPointerCapture(event.pointerId)) interactionSurface.releasePointerCapture(event.pointerId);
    render();
  }

  interactionSurface.addEventListener("pointerup", finishPointerStroke);
  interactionSurface.addEventListener("pointercancel", cancelPointerStroke);
  interactionSurface.addEventListener("lostpointercapture", (event) => {
    if (pointerActive && event.pointerId === activePointerId) cancelPointerStroke(event);
  });

  interactionSurface.addEventListener("focus", () => {
    keyboardActive = true;
    if (!keyboardCursor) keyboardCursor = { x: logicalWidth * 0.5, y: logicalHeight * 0.5 };
    render();
    announce("Keyboard painting mode active.");
  });

  interactionSurface.addEventListener("blur", () => {
    keyboardActive = false;
    keyboardStrokeColor = null;
    render();
  });

  interactionSurface.addEventListener("keydown", (event) => {
    const arrowDirections = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };

    if (arrowDirections[event.key]) {
      event.preventDefault();
      const [dx, dy] = arrowDirections[event.key];
      moveKeyboardCursor(dx, dy, event.shiftKey);
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      placeSplatter(keyboardCursor);
      persistPainting();
      announce("Keyboard splatter placed.");
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "r") {
      event.preventDefault();
      setColor("random");
      return;
    }

    if (event.key === "[") {
      event.preventDefault();
      updateSize(paintingSize - 4, true);
      return;
    }

    if (event.key === "]") {
      event.preventDefault();
      updateSize(paintingSize + 4, true);
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      clearPainting();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      interactionSurface.blur();
      announce("Keyboard painting mode closed.");
    }
  });

  interactionSurface.addEventListener("keyup", (event) => {
    if (event.key === "Shift") keyboardStrokeColor = null;
  });

  paletteButtons.forEach((button) => {
    button.addEventListener("click", () => setColor(button.dataset.color));
  });

  if (palettePhoto) {
    preparePaletteLookup();
    palettePhoto.addEventListener("click", samplePaletteColor);
    palettePhoto.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      samplePaletteAt(palettePhoto.clientWidth / 2, palettePhoto.clientHeight / 2);
    });
  }

  sheet.addEventListener("load", () => {
    sheetReady = true;
    announce("Painting textures ready.");
  }, { once: true });
  sheet.addEventListener("error", () => {
    announce("The painting texture sheet could not be loaded.");
  }, { once: true });
  sheet.src = "Paint%20Splatter%20and%20Brush%20Stroke%20Asset%20Sheet.png";

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvas).observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas, { passive: true });
  }

  setColor(COLOR_VALUES[0], false);
  resizeCanvas();
})();
