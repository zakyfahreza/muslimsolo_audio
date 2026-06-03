import { youtubeEmbedUrl } from '../lib/utils';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

/**
 * Responsive 16:9 YouTube embed. Renders nothing when the URL is missing or
 * not a recognizable YouTube link, so callers can pass through raw data safely.
 */
export function YouTubeEmbed({ url, title = 'Video YouTube' }: YouTubeEmbedProps) {
  const embed = youtubeEmbedUrl(url);
  if (!embed) return null;

  return (
    <section className="card overflow-hidden p-0">
      <div className="aspect-video w-full">
        <iframe
          src={embed}
          title={title}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  );
}
