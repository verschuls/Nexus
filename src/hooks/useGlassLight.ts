import { useEffect, type RefObject } from "react";

/** Glass edges inside `ref` catch a highlight that follows the pointer. The
 * vars go on that element, not :root, so a mouse move restyles only it. */
export function useGlassLight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--light-x", `${e.clientX}px`);
        el.style.setProperty("--light-y", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}
