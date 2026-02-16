# FakeStore

A fully functional e-commerce front-end built with vanilla HTML, CSS, and JavaScript. Powered by the FakeStoreAPI for product data, ImageKit JS SDK for responsive image delivery, and localStorage for cart persistence.

**Live Demo:** https://kashish-dev-101.github.io/FakeStore/

## Features

- Product listing with category filtering (multi-select via checkboxes)
- Individual product pages with similar products section
- Add to Cart with localStorage persistence across pages
- Cart count badge synced across all pages
- Responsive images via ImageKit SDK (srcset + sizes)
- fetchpriority="high" for above-the-fold images, lazy loading for the rest
- Clean Apple-inspired UI with Inter font

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- [FakeStoreAPI](https://fakestoreapi.com) — product data
- [ImageKit JS SDK](https://www.npmjs.com/package/@imagekit/javascript) — responsive image URLs, format/quality transforms
- localStorage — cart state persistence

## Project Structure

```
FakeStore/
├── index.html          # Homepage — product grid + category filters
├── style.css           # Styles for homepage
├── script.js           # JS for homepage (fetch products, render grid, filters)
├── product.html        # Product detail page
├── product.css         # Styles for product page
├── product.js          # JS for product page (fetch product, similar items, add to cart)
├── cart.html           # Cart page
├── cart.css            # Styles for cart page
├── cart.js             # JS for cart page (render cart items, total, remove)
├── config.js           # Shared config (API base URL, ImageKit endpoint)
├── config.example.js   # Template config for reference
└── README.md
```

## Setup

1. Clone the repository
2. Copy `config.example.js` to `config.js` and update the ImageKit URL endpoint if needed
3. Open `index.html` in any modern browser (no server setup required)

## ImageKit Integration

All product images are served through ImageKit instead of directly from FakeStoreAPI. The JS SDK handles:

- **Responsive images** — `getResponsiveImageAttributes()` generates `src`, `srcset`, and `sizes` so the browser picks the optimal image width
- **Format & quality** — `format: auto` (WebP/AVIF where supported), `quality: 80`
- **Loading strategy** — First few images use `fetchpriority="high"` for faster LCP; the rest use `loading="lazy"`

Each page defines its own `sizes` value matching its CSS layout:
| Page | Context | sizes |
|------|---------|-------|
| Homepage | Product grid cards | `(max-width: 540px) 100vw, (max-width: 900px) 45vw, (max-width: 1200px) 30vw, 25vw` |
| Product | Main product image | `(max-width: 900px) 80vw, 400px` |
| Product | Similar thumbnails | `140px` |
| Cart | Cart item thumbnails | `100px` |

## Author

Ashish
