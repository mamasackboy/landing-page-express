# Landing Page Express — Money-Day Kit

**Goal:** $50–$200 today, cold-start, $0 budget.
**Strategy:** One productized offer (`$99 landing page in 24 hours`), deployed and posted into 4 buyer channels.

The site is live at **https://mamasackboy.github.io/landing-page-express/** and the repo is **https://github.com/mamasackboy/landing-page-express**.

---

## 🚦 To go live, do this one thing

Open **`config.js`** (top of the repo). Paste your Stripe Payment Link into the first line:

```js
STRIPE_LINK: "https://buy.stripe.com/YOUR_LINK_HERE",
```

Save, then:

```bash
git add config.js && git commit -m "live" && git push
```

GitHub Pages re-deploys in 1–2 minutes. That's it. **You are open for business.**

> Don't have a Stripe link yet? Get one in 60 seconds at
> https://dashboard.stripe.com/payment-links — set price to $99, name it
> "Landing Page Express," and copy the resulting `https://buy.stripe.com/...` URL.

A yellow banner appears on every page while the placeholder is in place, so you can't accidentally ship broken payment buttons.

---

## What's in this repo

```
money-day/
├── config.js                ← THE ONE FILE YOU EDIT (Stripe link goes here)
├── index.html               ← Sales page (the live URL above)
├── thanks.html              ← Post-purchase intake form (3 questions → your email)
├── thanks-submitted.html    ← Confirmation page after intake is sent
├── styles.css               ← Shared styles for the sales pages
├── favicon.svg              ← Brand mark
├── og-image.svg             ← Social share card (Twitter/LinkedIn unfurls)
├── samples/
│   ├── dogwalker/index.html ← Portfolio sample #1 (Brooklyn dog-walking biz)
│   └── pilates/index.html   ← Portfolio sample #2 (Hudson NY pilates studio)
├── posts/                   ← Copy-paste templates for buyer channels
│   ├── 1-reddit-forhire.md
│   ├── 2-upwork-proposal.md
│   ├── 3-reddit-slavelabour-cv.md
│   ├── 4-linkedin-dm.md
│   └── 5-intake-and-delivery.md
├── PLAYBOOK.md              ← Hour-by-hour timeline for today
├── sitemap.xml              ← SEO
├── robots.txt               ← SEO
├── vercel.json              ← Optional Vercel config (not used — GH Pages only)
├── netlify.toml             ← Optional Netlify config
└── .nojekyll                ← Tells GH Pages not to run Jekyll
```

---

## Hour-by-hour today

See **`PLAYBOOK.md`** for the full timeline. Short version:

1. **Now:** Edit `config.js` → paste Stripe link → push.
2. **Hour 1:** Post on r/forhire and r/slavelabour (`posts/1-reddit-forhire.md`, `posts/3-reddit-slavelabour-cv.md`).
3. **Hour 1–2:** Send 10 Upwork proposals (`posts/2-upwork-proposal.md`).
4. **Hour 2:** LinkedIn feed post + 5 cold DMs (`posts/4-linkedin-dm.md`).
5. **Hour 2–8:** Refresh inboxes every 20 min. Reply within 5 min — speed kills.
6. **First sale:** Open `posts/5-intake-and-delivery.md` — copy-paste the intake confirmation.
7. **Hours 4–24:** Build and ship the site.

---

## How the intake form works

When someone pays via Stripe, set the Stripe Payment Link's **success URL** to:

```
https://mamasackboy.github.io/landing-page-express/thanks.html
```

The buyer lands on `thanks.html`, fills 3 short questions, and submits. The form posts to **Formsubmit.co** which forwards every submission to `gabbokbiz@gmail.com`. **First submission requires you to confirm the email address once** (Formsubmit sends you a confirmation link). After that, every order arrives in your inbox as a clean tabular email.

Want a different inbox? Edit the `action="..."` attribute in `thanks.html` (line ~30) or change `CONTACT_EMAIL` in `config.js`.

---

## How to verify before going live

```bash
# Spin up a local server
cd /c/Users/drama/money-day
python -m http.server 8000
# Then open http://localhost:8000/
```

Click every CTA — without a real Stripe link, buttons show a friendly alert telling you to set it. Everything else (intake form, portfolio links, internal nav) works locally.

---

## How to take it down

```bash
gh repo delete mamasackboy/landing-page-express --yes
```

Or just disable Pages from repo Settings → Pages.

---

## When today is over

The site keeps converting for weeks. Don't take it down unless you want to. Re-run the posts weekly and conversion rates double once you have a real testimonial to swap into a sample slot. Replace `samples/dogwalker/` or `samples/pilates/` with screenshots of real client work as soon as you deliver one — real client work is 10× more credible than spec.
