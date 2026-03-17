---
name: seo-optimizer
description: >
  Comprehensive SEO optimization guidance for websites and web applications.
  Use this skill when optimizing content for search engines, conducting keyword research,
  implementing technical SEO (schema markup, sitemaps, robots.txt, canonical tags),
  improving Core Web Vitals, creating SEO-friendly meta tags, auditing websites for SEO issues,
  planning content strategy for organic traffic, implementing structured data, or improving
  page speed. Also use when the user mentions SEO, search rankings, organic traffic,
  meta descriptions, title tags, keyword optimization, or anything related to search visibility.
---

# SEO Optimizer

Comprehensive guidance for search engine optimization across content, technical implementation, and strategic planning to improve organic search visibility and rankings.

## When to Use This Skill

- Optimizing website content for search engines
- Conducting keyword research and analysis
- Implementing technical SEO improvements
- Creating SEO-friendly meta tags and descriptions
- Auditing websites for SEO issues
- Improving Core Web Vitals and page speed
- Implementing schema markup (structured data)
- Planning content strategy for organic traffic
- Optimizing internal linking and site architecture
- Local SEO for businesses with physical locations

## SEO Fundamentals

### 1. Keyword Research & Strategy

**Primary Keyword Selection:**
- Focus on search intent (informational, navigational, transactional, commercial)
- Balance search volume with competition
- Consider keyword difficulty and ranking potential
- Target long-tail keywords for quick wins

**Keyword Research Process:**
1. Identify seed keywords from business objectives
2. Expand keyword list using tools (Google Keyword Planner, Ahrefs, SEMrush)
3. Analyze search volume and difficulty
4. Group keywords by topic clusters
5. Map keywords to content types and pages
6. Prioritize based on potential ROI

**Content Optimization Formula:**
- Primary keyword: 1-2% density (natural placement)
- Include in: Title tag, H1, first paragraph, URL, meta description
- Use semantic variations and related terms
- Maintain natural readability — never keyword stuff

### 2. On-Page SEO

**Title Tag Optimization:**
```html
<!-- Good: Descriptive, includes keyword, under 60 characters -->
<title>Ultimate Guide to React Hooks - Learn useEffect & useState</title>

<!-- Bad: Too long, keyword stuffing -->
<title>React Hooks Guide React Hooks Tutorial React Hooks Examples Learn React</title>
```

Best practices:
- Keep under 60 characters
- Place primary keyword near the beginning
- Include brand name if space permits
- Make compelling and click-worthy
- Unique for every page

**Meta Description:**
```html
<!-- Good: Compelling, includes keywords, CTA, 150-160 chars -->
<meta name="description" content="Master React Hooks with our comprehensive guide. Learn useState, useEffect, and custom hooks with practical examples. Start building better React apps today.">
```

Best practices:
- 150-160 characters
- Include primary keyword naturally
- Add a clear call-to-action
- Unique per page

**Header Structure:**
```html
<h1>Main Page Title (Primary Keyword)</h1>
  <h2>Section Heading (Related Keywords)</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
    <h3>Subsection</h3>
```

Only one H1 per page. Use proper hierarchy — never skip levels.

**URL Structure:**
```
Good:
- /blog/react-hooks-guide
- /products/running-shoes
- /learn/javascript-async-await

Bad:
- /blog?p=12345
- /products/cat-1/subcat-2/item-999
- /page.php?id=abc&ref=xyz
```

Keep URLs short, readable, lowercase, with hyphens separating words.

**Image Optimization:**
```html
<img
  src="/images/react-hooks-diagram-800w.webp"
  alt="React Hooks lifecycle diagram showing useState and useEffect"
  width="800"
  height="600"
  loading="lazy"
/>
```

- Use descriptive, keyword-rich alt text
- Compress images (WebP format preferred)
- Specify dimensions to prevent layout shift (CLS)
- Use lazy loading for below-fold images

### 3. Content Quality — E-E-A-T

**Experience, Expertise, Authoritativeness, Trust:**
- Demonstrate author expertise with credentials
- Cite authoritative sources
- Keep content accurate and up-to-date
- Show real experience and original insights
- Include author bios and bylines

**Content Structure for SEO:**
```markdown
# Main Title (H1) — Primary Keyword
Brief introduction with primary keyword in first 100 words.

## What is [Topic]?
Comprehensive explanation with examples.

## Why [Topic] Matters
Benefits and use cases.

## How to [Action]
Step-by-step instructions with visuals.

## Best Practices
Expert recommendations.

## Common Mistakes to Avoid
Troubleshooting and pitfalls.

## Conclusion
Summary and call-to-action.
```

**Content Length Guidelines:**
- Blog posts: 1,500-2,500 words (comprehensive topics)
- Product pages: 300-500 words minimum
- Category pages: 500-1,000 words
- Homepage: 500+ words

### 4. Technical SEO

**Schema Markup (Structured Data):**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete Guide to React Hooks",
  "image": "https://example.com/images/react-hooks.jpg",
  "datePublished": "2024-01-15",
  "dateModified": "2024-02-01",
  "author": {
    "@type": "Person",
    "name": "Jane Developer"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tech Academy",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

**Common Schema Types:**
- `Article` — blog posts
- `Product` — e-commerce
- `FAQ` — question/answer pages
- `HowTo` — tutorials and guides
- `Organization` — company info
- `LocalBusiness` — location-based businesses
- `BreadcrumbList` — navigation paths
- `Review` / `AggregateRating` — ratings

**Robots.txt:**
```
User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Allow: /api/public/

Sitemap: https://example.com/sitemap.xml
```

**XML Sitemap:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Canonical Tags:**
```html
<link rel="canonical" href="https://example.com/original-page">
```

Use canonical tags to prevent duplicate content issues, especially with URL parameters.

### 5. Core Web Vitals

**LCP (Largest Contentful Paint) — Target: < 2.5s**
- Optimize images and videos
- Use CDN for static assets
- Minimize render-blocking resources
- Implement lazy loading

**FID (First Input Delay) — Target: < 100ms**
- Minimize JavaScript execution time
- Break up long tasks
- Use web workers for heavy computations
- Defer non-critical JavaScript

**CLS (Cumulative Layout Shift) — Target: < 0.1**
- Set size attributes on images and videos
- Avoid inserting content above existing content
- Use transform animations instead of layout-triggering properties
- Reserve space for ads and embeds

**Page Speed Optimization:**
```html
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/styles/non-critical.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<script src="/js/analytics.js" async></script>
<script src="/js/main.js" defer></script>
```

### 6. Mobile SEO

- Responsive design (pass Google's mobile-friendly test)
- Touch-friendly buttons (minimum 48x48px)
- Readable font sizes (16px minimum)
- Fast mobile page speed

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 7. Internal Linking Strategy

- Use descriptive anchor text (avoid "click here")
- Link to relevant, contextual pages
- Maintain logical hierarchy and flow
- Include 3-5 internal links per 1,000 words
- Update old content with links to new content

### 8. Topic Clusters & Pillar Pages

```
Pillar Page: "Complete Guide to React"
  ├── Cluster: "React Hooks Tutorial"
  ├── Cluster: "React Context API Guide"
  ├── Cluster: "React Performance Optimization"
  └── Cluster: "React Testing Best Practices"
```

- Create comprehensive pillar content (3,000+ words)
- Develop 8-12 cluster articles supporting the pillar
- Interlink all clusters with the pillar page
- Use consistent keyword themes

### 9. Featured Snippet Optimization

**Question-based** — answer the question concisely right after the heading:
```markdown
## What is React?

React is a JavaScript library for building user interfaces,
developed by Facebook. It allows developers to create reusable
UI components and efficiently update the DOM through a virtual
DOM implementation.
```

**List-based** — use numbered/bulleted lists under a heading.

**Table-based** — use comparison tables for structured data.

### 10. Local SEO

**Google Business Profile:**
- Complete all business information
- Regular posts and updates
- Respond to reviews
- Add high-quality photos
- Verify business hours

**Local Schema:**
```json
{
  "@type": "LocalBusiness",
  "name": "Tech Solutions Inc",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102"
  },
  "telephone": "+1-415-555-0123"
}
```

## SEO Content Checklist

Before publishing any page, verify:

- [ ] Primary keyword in title tag (under 60 chars)
- [ ] Meta description (150-160 chars, compelling)
- [ ] H1 tag with primary keyword
- [ ] URL slug optimized and readable
- [ ] Images compressed with descriptive alt text
- [ ] 3-5 internal links to relevant content
- [ ] External links to authoritative sources
- [ ] Content length appropriate for topic depth
- [ ] Schema markup implemented
- [ ] Mobile-friendly and responsive
- [ ] Page speed optimized (< 3s load time)
- [ ] No broken links
- [ ] Canonical tag set correctly
- [ ] Social sharing meta tags (Open Graph, Twitter Card)

## Monitoring & Analytics

**Key Metrics:**
- Organic traffic trends
- Keyword rankings
- Click-through rates (CTR)
- Bounce rate and dwell time
- Core Web Vitals scores
- Backlink profile growth
- Conversion rates from organic traffic

**Recommended Tools:**
- Google Search Console — performance, indexing issues
- Google Analytics 4 — traffic, behavior, conversions
- PageSpeed Insights — Core Web Vitals
- Ahrefs / SEMrush — keywords, backlinks, competition
- Screaming Frog — technical audits

Always prioritize user experience and value delivery. Search engines increasingly reward content that genuinely helps users and provides authoritative, trustworthy information.
