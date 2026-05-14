<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import { onMount } from "svelte";
    import SkeletonCard from "$lib/components/SkeletonCard.svelte";
    import { fetchAnnouncements } from "$lib/api/posts";
    import { stripHtml, truncate } from "$lib/utils/text";
    import type { BlogPost } from "$lib/types";
    import type { PageProps } from "./$types";

    type AnnouncementPost = BlogPost & {
        meta?: {
            rnt_termin?: string | null;
        };
    };

    type FeaturedMedia = {
        source_url?: string | null;
        alt_text?: string | null;
        media_details?: {
            sizes?: Record<string, { source_url?: string }>;
        };
    };

    type ArchiveBucket = {
        key: string;
        label: string;
        count: number;
        posts: AnnouncementPost[];
    };

    let { data }: PageProps = $props();
    let activeArchive = $state<string | null>(null);
    let localPosts = $state<AnnouncementPost[]>([]);
    let localLoadError = $state(false);
    let retrying = $state(false);

    const posts = $derived(localPosts);
    const sortedPosts = $derived.by(() =>
        [...posts].sort(compareAnnouncementPosts),
    );
    const upcomingPosts = $derived.by(() =>
        sortedPosts.filter((post) => isUpcomingAnnouncement(post)),
    );

    $effect(() => {
        if (retrying) {
            return;
        }

        localPosts = (data.posts as AnnouncementPost[]) ?? [];
        localLoadError = Boolean(data.loadError);
    });

    $effect(() => {
        if (
            activeArchive !== null &&
            !archiveBuckets.some((bucket) => bucket.key === activeArchive)
        ) {
            activeArchive = null;
        }
    });

    const showLoading = $derived(
        Boolean(
            retrying ||
                (navigating.to &&
                    navigating.to.url.pathname === resolve("/ankuendigungen") &&
                    !localLoadError &&
                    posts.length === 0),
        ),
    );

    onMount(() => {
        if (posts.length > 0 || retrying) {
            return;
        }

        void retryLoad();
    });

    async function retryLoad(): Promise<void> {
        retrying = true;

        try {
            localPosts = (await fetchAnnouncements(
                globalThis.fetch,
            )) as AnnouncementPost[];
            localLoadError = false;
        } catch (error) {
            console.error("Failed to recover announcements:", error);
            localLoadError = true;
        } finally {
            retrying = false;
        }
    }

    const archiveBuckets = $derived.by(() => {
        const bucketMap = new Map<string, ArchiveBucket>();

        for (const post of upcomingPosts) {
            const key = getArchiveKey(post);
            const existing = bucketMap.get(key);

            if (existing) {
                existing.count += 1;
                existing.posts.push(post);
            } else {
                bucketMap.set(key, {
                    key,
                    label: getArchiveLabel(post),
                    count: 1,
                    posts: [post],
                });
            }
        }

        return Array.from(bucketMap.values()).sort((left, right) =>
            left.key.localeCompare(right.key, "de"),
        );
    });

    const visiblePosts = $derived.by(() => {
        if (activeArchive === null) return upcomingPosts;
        const activeBucket = archiveBuckets.find(
            (bucket) => bucket.key === activeArchive,
        );
        return activeBucket?.posts ?? [];
    });

    const totalPosts = $derived(upcomingPosts.length);
    const hasArchiveFilter = $derived(activeArchive !== null);

    function getFeaturedMedia(post: AnnouncementPost): FeaturedMedia | null {
        const media = post._embedded?.["wp:featuredmedia"]?.[0];
        if (!media?.source_url) return null;
        return media;
    }

    function getRelevantDate(post: AnnouncementPost): Date | null {
        const eventDate = post.meta?.rnt_termin?.trim();
        return parseDateValue(eventDate) ?? parseDateValue(post.date);
    }

    function getStartOfLocalDay(value: Date): Date {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    function getRelevantDayTime(post: AnnouncementPost): number | null {
        const parsed = getRelevantDate(post);
        if (!parsed) return null;
        return getStartOfLocalDay(parsed).getTime();
    }

    function isUpcomingAnnouncement(post: AnnouncementPost): boolean {
        const dayTime = getRelevantDayTime(post);
        if (dayTime === null) return false;

        return dayTime >= getStartOfLocalDay(new Date()).getTime();
    }

    function getRelevantDateLabel(post: AnnouncementPost): string {
        const parsed = getRelevantDate(post);
        const fallback = post.meta?.rnt_termin?.trim() || post.date;

        if (!parsed) {
            return fallback;
        }

        return parsed.toLocaleDateString("de-DE", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function getLandscapeImageUrl(media: FeaturedMedia | null): string | null {
        if (!media) return null;

        return (
            media.media_details?.sizes?.large?.source_url ??
            media.media_details?.sizes?.medium_large?.source_url ??
            media.media_details?.sizes?.full?.source_url ??
            media.source_url ??
            null
        );
    }

    function parseDateValue(value: string | null | undefined): Date | null {
        if (!value) return null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            const parsed = new Date(year, month - 1, day);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function getArchiveKey(post: AnnouncementPost): string {
        const parsed = getRelevantDate(post);
        if (!parsed) return "unbekannt";

        const year = parsed.getFullYear().toString();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    }

    function getArchiveLabel(post: AnnouncementPost): string {
        const parsed = getRelevantDate(post);
        if (!parsed) return "Unbekannt";

        const raw = parsed.toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric",
        });

        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    function compareAnnouncementPosts(
        left: AnnouncementPost,
        right: AnnouncementPost,
    ): number {
        const timeDelta =
            (getRelevantDayTime(left) ?? Number.MAX_SAFE_INTEGER) -
            (getRelevantDayTime(right) ?? Number.MAX_SAFE_INTEGER);
        if (timeDelta !== 0) return timeDelta;
        return right.id - left.id;
    }

    function toggleArchive(key: string | null): void {
        activeArchive = activeArchive === key ? null : key;
    }
</script>

<svelte:head>
    <title>Ankuendigungen - RNT Kalender</title>
</svelte:head>

<div class="space-y-6">
    <div class="space-y-6">
        <section class="space-y-3">
            <p
                class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
            >
                Community News
            </p>
            <h1
                class="font-display text-[2rem] font-semibold text-text-default"
            >
                Ankuendigungen
            </h1>
            <p class="meta-text max-w-[58ch]">
                Wichtige Hinweise und aktuelle Meldungen aus der
                Rhein-Neckar-Tango-Community.
            </p>
        </section>

        <section class="card space-y-4 p-4 sm:p-5">
            <div
                class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
            >
                <div class="space-y-1">
                    <p class="text-sm font-medium text-text-default">
                        {visiblePosts.length} von {totalPosts} Meldungen sichtbar
                    </p>
                    <p class="meta-text">
                        Die Filterleiste liegt jetzt direkt ueber dem Raster,
                        nicht mehr in einer Seitenleiste.
                    </p>
                </div>
                {#if hasArchiveFilter}
                    <p class="meta-text">
                        Aktiver Monat: {archiveBuckets.find(
                            (bucket) => bucket.key === activeArchive,
                        )?.label}
                    </p>
                {/if}
            </div>

            <div class="flex flex-wrap gap-2" aria-label="Ankuendigungsfilter">
                <button
                    type="button"
                    onclick={() => toggleArchive(null)}
                    aria-pressed={activeArchive === null}
                    class={`inline-flex min-h-12 items-center gap-2 rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                        activeArchive === null
                            ? "border-action-primary bg-action-primary text-text-inverse"
                            : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                    }`}
                >
                    <span>Alle Monate</span>
                    <span
                        class="rounded-full bg-current/15 px-2 py-0.5 text-[0.75rem] font-semibold leading-none"
                        >{totalPosts}</span
                    >
                </button>
                {#each archiveBuckets as bucket (bucket.key)}
                    <button
                        type="button"
                        onclick={() => toggleArchive(bucket.key)}
                        aria-pressed={activeArchive === bucket.key}
                        class={`inline-flex min-h-12 items-center gap-2 rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                            activeArchive === bucket.key
                                ? "border-action-primary bg-action-primary text-text-inverse"
                                : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                        }`}
                    >
                        <span>{bucket.label}</span>
                        <span
                            class="rounded-full bg-current/15 px-2 py-0.5 text-[0.75rem] font-semibold leading-none"
                            >{bucket.count}</span
                        >
                    </button>
                {/each}
            </div>
        </section>

        {#if showLoading}
            <div class="space-y-4" role="status" aria-live="polite">
                <p class="sr-only">Ankuendigungen laden</p>
                {#each Array.from({ length: 4 }) as _, index (index)}
                    <SkeletonCard
                        variant="horizontal"
                        imageSize="md"
                        lines={2}
                    />
                {/each}
            </div>
        {:else if localLoadError}
            <section class="card space-y-2 p-6 text-center" role="alert">
                <p class="text-[1rem] font-semibold text-text-default">
                    Ankuendigungen konnten nicht geladen werden
                </p>
                <p class="meta-text">Bitte versuche es spaeter erneut.</p>
                <div class="pt-2">
                    <button
                        type="button"
                        class="btn-secondary"
                        onclick={() => void retryLoad()}
                        disabled={retrying}
                    >
                        {retrying ? "Laedt..." : "Erneut versuchen"}
                    </button>
                </div>
            </section>
        {:else if posts.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Ankuendigungen vorhanden
                </p>
                <p class="meta-text">
                    Sobald neue Meldungen verfuegbar sind, erscheinen sie hier.
                </p>
            </section>
        {:else if visiblePosts.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Meldungen für diesen Zeitraum
                </p>
                <p class="meta-text">
                    Waehle ein anderes Archiv oder zeige alle Monate an.
                </p>
            </section>
        {:else}
            <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                {#each visiblePosts as post (post.id)}
                    {@const title = stripHtml(post.title.rendered)}
                    {@const excerpt = truncate(
                        stripHtml(post.excerpt.rendered),
                        220,
                    )}
                    {@const media = getFeaturedMedia(post)}
                    {@const imageUrl = getLandscapeImageUrl(media)}
                    {@const url = resolve(`/ankuendigungen/${post.slug}`)}
                    <article
                        class="card group overflow-hidden transition-all duration-200 hover:border-border-accent hover:shadow-card-hover"
                    >
                        <a
                            href={url}
                            data-sveltekit-preload-data="hover"
                            aria-label={`Ankuendigung lesen: ${title}`}
                            class="block h-full rounded-card transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/25"
                        >
                            <div
                                class={`grid h-full items-start gap-4 p-4 sm:p-5 ${
                                    media
                                        ? "grid-cols-[5.5rem,minmax(0,1fr)] sm:grid-cols-[6.5rem,minmax(0,1fr)]"
                                        : "grid-cols-1"
                                }`}
                            >
                                {#if media}
                                    <div
                                        class="overflow-hidden rounded-card bg-surface-subtle ring-1 ring-inset ring-border-default/40"
                                    >
                                        <img
                                            src={imageUrl ??
                                                media.source_url ??
                                                ""}
                                            alt={media.alt_text?.trim() ||
                                                title}
                                            class="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                {/if}

                                <div
                                    class="flex h-full min-w-0 flex-col gap-2 pt-0.5"
                                >
                                    <h2
                                        class="line-clamp-2 font-display text-[1.125rem] font-semibold leading-snug tracking-tight text-text-default transition-colors group-hover:text-action-primary sm:text-[1.1875rem]"
                                    >
                                        {title}
                                    </h2>
                                    <p class="announcement-excerpt meta-text">
                                        {excerpt}
                                    </p>
                                    <div
                                        class="mt-auto flex items-center justify-between gap-3 pt-0.5"
                                    >
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
                            </div>
                        </a>
                    </article>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .announcement-excerpt {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
    }
</style>
