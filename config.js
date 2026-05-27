/* ============================================================================
 *  THE ONLY FILE YOU NEED TO EDIT.
 *  Paste your Stripe Payment Link below, save, and you are live.
 *  Get a Stripe link in 60 seconds: https://dashboard.stripe.com/payment-links
 * ========================================================================= */

const CONFIG = {
  // 👇 PASTE YOUR STRIPE PAYMENT LINK HERE 👇
  STRIPE_LINK: "REPLACE_WITH_YOUR_STRIPE_LINK",

  // Where the contact form sends to. Pre-filled with your email.
  CONTACT_EMAIL: "gabbokbiz@gmail.com",

  // Optional: tweak the price across the whole site
  PRICE: "$99",
};

// ─── Do not edit below this line ────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const stripeUnset = CONFIG.STRIPE_LINK === "REPLACE_WITH_YOUR_STRIPE_LINK";

  // Wire every "Pay" button to the Stripe link
  document.querySelectorAll("[data-stripe]").forEach((el) => {
    if (stripeUnset) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        alert(
          "⚠️  Stripe link not set yet.\n\n" +
          "Open config.js and paste your Stripe Payment Link into STRIPE_LINK.\n\n" +
          "Get one in 60 seconds: https://dashboard.stripe.com/payment-links",
        );
      });
      el.style.opacity = "0.85";
      el.title = "Set STRIPE_LINK in config.js first";
    } else {
      el.setAttribute("href", CONFIG.STRIPE_LINK);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
  });

  // Inject price into any [data-price] element
  document.querySelectorAll("[data-price]").forEach((el) => {
    el.textContent = CONFIG.PRICE;
  });

  // Show a one-time banner if Stripe isn't set, so user doesn't ship broken
  if (stripeUnset && !sessionStorage.getItem("dismissed-stripe-banner")) {
    const banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;background:#facc15;color:#000;padding:10px 16px;font-family:system-ui;font-size:14px;text-align:center;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.1);";
    banner.innerHTML =
      '⚠️ Stripe link not set — payment buttons are disabled. Edit <code style="background:rgba(0,0,0,0.1);padding:2px 6px;border-radius:4px;">config.js</code> to go live. <button style="background:transparent;border:0;cursor:pointer;font-size:18px;margin-left:12px;" onclick="this.parentElement.remove();sessionStorage.setItem(\'dismissed-stripe-banner\',\'1\')">×</button>';
    document.body.appendChild(banner);
  }
});
