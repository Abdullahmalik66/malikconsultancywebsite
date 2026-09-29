# Mobile & Responsive Engineering Rules

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Design Foundation**: Material Design 3 (M3 Foundation) / Tailwind CSS v4 `[Verified from repository: BRANDING.md, src/styles/index.css]`  

---

## 1. Core Responsive Breakpoints `[Verified from repository]`

The project follows standard Tailwind CSS breakpoints aligned with M3 responsive guidelines:
- **Mobile (`base` / `< 768px`)**: Single-column vertical stacking, accordion transformations.
- **Tablet (`md:` / `768px – 1024px`)**: Dual-column layouts, expanded card grids.
- **Desktop (`lg:` / `1024px – 1280px`)**: Full desktop layouts, sticky stacked-card animations.
- **Wide (`xl:` / `> 1280px`)**: Max container width capped at 1280px (`BRANDING.md`).

---

## 2. Layout Transformations `[Verified from repository]`

### A. Sub-Services Showcase (`src/components/service/SubServicesShowcase.tsx`)
- **Desktop (`>= 768px`)**:
  - Implements a sticky pinned container (`sticky top-24`).
  - Cards stack dynamically as the user scrolls, creating a physical card-deck effect via Framer Motion.
- **Mobile (`< 768px`)**:
  - Pinned stacked sticky scrolls can trap touch gestures on mobile devices.
  - The component automatically renders an expandable vertical accordion stack on mobile viewports.
  - *Rule*: Never force desktop sticky coordinate pins on mobile viewports.

### B. Header & Navigation (`src/components/layout/Navbar.tsx`)
- **Desktop**: Horizontal link array with hover indicators and CTA button.
- **Mobile**: Overlay navigation drawer with touch-friendly targets and auto-dismiss on route change.

### C. Conversational Diagnostic (`src/components/service/DecisionQuestionnaire.tsx`)
- **Desktop**: Centered container with dual-column choices.
- **Mobile**: Full-width container with stacked selection buttons. Minimum tap target height is 48px.

---

## 3. Mobile Performance & Touch Invariants `[Recommendation & Verified Best Practices]`

1. **No Hover-Only Triggers**: Never conceal critical actions behind `:hover` states. All essential actions must be tappable.
2. **Body Scroll Locking**: When modals or navigation drawers open, lock background body scrolling cleanly without layout jumps.
3. **Image Optimization**: Use WebP format with `loading="lazy"` and `decoding="async"` on below-the-fold assets.
4. **iOS Form Zoom Prevention**: Mobile text inputs (`<input>`, `<textarea>`) must use a minimum font size of `16px` (`text-base`) to prevent iOS Safari from automatically zooming on input focus.
