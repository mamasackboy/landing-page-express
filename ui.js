/* ============================================================================
 * UI behaviors: FAQ accordion + scroll-based h2 entrance fade.
 * Pure vanilla. No deps. Defers until DOMContentLoaded.
 *
 * NB: section opacity is NEVER manipulated here — sections must remain visible
 * by default. A previous version set style.opacity=0 then relied on an
 * IntersectionObserver to reveal them, which silently broke any section that
 * didn't trigger the observer (fullPage screenshot capture, slow JS load,
 * disabled JS). Removed.
 * ========================================================================= */

(function () {
  "use strict";

  function initFaq() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      const body = item.querySelector(".faq-body");
      if (!trigger || !body) return;

      if (item.dataset.open === "true") {
        body.style.maxHeight = body.scrollHeight + "px";
      }

      trigger.addEventListener("click", () => {
        const isOpen = item.dataset.open === "true";

        items.forEach((other) => {
          other.dataset.open = "false";
          const otherTrigger = other.querySelector(".faq-trigger");
          const otherBody = other.querySelector(".faq-body");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          if (otherBody) otherBody.style.maxHeight = "0px";
        });

        if (!isOpen) {
          item.dataset.open = "true";
          trigger.setAttribute("aria-expanded", "true");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    });

    // Recompute open item height on resize (text wraps differently)
    let rafId = null;
    window.addEventListener("resize", () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const open = document.querySelector('.faq-item[data-open="true"] .faq-body');
        if (open) open.style.maxHeight = open.scrollHeight + "px";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaq);
  } else {
    initFaq();
  }
})();
