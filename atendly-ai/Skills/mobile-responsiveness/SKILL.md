---
name: mobile-responsiveness
description: >
  Build responsive, mobile-first web applications with modern CSS and Tailwind CSS (2025/2026).
  Use this skill when implementing responsive layouts, touch interactions, mobile navigation,
  optimizing for various screen sizes, working with breakpoints, container queries, fluid typography,
  safe areas, or any mobile-first design work. Triggers on: responsive design, mobile-first,
  breakpoints, touch events, viewport, media queries, container queries, fluid spacing,
  mobile navigation, hamburger menu, bottom nav, safe area, notch handling.
---

# Mobile-First Responsive Design (2025/2026)

## Core Philosophy

Mobile-first design is the industry standard. With mobile traffic exceeding 60% globally and Google's mobile-first indexing, start with mobile and enhance upward.

```html
<!-- CORRECT: Mobile-first (progressive enhancement) -->
<div class="text-sm md:text-base lg:text-lg">
  Start small, enhance upward
</div>
```

**Key Principle**: Unprefixed utilities apply to ALL screen sizes. Breakpoint prefixes apply at that size AND ABOVE.

## Breakpoint Strategy

### Tailwind Default Breakpoints

| Prefix | Min-width | Target Devices |
|--------|-----------|----------------|
| (none) | 0px | All mobile phones (base) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets (portrait) |
| `lg:` | 1024px | Tablets (landscape), laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

### Content-Driven Breakpoints

Let content determine breakpoints, not device dimensions:

```css
@theme {
  --breakpoint-sm: 36rem;   /* 576px */
  --breakpoint-md: 48rem;   /* 768px */
  --breakpoint-lg: 62rem;   /* 992px */
  --breakpoint-xl: 75rem;   /* 1200px */
  --breakpoint-2xl: 90rem;  /* 1440px */
  --breakpoint-xs: 20rem;   /* 320px - very small devices */
  --breakpoint-3xl: 120rem; /* 1920px - ultra-wide */
}
```

### Screen Coverage

```html
<!-- 375px-430px: ~50% of mobile devices -->
<div class="px-4">Mobile base</div>
<!-- 768px+: Tablets -->
<div class="px-4 md:px-6">Tablet</div>
<!-- 1024px+: Desktop -->
<div class="px-4 md:px-6 lg:px-8">Desktop</div>
<!-- 1440px+: Wide desktop -->
<div class="px-4 md:px-6 lg:px-8 xl:px-12">Wide desktop</div>
```

## Mobile-First Breakpoints (CSS)

```css
/* Mobile first - no media query needed for mobile base */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; max-width: 1200px; margin: 0 auto; }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container { max-width: 1400px; }
}
```

## Fluid Typography System

Eliminates jarring size jumps between breakpoints:

```css
@theme {
  --text-fluid-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-fluid-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-fluid-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-fluid-xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-fluid-2xl: clamp(1.5rem, 1.1rem + 2vw, 2rem);
  --text-fluid-3xl: clamp(1.875rem, 1.2rem + 3.375vw, 2.5rem);
  --text-fluid-4xl: clamp(2.25rem, 1rem + 6.25vw, 3.5rem);
  --text-fluid-5xl: clamp(3rem, 1rem + 10vw, 5rem);
}
```

Always combine `vw` with `rem` to respect user zoom preferences (WCAG).

### CSS Variables Approach

```css
:root {
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --font-size-h1: clamp(2rem, 1.5rem + 2.5vw, 4rem);
}
body { font-size: var(--font-size-base); }
h1 { font-size: var(--font-size-h1); }
```

### Heading Hierarchy

```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
  Main Heading
</h1>
<h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug">
  Section Heading
</h2>
```

### Readable Body Text

```html
<article class="max-w-prose mx-auto">
  <p class="text-base md:text-lg leading-relaxed md:leading-loose text-gray-700">
    Body text optimized for readability with 45-75 characters per line.
  </p>
</article>

<h2 class="text-balance text-2xl md:text-3xl font-bold max-w-2xl">
  Heading with balanced line breaks
</h2>
```

## Fluid Spacing System

```css
@theme {
  --spacing-fluid-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --spacing-fluid-sm: clamp(0.5rem, 0.4rem + 0.5vw, 1rem);
  --spacing-fluid-md: clamp(1rem, 0.75rem + 1.25vw, 2rem);
  --spacing-fluid-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  --spacing-fluid-xl: clamp(2rem, 1.25rem + 3.75vw, 4rem);
  --spacing-fluid-2xl: clamp(3rem, 1.5rem + 7.5vw, 6rem);
  --spacing-fluid-section: clamp(4rem, 2rem + 10vw, 8rem);
}
```

```html
<section class="py-fluid-section px-fluid-md">
  <div class="max-w-7xl mx-auto">
    <h2 class="mb-fluid-lg">Section Title</h2>
    <div class="grid gap-fluid-md grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <!-- Cards -->
    </div>
  </div>
</section>
```

## Touch-Friendly Interactive Elements

### WCAG 2.2 Touch Target Requirements

- **WCAG 2.2 Level AA**: 24x24 CSS pixels minimum
- **Recommended**: 44x44 CSS pixels
- **Optimal**: 48x48 CSS pixels for critical actions

```html
<!-- Recommended size (44px) -->
<button class="min-h-11 min-w-11 p-2.5">
  <svg class="h-6 w-6">...</svg>
  <span class="sr-only">Action</span>
</button>

<!-- Optimal for primary actions (48px) -->
<button class="min-h-12 min-w-12 px-6 py-3 text-base">
  Primary Action
</button>
```

### Extended Touch Targets

```html
<a href="/link" class="relative inline-block text-sm">
  Small visible link
  <span class="absolute -inset-3" aria-hidden="true"></span>
</a>
```

### Touch Target Spacing

```html
<nav class="flex gap-3">
  <a href="#" class="min-h-11 px-4 py-2.5">Home</a>
  <a href="#" class="min-h-11 px-4 py-2.5">About</a>
  <a href="#" class="min-h-11 px-4 py-2.5">Contact</a>
</nav>
```

## Touch Interactions (React)

```tsx
import { useState } from 'react';

function SwipeableCard({ onSwipeLeft, onSwipeRight, children }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) onSwipeLeft?.();
    if (distance < -minSwipeDistance) onSwipeRight?.();
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  );
}
```

## Container Queries (2025 Game-Changer)

Component-level responsiveness, independent of viewport size.

```css
@import "tailwindcss";
@plugin "@tailwindcss/container-queries";
```

| Class | Min-width |
|-------|-----------|
| `@xs` | 320px |
| `@sm` | 384px |
| `@md` | 448px |
| `@lg` | 512px |
| `@xl` | 576px |
| `@2xl` | 672px |
| `@3xl` | 768px |

```html
<article class="@container">
  <div class="flex flex-col @sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm">
    <img src="..." class="w-full @sm:w-32 @lg:w-48 aspect-video @sm:aspect-square object-cover rounded-lg" />
    <div class="flex-1 min-w-0">
      <h3 class="text-base @md:text-lg @lg:text-xl font-semibold truncate">Card Title</h3>
      <p class="text-sm @md:text-base text-gray-600 line-clamp-2 @lg:line-clamp-3 mt-2">
        Description adapts to container...
      </p>
    </div>
  </div>
</article>
```

### When to Use Container vs Viewport Queries

| Container Queries | Viewport Queries |
|------------------|-----------------|
| Reusable components | Page-level layouts |
| Sidebar widgets | Navigation bars |
| Card grids | Hero sections |
| Embedded content | Full-width sections |

## Responsive Layout Patterns

### Auto-Responsive Grids

```html
<!-- Breakpoint-based -->
<div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Cards -->
</div>

<!-- CSS Grid auto-fit (no breakpoints needed) -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <!-- Cards auto-fit with 280px minimum -->
</div>
```

### Stack to Row

```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Content 1</div>
  <div class="flex-1">Content 2</div>
</div>
```

### Collapsible Sidebar

```html
<div class="flex min-h-screen">
  <aside class="hidden lg:flex lg:flex-col w-64 border-r bg-gray-50">
    <nav class="flex-1 p-4">...</nav>
  </aside>
  <main class="flex-1 p-4 lg:p-8">Content</main>
</div>
```

### Holy Grail Layout

```html
<div class="min-h-screen grid grid-rows-[auto_1fr_auto]">
  <header class="sticky top-0 z-50 h-16 bg-white border-b shadow-sm">
    <nav class="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
      <Logo />
      <ul class="hidden md:flex gap-6">...</ul>
      <button class="md:hidden min-h-11 min-w-11">Menu</button>
    </nav>
  </header>
  <div class="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_280px] gap-0">
    <nav class="hidden md:block border-r p-4">Left Nav</nav>
    <main class="p-4 md:p-6 lg:p-8">Main Content</main>
    <aside class="hidden lg:block border-l p-4">Right Sidebar</aside>
  </div>
  <footer class="bg-gray-900 text-white py-8 md:py-12">Footer</footer>
</div>
```

## Mobile Navigation Patterns

### Hamburger to Full Nav

```tsx
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen} aria-label="Toggle menu">
        <span className={`hamburger ${isOpen ? 'open' : ''}`} />
      </button>
      <nav className={`
        fixed inset-0 bg-white z-50 transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:bg-transparent
      `}>
        <ul className="flex flex-col md:flex-row gap-4 p-4 md:p-0">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
```

### Bottom Navigation (Mobile App Style)

```html
<nav class="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t shadow-lg safe-area-pb">
  <ul class="flex justify-around">
    <li>
      <a href="#" class="flex flex-col items-center min-h-14 min-w-14 px-3 py-2 text-xs">
        <svg class="h-6 w-6 mb-1">...</svg>
        Home
      </a>
    </li>
  </ul>
</nav>
<main class="pb-20 md:pb-0">Content</main>
```

## Safe Area Handling (Notched Devices)

```css
@utility safe-area-pt { padding-top: env(safe-area-inset-top); }
@utility safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
@utility safe-area-pl { padding-left: env(safe-area-inset-left); }
@utility safe-area-pr { padding-right: env(safe-area-inset-right); }
@utility safe-area-p {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}
```

```css
/* Fixed bottom navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

## Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## Responsive Images

```html
<!-- Aspect ratio containers -->
<div class="aspect-video overflow-hidden rounded-lg">
  <img src="..." class="w-full h-full object-cover" loading="lazy" />
</div>

<!-- Art direction -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg" />
  <source media="(min-width: 640px)" srcset="medium.jpg" />
  <img src="small.jpg" alt="Description" class="w-full h-auto rounded-lg" loading="lazy" />
</picture>

<!-- Responsive srcset -->
<img src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(min-width: 1280px) 1200px, (min-width: 768px) 80vw, 100vw"
  alt="Responsive image" class="w-full h-auto" loading="lazy" />
```

## useMediaQuery Hook

```tsx
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

// Usage
function Component() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Performance for Mobile

```html
<!-- Lazy loading -->
<img src="image.jpg" alt="..." loading="lazy" class="w-full h-auto" />
```

```css
/* Skip rendering off-screen content */
@utility content-auto {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

## Responsive Testing Checklist

1. **320px** — Smallest supported width
2. **375px** — Modern iPhone base
3. **414px** — Large phones
4. **768px** — iPad portrait
5. **1024px** — iPad landscape / small laptop
6. **1280px** — Standard laptop
7. **1440px** — Large desktop
8. **1920px** — Full HD desktop

### Quality Checks

- [ ] Text readable at all sizes
- [ ] Touch targets minimum 44px on mobile
- [ ] No horizontal scroll on any viewport
- [ ] Images don't overflow containers
- [ ] Navigation accessible on all sizes
- [ ] Forms usable on mobile
- [ ] Modals fit mobile screens
- [ ] Tables have mobile alternatives
- [ ] Performance under 3s LCP on 3G

## Best Practices Summary

| Practice | Implementation |
|----------|---------------|
| Mobile-first utilities | Unprefixed first, then `sm:`, `md:`, `lg:` |
| Touch targets | `min-h-11 min-w-11` (44px minimum) |
| Fluid typography | `clamp(min, preferred, max)` with `rem + vw` |
| Container queries | `@container` for component responsiveness |
| Safe areas | `env(safe-area-inset-*)` for notched devices |
| Readable text | `max-w-prose` (65ch) and `leading-relaxed` |
| Lazy loading | `loading="lazy"` on below-fold images |
| Touch spacing | `gap-3` (12px) minimum between targets |
| Viewport meta | `width=device-width, initial-scale=1` |

## Resources

- **Responsive Design**: https://web.dev/learn/design/
- **Mobile-First CSS**: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- **Viewport Units**: https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths
