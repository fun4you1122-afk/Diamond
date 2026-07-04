# Diamond — Luxury Weddings & Events

A fast, bilingual (English / Arabic + RTL) static website for a luxury wedding &
events business. No build step, no database — open `index.html` or host the folder
on any static host (Netlify, Vercel, GitHub Pages, cPanel, S3…).

> **Status:** structure & design complete with **placeholder copy and image slots**.
> Drop in your real text, photos, video and contact details to finish.

## Pages

| File | Tab |
|------|-----|
| `index.html` | Home — hero video, stats, 10 services, process, QR feature, portfolio, why-choose, offices |
| `weddings.html` | Weddings — under-one-roof, 4-step process, gallery, FAQ |
| `events.html` | Events — what we produce, in-house capabilities, QR check-in, FAQ |
| `services.html` | Services — 5 categories, ~20 sub-services |
| `design.html` | Design — 3D renders, live sketch artist, process, FAQ |
| `qr-invitations.html` | QR Invitations — paper-vs-digital comparison, 4 steps, use cases, FAQ |
| `gallery.html` | Gallery — image grid with click-to-zoom lightbox |
| `contact.html` | Contact — WhatsApp/phone/offices/maps + quick inquiry form |

## Shared assets

```
assets/css/styles.css   Design system (colours, fonts, components, responsive, RTL)
assets/js/main.js       Language toggle, mobile menu, FAQ, lightbox, scroll reveals, counters
assets/img/             <- put your images here
assets/video/           <- put your hero video here (hero.mp4)
```

## Features included

- **Bilingual EN / AR** with one-click toggle (top-right) and full right-to-left layout.
- **Mobile-responsive** with a slide-in hamburger menu.
- **Sticky centered-logo header**, floating WhatsApp button on every page.
- **FAQ accordions**, **animated stat counters**, **scroll-in reveals**.
- **Gallery lightbox** (click any photo -> full-screen, arrow-key navigation).
- **Contact form** that composes a pre-filled WhatsApp message (no server needed).

## What you need to replace (search & replace across all files)

| Placeholder | Replace with |
|-------------|--------------|
| `Diamond` | Your business name |
| `9710000000000` | Your WhatsApp number, digits only with country code (e.g. `971501234567`) |
| `+971 50 000 0000` / `+97150000000` | Your display & dial phone number |
| `diamondevents` (Instagram) | Your Instagram handle |
| `https://maps.google.com` | Your Google Maps links |
| `[Area]` / `[Street address line]` | Your two office addresses |
| `.ph` placeholder blocks (`<div class="ph">...`) | `<img src="assets/img/your-photo.jpg" alt="">` |

### Logo
In each page header, replace the text logo:
```html
<div class="brand__word">Diamond</div>
```
with an image:
```html
<img src="assets/img/logo.png" alt="Your Business">
```

### Hero video (home page)
In `index.html`, inside `<div class="hero__media">`, uncomment:
```html
<video autoplay muted loop playsinline poster="assets/img/hero-poster.jpg">
  <source src="assets/video/hero.mp4" type="video/mp4">
</video>
```

### Gallery photos
In `gallery.html`, replace each `<div class="ph"><span>...</span></div>` with an
`<img>`, and add `data-full="assets/img/large.jpg"` to its `.gallery-item` so the
lightbox shows the full-resolution version.

## Run locally

Just open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Notes

This site is an original implementation inspired by the *structure* of a luxury
events website. All copy is placeholder text written for the Diamond brand — replace
it with your own. Fonts load from Google Fonts (Cormorant Garamond, Montserrat,
Amiri, Tajawal).
