(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const tiltItems = [...document.querySelectorAll(".tilt-card")];

  function resetTilt(item) {
    item.style.setProperty("--rx", "0deg");
    item.style.setProperty("--ry", "0deg");
    item.style.setProperty("--lift", "1");
    item.style.setProperty("--shadow-x", "0px");
    item.style.setProperty("--shadow-y", "20px");
  }

  function applyTilt(event) {
    const item = event.currentTarget;
    const bounds = item.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const maxTilt = 3.5;

    item.style.setProperty("--rx", `${(-y * maxTilt * 2).toFixed(2)}deg`);
    item.style.setProperty("--ry", `${(x * maxTilt * 2).toFixed(2)}deg`);
    item.style.setProperty("--lift", "1.015");
    item.style.setProperty("--shadow-x", `${(-x * 12).toFixed(1)}px`);
    item.style.setProperty("--shadow-y", `${(18 + y * 8).toFixed(1)}px`);
  }

  function configureTilt() {
    tiltItems.forEach((item) => {
      item.removeEventListener("pointermove", applyTilt);
      if (item._resetTilt) item.removeEventListener("pointerleave", item._resetTilt);
      resetTilt(item);

      if (reducedMotion.matches || !precisePointer.matches) return;

      item._resetTilt = () => resetTilt(item);
      item.addEventListener("pointermove", applyTilt, { passive: true });
      item.addEventListener("pointerleave", item._resetTilt, { passive: true });
    });
  }

  configureTilt();
  reducedMotion.addEventListener?.("change", configureTilt);
  precisePointer.addEventListener?.("change", configureTilt);
})();
