# Money Day — Operations Manual

Your goal: $50-200 today, cold-start, $0 budget.

This folder contains everything you need to make that happen. Files in **execution order**:

```
money-day/
├── PLAYBOOK.md                 ← read first, hour-by-hour timeline
├── offer.html                  ← your sales page, deploy to Vercel
├── portfolio/
│   ├── dogwalker.html         ← sample 1, deploy and screenshot for proof
│   └── pilates.html           ← sample 2, deploy and screenshot for proof
├── posts/
│   ├── 1-reddit-forhire.md    ← copy-paste, post on r/forhire
│   ├── 2-upwork-proposal.md   ← template for 10 personalized proposals
│   ├── 3-reddit-slavelabour-cv.md  ← backup $39 CV gig for volume
│   ├── 4-linkedin-dm.md       ← feed post + 10 cold DMs
│   └── 5-intake-and-delivery.md  ← post-sale scripts
└── README.md                   ← you are here
```

---

## Quickstart — first 60 minutes

### 1. Set up payment (5 min)

Go to **https://dashboard.stripe.com/payment-links** → "New" → set $99 → name it "Landing Page Express." Copy the link.

If you don't have Stripe yet, fastest alternatives:
- **PayPal.me/[yourname]** — instant, just append `/99` to the URL
- **Stripe Atlas** if you don't have a business — skip, takes too long
- **Buy Me a Coffee** — set custom amount, works in minutes

### 2. Deploy the offer page (10 min)

Replace `https://buy.stripe.com/REPLACE_ME` in `offer.html` with your payment link (2 occurrences). Then deploy.

**Option A — Vercel (recommended):**
```powershell
cd C:\Users\drama\money-day
npx vercel --prod
```
Choose defaults. You'll get a URL like `money-day-xxx.vercel.app`. Done.

**Option B — Netlify Drop (no CLI):**
1. Zip the `money-day` folder
2. Go to https://app.netlify.com/drop
3. Drag the zip in
4. Get a URL instantly

**Option C — GitHub Pages:**
Push to a new repo, Settings → Pages → enable on main branch.

### 3. Deploy the two portfolio samples (10 min)

Same as above, but you can deploy all three pages at once if you put them under the same folder. Vercel will serve `/portfolio/dogwalker.html` and `/portfolio/pilates.html` automatically.

After deploy, take screenshots of each portfolio page on:
- Desktop (1440px wide)
- Mobile (375px wide)

Save them to use as proof when responding to clients. Use **browser dev tools** → toggle device toolbar → screenshot.

### 4. Update placeholders (5 min)

In every `posts/*.md` file, replace `[YOUR-URL-HERE]` with your deployed Vercel URL.

In `posts/5-intake-and-delivery.md`, replace `[STRIPE-PAYMENT-LINK]` with your Stripe link.

### 5. Post (30 min)

In this exact order:
1. **LinkedIn feed post** (warmest channel, slowest to convert but free reach)
2. **r/forhire** [FOR HIRE] post
3. **r/slavelabour** [OFFER] post for the CV gig
4. **Upwork** — 10 personalized proposals to fresh "landing page" jobs
5. **LinkedIn DMs** — 5 in morning, 5 in afternoon

Then keep refreshing each channel every 20 minutes for replies.

---

## The single most important thing

**Reply to interest within 5 minutes.** Conversion drops ~50% for every 10 minutes you take to respond. Set your phone to ping for:
- Reddit DMs
- Upwork inbox
- LinkedIn messages
- Stripe payment notifications

If you're not at your desk, set an out-of-office reply that says "back at 3pm, will reply then — payment link if you want to grab a slot: [link]" and leave the door open.

---

## If you hit the goal

Don't stop. Run the same playbook tomorrow. Each delivery generates a review or testimonial, and your conversion rate doubles by week two.

## If you don't hit the goal

The posts will keep getting views for 1-3 weeks. Most of your replies on r/forhire and Upwork will come in the 24-72 hours AFTER posting, not in the same hour. The funnel is built. Walk away and check it tomorrow.

If after 3 days you still have zero leads, the diagnosis is one of:
1. **Offer is wrong for the channels** — try the CV gig as primary, landing page as backup
2. **Posts got buried** — re-post with a sharper title and a portfolio screenshot embedded
3. **Trust deficit** — your portfolio page needs a real testimonial, even from a friend

---

## Files you can edit later

- `offer.html` is hand-coded HTML/CSS in one file. Edit copy, colors, prices freely.
- Portfolio samples are templates — once you deliver a real client site, **replace one of these with the real screenshot**. Real client work is 10x more credible than spec work.
- The post templates are deliberately punchy. Don't soften them. "Confident and direct" outsells "humble and helpful" on every freelance channel.
