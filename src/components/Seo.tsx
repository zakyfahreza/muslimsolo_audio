import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  /** JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'muslimsolo.id';
const DEFAULT_DESC =
  'Platform streaming kajian ustadz dengan manhaj salaf. Dengarkan rekaman kajian dari berbagai kitab dan ustadz, kapan saja, di mana saja.';

export function Seo({ title, description, image, jsonLd }: SeoProps) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Platform Streaming Kajian Ustadz dengan Manhaj Salaf`;
  const desc = description ?? DEFAULT_DESC;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
