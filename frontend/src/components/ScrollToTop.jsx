import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scrolls to the top on forward navigation (clicking a link), but restores the
// previous scroll position on back/forward navigation (browser back button, or
// navigate(-1)) — so leaving a page and returning lands exactly where you were.
const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
  const positions = useRef({});

  // Continuously record the scroll position for the current history entry.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const onScroll = () => {
      positions.current[key] = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  // On navigation: restore on back/forward (POP), otherwise scroll to top.
  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    const saved = positions.current[key] ?? 0;
    if (saved === 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // The destination page may still be growing as its images/content load,
    // so a single scroll would clamp short. Re-assert the saved position each
    // frame until it actually sticks (or ~1s passes) — and stop early if the
    // user starts scrolling themselves, so we never fight their input.
    let frame = 0;
    let raf;
    let aborted = false;
    const abort = () => { aborted = true; };

    const restore = () => {
      if (aborted) return;
      window.scrollTo({ top: saved, left: 0, behavior: "instant" });
      frame++;
      if (Math.abs(window.scrollY - saved) > 2 && frame < 60) {
        raf = requestAnimationFrame(restore);
      }
    };
    raf = requestAnimationFrame(restore);

    window.addEventListener("wheel", abort, { passive: true });
    window.addEventListener("touchstart", abort, { passive: true });
    window.addEventListener("keydown", abort);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", abort);
      window.removeEventListener("touchstart", abort);
      window.removeEventListener("keydown", abort);
    };
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;
