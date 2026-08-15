<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import { onMount } from "svelte";
    import SkeletonCard from "$lib/components/SkeletonCard.svelte";
    import AnnouncementCard from "$lib/components/AnnouncementCard.svelte";
    import AnnouncementFilterBar from "$lib/components/AnnouncementFilterBar.svelte";
    import { fetchAnnouncements } from "$lib/api/posts";
    import type { BlogPost } from "$lib/types";
    import type { PageProps } from "./$types";
    import SeoHead from "$lib/components/SeoHead.svelte";
    import { mapHubPageSeo } from "$lib/seo/pages";

    const seo = mapHubPageSeo("ankuendigungen");

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

    type ArchiveBucket = {
        key: string;
        label: string;
        count: number;
        posts: AnnouncementPost[];
    };

    let { data }: PageProps = $props();
    let activeArchive = $state<string | null>(null);
    let localPosts = $state<AnnouncementPost[] | null>(null);
    let localLoadError = $state(Boolean(data.loadError));
    let retrying = $state(false);

    // Prefer live client fetch; fall back to prerendered data until then.
    const posts = $derived(
        localPosts ?? ((data.posts as AnnouncementPost[]) ?? []),
    );
    const sortedPosts = $derived.by(() =>
        [...posts].sort(compareAnnouncementPosts),
    );
    const upcomingPosts = $derived.by(() =>
        sortedPosts.filter((post) => isUpcomingAnnouncement(post)),
    );

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
            if (localPosts === null) {
                localPosts = [];
            }
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

<SeoHead {seo} />

<div class="page-stack">
    <div class="page-stack">
        <section class="space-y-3">
            <p
                class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
            >
                Community News
            </p>
            <h1
                class="font-display text-[2rem] font-semibold text-text-default"
            >
                Ankündigungen
            </h1>
            <p class="meta-text max-w-[58ch]">
                Wichtige Hinweise und aktuelle Meldungen aus der
                Rhein-Neckar-Tango-Community.
            </p>
        </section>

        <AnnouncementFilterBar
            visibleCount={visiblePosts.length}
            totalCount={totalPosts}
            {hasArchiveFilter}
            {activeArchive}
            {archiveBuckets}
            {toggleArchive}
        />

        {#if showLoading}
            <div class="space-y-4" role="status" aria-live="polite">
                <p class="sr-only">Ankündigungen laden</p>
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
                    Ankündigungen konnten nicht geladen werden
                </p>
                <p class="meta-text">Bitte versuche es später erneut.</p>
                <div class="pt-2">
                    <button
                        type="button"
                        class="btn-secondary"
                        onclick={() => void retryLoad()}
                        disabled={retrying}
                    >
                        {retrying ? "Lädt…" : "Erneut versuchen"}
                    </button>
                </div>
            </section>
        {:else if posts.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Ankündigungen vorhanden
                </p>
                <p class="meta-text">
                    Sobald neue Meldungen verfügbar sind, erscheinen sie hier.
                </p>
            </section>
        {:else if visiblePosts.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Meldungen für diesen Zeitraum
                </p>
                <p class="meta-text">
                    Wähle ein anderes Archiv oder zeige alle Monate an.
                </p>
            </section>
        {:else}
            <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                {#each visiblePosts as post (post.id)}
                    <AnnouncementCard
                        {post}
                        {getFeaturedMedia}
                        {getLandscapeImageUrl}
                        {getRelevantDateLabel}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>
