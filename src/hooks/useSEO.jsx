import { Helmet } from 'react-helmet-async'

/**
 * Hook to manage page-specific SEO metadata (title, description, canonical,
 * Open Graph, Twitter Card, and an optional page-specific Breadcrumb schema).
 *
 * IMPORTANT: This file must live at `src/hooks/useSEO.jsx` because the
 * project's Vite alias `@` points to `./src` (see vite.config.js). If this
 * file is placed anywhere else (e.g. the top-level /hooks folder used by
 * unrelated shadcn scaffolding), every `import { useSEO } from '@/hooks/useSEO'`
 * will fail to resolve and Vite will fail to build the app — which shows up
 * as a blank page / everything "disappearing" in the browser.
 *
 * Usage:
 *   const { HelmetComponent } = useSEO({
 *     title: 'Page Title',
 *     description: 'Page description',
 *     canonical: 'https://www.modplintinteriors.com/page',
 *     breadcrumb: [
 *       { name: 'Home', url: 'https://www.modplintinteriors.com/' },
 *       { name: 'Services', url: 'https://www.modplintinteriors.com/services' },
 *     ],
 *   })
 *
 *   Then render <HelmetComponent /> once near the top of the page's JSX.
 */
export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = 'https://www.modplintinteriors.com/og-image.jpg',
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  breadcrumb,
}) {
  const breadcrumbSchema = breadcrumb && breadcrumb.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : null

  const HelmetComponent = () => (
    <Helmet>
      <title>{title} | Modplint Interiors</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={ogUrl || canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Modplint Interiors" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      <meta name="twitter:url" content={ogUrl || canonical} />

      {/* Page-specific Breadcrumb schema (optional) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
    </Helmet>
  )

  return { HelmetComponent }
}
