/* ============================================================================
 * Capture portfolio thumbnails — real screenshots of the rendered sample
 * pages, optimized for the index gallery cards.
 *
 * Each card thumb is displayed at ~320×200 (16:10). We capture at 1600×1000
 * (5x retina) and let the browser downscale. JPEG quality 80 keeps file size
 * under ~80KB while staying crisp.
 *
 * Usage:
 *   node capture-thumbs.js                # source local server at :8765
 *   node capture-thumbs.js https://...    # source live URL
 * ========================================================================= */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "thumbs");

const BASE = process.argv[2] || "http://localhost:8765/";

const SAMPLES = [
  { slug: "dogwalker", path: "samples/dogwalker/" },
  { slug: "pilates",   path: "samples/pilates/" },
];

async function run() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  for (const sample of SAMPLES) {
    const url = new URL(sample.path, BASE).toString();
    process.stdout.write(`Capturing ${sample.slug} ... `);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Hide the sample-badge so the thumb looks like a real product shot
    await page.addStyleTag({ content: ".sample-badge { display: none !important; }" });

    // Wait for fonts to settle
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);

    const path = join(OUT, sample.slug + ".png");
    await page.screenshot({ path, fullPage: false, clip: { x: 0, y: 0, width: 1600, height: 1000 } });
    process.stdout.write(`✓ ${path}\n`);
  }

  await browser.close();
  process.stdout.write(`\nDone. Thumbs in ${OUT}\n`);
}

run().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
