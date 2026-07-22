<script lang="ts">
    import { resolve } from "$app/paths";
    import { stripHtml, truncate } from "$lib/utils/text";
    import type { BlogPost } from "$lib/types";

    type AnnouncementPost = BlogPost & {
        meta?: {
            rnt_termin?: string | null;
        };
    };

    type FeaturedMedia = {
        source_url?: string | null;
        alt_text?: string | null;
        media_details?: {
            width?: number;
            height?: number;
            sizes?: Record<string, { source_url?: string }>;
        };
    };

    let {
        post,
        getFeaturedMedia,
        getLandscapeImageUrl,
        getRelevantDateLabel,
    }: {
        post: AnnouncementPost;
        getFeaturedMedia: (post: AnnouncementPost) => FeaturedMedia | null;
        getLandscapeImageUrl: (
            media: FeaturedMedia | null,
        ) => string | null;
        getRelevantDateLabel: (post: AnnouncementPost) => string;
    } = $props();

    const title = $derived(stripHtml(post.title.rendered));
    const excerpt = $derived(truncate(stripHtml(post.excerpt.rendered), 220));
    const media = $derived(getFeaturedMedia(post));
    const imageUrl = $derived(getLandscapeImageUrl(media));
    const url = $derived(resolve(`/ankuendigungen/${post.slug}`));
    const imageAspectRatio = $derived.by(() => {
        const width = media?.media_details?.width;
        const height = media?.media_details?.height;
        if (!width || !height || width <= 0 || height <= 0) {
            return "16 / 9";
        }
        // Never portrait: clamp to square when taller than wide.
        if (height > width) return "1 / 1";
        return `${width} / ${height}`;
    });
</script>

<article
    class="card group overflow-hidden transition-all duration-200 hover:border-border-accent hover:shadow-card-hover"
>
    <a
        href={url}
        data-sveltekit-preload-data="hover"
        aria-label={`Ankuendigung lesen: ${title}`}
        class="block h-full rounded-card transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/25"
    >
        {#if media}
            <div
                class="overflow-hidden bg-surface-subtle ring-1 ring-inset ring-border-default/40"
                style={`aspect-ratio: ${imageAspectRatio}`}
            >
                <img
                    src={imageUrl ?? media.source_url ?? ""}
                    alt={media.alt_text?.trim() || title}
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        {/if}

        <div class="flex h-full min-w-0 flex-col gap-2 p-4 pt-3 sm:p-5 sm:pt-4">
            <h2
                class="line-clamp-2 font-display text-[1.125rem] font-semibold leading-snug tracking-tight text-text-default transition-colors group-hover:text-action-primary sm:text-[1.1875rem]"
            >
                {title}
            </h2>
            <p class="announcement-excerpt meta-text">
                {excerpt}
            </p>
            <div class="mt-auto flex items-center justify-between gap-3 pt-0.5">
                <p
                    class="text-[0.6875rem] font-bold uppercase tracking-wider text-text-muted"
                >
                    {getRelevantDateLabel(post)}
                </p>
                <span
                    class="inline-flex items-center gap-1 text-[0.875rem] font-bold text-action-primary transition-colors group-hover:text-action-primary-hover"
                >
                    Zur Ankuendigung
                    <svg
                        class="h-4 w-4 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                    </svg>
                </span>
            </div>
        </div>
    </a>
</article>

<style>
    .announcement-excerpt {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
    }
</style>
