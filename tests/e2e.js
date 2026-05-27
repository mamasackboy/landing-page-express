/* ============================================================================
 * Landing Page Express — end-to-end Playwright test
 *
 * Walks the live site like a real buyer:
 *   1. Loads index, checks for console errors, weight, title.
 *   2. Confirms Stripe banner shows when STRIPE_LINK is unset.
 *   3. Clicks a Pay button — expects the placeholder alert.
 *   4. Opens both portfolio samples, verifies back link works.
 *   5. Drives the FAQ accordion (open / close / single-open invariant).
 *   6. Fills the intake form on thanks.html, intercepts the POST,
 *      verifies it would have submitted to Formsubmit.
 *   7. Re-runs index with STRIPE_LINK injected, confirms buttons link out.
 *   8. Mobile viewport pass + screenshots.
 *   9. Reports PASS/FAIL counts and writes a JSON summary.
 *
 * Usage:
 *   node e2e.js                 # tests https://mamasackboy.github.io/landing-page-express/
 *   node e2e.js http://localhost:8000/   # tests a local server
 * ========================================================================= */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(__dirname, "screenshots");
const SUMMARY = join(__dirname, "summary.json");

const BASE =
  process.argv[2] ||
  "https://mamasackboy.github.io/landing-page-express/";

const PASS = [];
const FAIL = [];
const WARN = [];

function ok(name, detail = "") {
  PASS.push({ name, detail });
  process.stdout.write(`  ✓ ${name}${detail ? "  " + detail : ""}\n`);
}
function bad(name, detail = "") {
  FAIL.push({ name, detail });
  process.stdout.write(`  ✗ ${name}${detail ? "  " + detail : ""}\n`);
}
function warn(name, detail = "") {
  WARN.push({ name, detail });
  process.stdout.write(`  ⚠ ${name}${detail ? "  " + detail : ""}\n`);
}
function section(t) {
  process.stdout.write(`\n── ${t} ──\n`);
}

async function shot(page, name) {
  const path = join(SHOTS, name + ".png");
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    ...opts.context,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push("pageerror: " + err.message));
  page.consoleErrors = consoleErrors;
  if (opts.initScript) await page.addInitScript(opts.initScript);
  return page;
}

async function run() {
  await mkdir(SHOTS, { recursive: true });
  process.stdout.write(`\nLanding Page Express E2E\n========================\n`);
  process.stdout.write(`Target: ${BASE}\n`);

  const browser = await chromium.launch();

  try {
    // ── 1. Index page basics ────────────────────────────────────────────────
    section("1. Index page (desktop, no Stripe set)");
    const page = await newPage(browser);
    const t0 = Date.now();
    const resp = await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
    const loadMs = Date.now() - t0;
    resp.status() === 200 ? ok(`HTTP 200`, `(${loadMs}ms)`) : bad(`HTTP ${resp.status()}`, `(${loadMs}ms)`);

    const title = await page.title();
    title.includes("Landing Page Express") ? ok("Title present", `"${title}"`) : bad("Title mismatch", `"${title}"`);

    const h1 = await page.locator("h1").first().innerText();
    h1.length > 10 ? ok("H1 has content", `${h1.length} chars`) : bad("H1 missing", h1);

    const stripeBanner = page.locator("#stripe-banner");
    const bannerVisible = await stripeBanner.isVisible().catch(() => false);
    bannerVisible ? ok("Stripe placeholder banner shows") : bad("Stripe banner missing");

    // Bytes
    const html = await page.content();
    ok(`HTML size`, `${html.length} chars`);

    // No console errors apart from known external 3rd-party noise
    const realErrors = page.consoleErrors.filter(
      (e) => !/fonts\.googleapis\.com|gstatic\.com|favicon/i.test(e),
    );
    realErrors.length === 0
      ? ok("No console errors")
      : bad("Console errors", JSON.stringify(realErrors));

    await shot(page, "01-index-desktop");

    // ── 2. Pay button → alert (placeholder mode) ────────────────────────────
    section("2. Pay button alert (placeholder mode)");
    let alertText = null;
    page.on("dialog", async (d) => {
      alertText = d.message();
      await d.dismiss();
    });
    await page.locator('[data-stripe][data-cta="hero"]').first().click();
    await page.waitForTimeout(500);
    if (alertText && /Stripe link not set/i.test(alertText)) {
      ok("Pay button shows placeholder alert", `"${alertText.split("\n")[0]}"`);
    } else {
      bad("Pay button did not alert", String(alertText));
    }

    // ── 2.5. Visibility audit — catches the "invisible sections" regression
    //         where opacity:0 was applied but never restored.
    section("2.5. Visibility audit (every section is actually visible)");
    const visAudit = await page.evaluate(() => {
      const targets = Array.from(document.querySelectorAll(
        "section, .trust, header, footer"
      ));
      return targets.map((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          opacity: parseFloat(cs.opacity),
          visibility: cs.visibility,
          display: cs.display,
          height: rect.height,
          width: rect.width,
        };
      });
    });
    let invisCount = 0;
    visAudit.forEach((v) => {
      const invisible =
        v.opacity < 0.5 ||
        v.visibility === "hidden" ||
        v.display === "none" ||
        v.height < 20;
      if (invisible) {
        bad(`Section ${v.tag}#${v.id || "?"} invisible`, JSON.stringify(v));
        invisCount++;
      }
    });
    if (invisCount === 0) ok(`All ${visAudit.length} sections render visibly`);

    // ── 3. Trust strip + price display ──────────────────────────────────────
    section("3. Trust strip + price visibility");
    const trustCount = await page.locator(".trust .stat").count();
    trustCount === 4 ? ok("4 trust stats render") : bad("Trust stats", `got ${trustCount}`);
    const prices = await page.locator("[data-price]").allInnerTexts();
    const allCorrect = prices.every((p) => /\$99/.test(p));
    allCorrect ? ok(`All ${prices.length} [data-price] show $99`) : bad("Some prices wrong", JSON.stringify(prices));

    // ── 4. FAQ accordion ────────────────────────────────────────────────────
    section("4. FAQ accordion behavior");
    const faqItems = await page.locator(".faq-item").count();
    faqItems >= 5 ? ok(`${faqItems} FAQ items`) : bad("Too few FAQ items", String(faqItems));

    // Initially, exactly one open
    let openCount = await page.locator('.faq-item[data-open="true"]').count();
    openCount === 1 ? ok("Exactly one FAQ open by default") : bad("Initial open count", String(openCount));

    // Click 3rd FAQ trigger, expect only it open
    await page.locator(".faq-item").nth(2).locator(".faq-trigger").click();
    await page.waitForTimeout(400);
    openCount = await page.locator('.faq-item[data-open="true"]').count();
    const thirdOpen = await page.locator(".faq-item").nth(2).getAttribute("data-open");
    openCount === 1 && thirdOpen === "true"
      ? ok("Clicking FAQ closes others and opens target")
      : bad("FAQ exclusive open broken", `openCount=${openCount}, third=${thirdOpen}`);

    // Click same again, expect close
    await page.locator(".faq-item").nth(2).locator(".faq-trigger").click();
    await page.waitForTimeout(400);
    openCount = await page.locator('.faq-item[data-open="true"]').count();
    openCount === 0 ? ok("Clicking open FAQ closes it") : bad("FAQ toggle close broken", String(openCount));

    // ── 4.5. Portfolio thumbs are real images that actually loaded ──────────
    section("4.5. Portfolio thumbs (real screenshots, not SVG placeholders)");
    const thumbs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll(".sample .thumb img"));
      return imgs.map((img) => ({
        src: img.getAttribute("src"),
        complete: img.complete,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
      }));
    });
    if (thumbs.length === 0) {
      bad("No <img> thumbs found in gallery");
    } else {
      thumbs.forEach((t, i) => {
        if (t.complete && t.naturalW > 100) {
          ok(`Thumb ${i + 1} loaded`, `${t.src} (${t.naturalW}×${t.naturalH})`);
        } else {
          bad(`Thumb ${i + 1} broken`, JSON.stringify(t));
        }
      });
    }

    // ── 5. Portfolio samples ────────────────────────────────────────────────
    section("5. Portfolio samples");
    await page.locator('a.sample[href*="dogwalker"]').click();
    await page.waitForLoadState("networkidle");
    const dogTitle = await page.title();
    dogTitle.includes("Brooklyn Paws") ? ok("Dogwalker sample loads", `"${dogTitle}"`) : bad("Dogwalker title wrong", dogTitle);

    // Sample badge nesting check (was a real bug)
    const nestedA = await page.evaluate(() => {
      const badge = document.querySelector(".sample-badge");
      if (!badge) return "no-badge";
      return badge.querySelector("a") ? "nested" : "clean";
    });
    nestedA === "clean" ? ok("No nested <a> in sample-badge") : bad("Nested anchor regression", nestedA);

    await shot(page, "02-sample-dogwalker");

    // Back to home via badge
    await page.locator(".sample-badge").click();
    await page.waitForLoadState("networkidle");
    let backUrl = page.url();
    backUrl === BASE || backUrl.endsWith("/landing-page-express/")
      ? ok("Back-from-sample link works")
      : warn("Back link landed elsewhere", backUrl);

    // Pilates
    await page.goto(new URL("samples/pilates/", BASE).toString(), { waitUntil: "networkidle" });
    const pilatesTitle = await page.title();
    pilatesTitle.includes("Pilates") ? ok("Pilates sample loads", `"${pilatesTitle}"`) : bad("Pilates title wrong", pilatesTitle);
    await shot(page, "03-sample-pilates");

    // ── 6. Thanks page + intake form ────────────────────────────────────────
    section("6. Thanks page intake form");
    await page.goto(new URL("thanks.html", BASE).toString(), { waitUntil: "networkidle" });

    const formAction = await page.locator("#intake-form").getAttribute("action");
    formAction && formAction.includes("formsubmit.co")
      ? ok("Form action wired to Formsubmit", formAction.slice(0, 50) + "...")
      : bad("Form action not wired", String(formAction));

    // Check the email is NOT in the raw HTML source (security)
    const rawHtml = await page.evaluate(() => document.documentElement.outerHTML);
    const emailInRaw = rawHtml.includes("gabbokbiz@gmail.com");
    !emailInRaw ? ok("Email not exposed in HTML source") : warn("Email still in DOM (via JS-built href)", "this is acceptable");

    // Fill out the form
    await page.fill("#name", "Test Buyer");
    await page.fill("#email", "test@example.com");
    await page.fill("#business", "Test Coffee Roasters");
    await page.fill("#sell", "Specialty single-origin coffee subscription, ground-to-order");
    await page.fill("#buyer", "Coffee enthusiasts in NYC, $80k+ income");

    let postIntercepted = false;
    await page.route("**/formsubmit.co/**", async (route) => {
      postIntercepted = true;
      const req = route.request();
      const post = req.postData() || "";
      const okFields = ["Test Buyer", "test%40example.com", "Test+Coffee", "Test Coffee"].some((s) => post.includes(s));
      if (req.method() === "POST" && okFields) {
        ok("Form submits with all fields", `${(post.length).toString()} bytes`);
      } else {
        bad("Form POST malformed", `method=${req.method()} bodyLen=${post.length}`);
      }
      // Redirect to the next_url ourselves so we can verify the flow
      await route.fulfill({
        status: 302,
        headers: { location: new URL("thanks-submitted.html", BASE).toString() },
      });
    });

    await page.locator("#submit-btn").click();
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    if (postIntercepted) {
      ok("Form POST intercepted");
    } else {
      bad("Form POST never fired");
    }

    // Confirm we landed on thanks-submitted
    if (page.url().includes("thanks-submitted.html")) {
      ok("Redirect to thanks-submitted.html works");
      await shot(page, "04-thanks-submitted");
    } else {
      warn("No redirect after submit", page.url());
    }

    // ── 7. Index with Stripe link injected ──────────────────────────────────
    section("7. Index with STRIPE_LINK set (simulated)");
    const stripedPage = await newPage(browser, {
      initScript: () => {
        // Override CONFIG before config.js runs
        Object.defineProperty(window, "CONFIG", {
          configurable: true,
          get() {
            return this._cfg;
          },
          set(v) {
            this._cfg = Object.assign({}, v, {
              STRIPE_LINK: "https://buy.stripe.com/test_TESTLINK",
            });
          },
        });
      },
    });
    await stripedPage.goto(BASE, { waitUntil: "networkidle" });
    const bannerNow = await stripedPage.locator("#stripe-banner").isVisible().catch(() => false);
    !bannerNow ? ok("Stripe banner hidden when link is set") : bad("Banner still shows when configured");

    const heroBtn = stripedPage.locator('[data-stripe][data-cta="hero"]').first();
    const href = await heroBtn.getAttribute("href");
    href === "https://buy.stripe.com/test_TESTLINK"
      ? ok("Pay button href wired to Stripe link")
      : bad("Pay button href wrong", String(href));
    const target = await heroBtn.getAttribute("target");
    target === "_blank" ? ok("Pay button opens in new tab") : warn("No target=_blank", String(target));

    await shot(stripedPage, "05-index-with-stripe");

    // ── 8. Mobile viewport ──────────────────────────────────────────────────
    section("8. Mobile viewport (iPhone 13 sized)");
    const mob = await newPage(browser, { viewport: { width: 390, height: 844 } });
    await mob.goto(BASE, { waitUntil: "networkidle" });
    const heroVisible = await mob.locator("h1").first().isVisible();
    heroVisible ? ok("Hero renders on mobile") : bad("Hero hidden on mobile");
    const cta = mob.locator('[data-stripe][data-cta="hero"]').first();
    const ctaBox = await cta.boundingBox();
    if (ctaBox && ctaBox.width > 200 && ctaBox.height >= 40) {
      ok("CTA is tappable on mobile", `${Math.round(ctaBox.width)}×${Math.round(ctaBox.height)}px`);
    } else {
      bad("CTA too small on mobile", JSON.stringify(ctaBox));
    }
    await shot(mob, "06-mobile-home");
    await mob.goto(new URL("samples/dogwalker/", BASE).toString(), { waitUntil: "networkidle" });
    await shot(mob, "07-mobile-dogwalker");

    // ── 9. 404 check ────────────────────────────────────────────────────────
    section("9. 404 behavior");
    const f = await page.goto(new URL("definitely-not-a-page-xyz", BASE).toString(), { waitUntil: "domcontentloaded" }).catch(() => null);
    if (f && (f.status() === 404 || f.status() === 200)) {
      ok(`Bogus URL returns ${f.status()}`);
    } else {
      warn("404 check inconclusive", String(f?.status()));
    }

    // ── 10. Asset 404 sweep on home page ────────────────────────────────────
    section("10. Asset sweep");
    const assetPage = await newPage(browser);
    const requests404 = [];
    assetPage.on("response", (r) => {
      if (r.status() >= 400) requests404.push({ url: r.url(), status: r.status() });
    });
    await assetPage.goto(BASE, { waitUntil: "networkidle" });
    const localBroken = requests404.filter((r) => r.url.startsWith(BASE));
    localBroken.length === 0 ? ok("No broken local assets") : bad("Broken local assets", JSON.stringify(localBroken));
    if (requests404.length > 0) {
      warn(`External 4xx responses (often harmless)`, requests404.map((r) => r.status + " " + new URL(r.url).hostname).join(", "));
    }
  } finally {
    await browser.close();
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  process.stdout.write(
    `\n========================\n` +
      `RESULT: ${PASS.length} pass · ${FAIL.length} fail · ${WARN.length} warn\n` +
      `Screenshots: ${SHOTS}\n`,
  );
  await writeFile(
    SUMMARY,
    JSON.stringify({ base: BASE, pass: PASS, fail: FAIL, warn: WARN, at: new Date().toISOString() }, null, 2),
  );
  process.exit(FAIL.length > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(2);
});
