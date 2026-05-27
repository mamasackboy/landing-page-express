/* ============================================================================
 *  THE ONLY FILE YOU NEED TO EDIT.
 *  Paste your Stripe Payment Link below, save, and you are live.
 *  Get a Stripe link in 60 seconds: https://dashboard.stripe.com/payment-links
 * ========================================================================= */

window.CONFIG = {
  // 👇 PASTE YOUR STRIPE PAYMENT LINK HERE 👇
  STRIPE_LINK: "REPLACE_WITH_YOUR_STRIPE_LINK",

  // Where the contact form sends to. Pre-filled with your email.
  CONTACT_EMAIL: "gabbokbiz@gmail.com",

  // Optional: tweak the price across the whole site
  PRICE: "$99",
};

// ─── Do not edit below this line ────────────────────────────────────────────

(function () {
  "use strict";
  const CFG = window.CONFIG;
  const PLACEHOLDER = "REPLACE_WITH_YOUR_STRIPE_LINK";

  function init() {
    const stripeUnset = !CFG.STRIPE_LINK || CFG.STRIPE_LINK === PLACEHOLDER;

    // Wire every Pay button to the Stripe link
    document.querySelectorAll("[data-stripe]").forEach((el) => {
      if (stripeUnset) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          alert(
            "⚠️  Stripe link not set yet.\n\n" +
              "Open config.js and paste your Stripe Payment Link into STRIPE_LINK.\n\n" +
              "Get one in 60 seconds:\nhttps://dashboard.stripe.com/payment-links",
          );
        });
        // Don't aria-disabled — the button DOES do something (shows the alert).
        el.dataset.stripeReady = "false";
      } else {
        el.setAttribute("href", CFG.STRIPE_LINK);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
        el.dataset.stripeReady = "true";
      }
    });

    // Inject price into any [data-price] element
    document.querySelectorAll("[data-price]").forEach((el) => {
      if (CFG.PRICE) el.textContent = CFG.PRICE;
    });

    // Banner if Stripe isn't set (dismissible)
    if (stripeUnset && !sessionStorage.getItem("dismissed-stripe-banner")) {
      const banner = document.createElement("div");
      banner.id = "stripe-banner";
      banner.style.cssText =
        "position:fixed;top:0;left:0;right:0;background:#facc15;color:#000;" +
        "padding:11px 16px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;" +
        "text-align:center;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.25);" +
        "display:flex;align-items:center;justify-content:center;gap:12px;";
      banner.innerHTML =
        '<span>⚠️ <strong>Stripe link not set</strong> — payment buttons are disabled. Edit <code style="background:rgba(0,0,0,0.12);padding:2px 7px;border-radius:5px;font-family:ui-monospace,Menlo,monospace">config.js</code> to go live.</span>' +
        '<button type="button" aria-label="Dismiss" id="stripe-banner-x" style="background:transparent;border:0;cursor:pointer;font-size:20px;line-height:1;color:#000;padding:0 4px;">×</button>';
      document.body.appendChild(banner);
      // Push body down so banner doesn't cover nav
      document.body.style.paddingTop = banner.offsetHeight + "px";

      document.getElementById("stripe-banner-x").addEventListener("click", () => {
        banner.remove();
        document.body.style.paddingTop = "0";
        sessionStorage.setItem("dismissed-stripe-banner", "1");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
