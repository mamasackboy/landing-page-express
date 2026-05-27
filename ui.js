/* ============================================================================
 * UI behaviors: FAQ accordion, intersection-fade for sections.
 * Pure vanilla. No deps. Defers until DOMContentLoaded.
 * ========================================================================= */

(function () {
  "use strict";

  function initFaq() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      const body = item.querySelector(".faq-body");
      if (!trigger || !body) return;

      // Set initial max-height for the open item
      if (item.dataset.open === "true") {
        body.style.maxHeight = body.scrollHeight + "px";
      }

      trigger.addEventListener("click", () => {
        const isOpen = item.dataset.open === "true";

        // Close all
        items.forEach((other) => {
          other.dataset.open = "false";
          const otherTrigger = other.querySelector(".faq-trigger");
          const otherBody = other.querySelector(".faq-body");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          if (otherBody) otherBody.style.maxHeight = "0px";
        });

        // Open this one if it wasn't already open
        if (!isOpen) {
          item.dataset.open = "true";
          trigger.setAttribute("aria-expanded", "true");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    });
  }

  function initSectionFade() {
    if (!("IntersectionObserver" in window)) return;
    const sections = document.querySelectorAll("section, .trust");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation =
              "fade-up 800ms cubic-bezier(0.22, 0.68, 0, 1) backwards";
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    sections.forEach((s) => {
      s.style.opacity = "0";
      observer.observe(s);
      // Failsafe: if observer never fires (e.g. in test envs), reveal after 1s
      setTimeout(() => {
        if (s.style.opacity === "0") s.style.opacity = "1";
      }, 1200);
    });
    // When animation completes, lock opacity to 1
    document.addEventListener("animationend", (e) => {
      if (e.target.matches("section, .trust")) {
        e.target.style.opacity = "1";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initFaq();
      initSectionFade();
    });
  } else {
    initFaq();
    initSectionFade();
  }
})();
