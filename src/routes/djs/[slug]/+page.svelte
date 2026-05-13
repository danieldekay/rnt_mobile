<script lang="ts">
    import { resolve } from "$app/paths";
    import EventCard from "$lib/components/EventCard.svelte";
    import type {
        DjProfileSummary,
        DjStyleKey,
        TribeEvent,
        DjCptEntry,
        DjMetaBox,
    } from "$lib/types";
    import type { PageProps } from "./$types";

    function stripHtmlToPlainText(value: string | null | undefined): string {
        if (!value) return "";
        return value
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, "\n")
            .replace(/<[^>]+>/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{2,}/g, "\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim();
    }

    const styleLabels: Record<DjStyleKey, string> = {
        traditional: "Traditionell",
        neo: "Neo",
        "fifty-fifty": "50/50",
        mixed: "Gemischt",
    };

    const cptStyleLabels: Record<string, string> = {
        traditionell: "Traditionell",
        "non/neo": "Neo",
        gemischt: "Gemischt",
    };

    let { data }: PageProps = $props();

    const dj = $derived(data.dj as DjProfileSummary);
    const cptDj = $derived((data.cptDj as DjCptEntry | null) ?? null);
    const events = $derived((data.events as TribeEvent[]) ?? []);
    const listHref = resolve("/djs");
    const pageTitle = $derived(dj ? dj.name : "DJ");
    const styleBreakdown = $derived.by(() => {
        if (!dj) return [];

        return [
            { label: "Traditionell", count: dj.styleCounts.traditional },
            { label: "Neo", count: dj.styleCounts.neo },
            { label: "Gemischt", count: dj.styleCounts.mixed },
        ].filter((entry) => entry.count > 0);
    });

    function getInitials(name: string): string {
        const words = name
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean);

        if (words.length === 0) return "DJ";
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    function formatUpcomingLabel(upcomingCount: number): string {
        if (upcomingCount <= 0) return "Keine Termine";
        if (upcomingCount === 1) return "1 kommender Termin";
        return `${upcomingCount} kommende Termine`;
    }

    function getDjImageUrl(img: DjMetaBox["dj_image"]): string | false {
        if (!img) return false;
        if (typeof img === "string") return img;
        if (typeof img === "object") {
            return (
                img.url ??
                img.sizes?.thumbnail?.url ??
                img.sizes?.medium?.url ??
                false
            );
        }
        return false;
    }

    const bio = $derived(cptDj?.meta_box?.rnt_biografie ?? dj.bio);
    const imageSource = $derived(
        getDjImageUrl(cptDj?.meta_box?.dj_image) ?? dj.image,
    );
    const city = $derived(cptDj?.meta_box?.rnt_stadt ?? dj.city);
    const stylePreference = $derived(
        cptDj?.meta_box?.rnt_stil ?? dj.stylePreference,
    );
    const hasCptData = $derived(!!cptDj && !!cptDj.meta_box);
    const derivedBio = $derived.by(() => {
        if (bio) return null;
        const descriptions = events
            .map((e) => stripHtmlToPlainText(e.description ?? ""))
            .filter(Boolean);
        const unique = [...new Set(descriptions)];
        const combined = unique.join(" ");
        return combined.length > 300
            ? combined.slice(0, 297) + "..."
            : combined;
    });
</script>

<svelte:head>
    <title>{pageTitle} - DJs - RNT Kalender</title>
</svelte:head>

<div class="space-y-6">
    <a
        href={listHref}
        class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
    >
        Zurueck zu den DJs
    </a>

    <section class="card space-y-5 p-5 sm:p-6">
        <div class="flex items-start gap-4">
            {#if imageSource}
                <img
                    src={imageSource}
                    alt={dj.name}
                    class="h-16 w-16 rounded-full border border-border-default object-cover"
                    loading="lazy"
                    decoding="async"
                />
            {:else}
                <div
                    class="flex h-16 w-16 items-center justify-center rounded-full border border-border-default bg-surface-subtle text-[1rem] font-semibold text-text-default"
                >
                    {getInitials(dj.name)}
                </div>
            {/if}

            <div class="min-w-0 space-y-2">
                <p
                    class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
                >
                    DJ Profil
                </p>
                <h1
                    class="font-display text-[2rem] font-semibold leading-tight text-text-default"
                >
                    {dj.name}
                </h1>
                {#if city}
                    <p class="text-[0.875rem] text-text-muted">{city}</p>
                {/if}
                <div class="flex flex-wrap gap-2">
                    {#if stylePreference && cptStyleLabels[stylePreference]}
                        <span
                            class="inline-flex min-h-8 items-center rounded-badge border border-border-default bg-surface-subtle px-3 py-1 text-[0.75rem] font-semibold text-text-default"
                        >
                            {cptStyleLabels[stylePreference]}
                        </span>
                    {:else}
                        <span
                            class="inline-flex min-h-8 items-center rounded-badge border border-border-default bg-surface-subtle px-3 py-1 text-[0.75rem] font-semibold text-text-default"
                        >
                            {styleLabels[dj.style]}
                        </span>
                    {/if}
                    <span
                        class="inline-flex min-h-8 items-center rounded-badge border border-action-primary/25 bg-action-secondary px-3 py-1 text-[0.75rem] font-semibold text-text-default"
                    >
                        {formatUpcomingLabel(dj.upcomingCount)}
                    </span>
                    {#if dj.nextEventCity || city}
                        <span
                            class="inline-flex min-h-8 items-center rounded-badge border border-border-default bg-surface-subtle px-3 py-1 text-[0.75rem] font-semibold text-text-default"
                        >
                            Nächster Ort: {dj.nextEventCity || city}
                        </span>
                    {/if}
                </div>
            </div>
        </div>

        {#if bio}
            <div
                class="prose prose-sm max-w-none text-[0.98rem] leading-7 text-text-default"
            >
                {@html bio}
            </div>
        {:else if derivedBio}
            <div
                class="prose prose-sm max-w-none text-[0.98rem] leading-7 text-text-default"
            >
                <p class="text-text-muted">{derivedBio}</p>
            </div>
        {/if}

        <div class="space-y-2 text-[0.98rem] leading-7 text-text-default">
            {#if hasCptData}
                <p class="text-text-muted">
                    Dieses Profil wird aus dem DJ-Verzeichnis der RNT-Website
                    abgerufen.
                </p>
            {:else}
                <p>
                    Dieses Profil wird automatisch aus aktuellen
                    Eventbeschreibungen im Kalender erzeugt. Dadurch bleibt
                    sichtbar, bei welchen Terminen dieser DJ in der Region
                    gerade angekuendigt ist.
                </p>
            {/if}
            {#if styleBreakdown.length > 0}
                <p class="meta-text">
                    Musikspuren:
                    {#each styleBreakdown as entry, index (entry.label)}
                        {entry.label}
                        {entry.count}{index < styleBreakdown.length - 1
                            ? " · "
                            : ""}
                    {/each}
                </p>
            {/if}
        </div>

        <div class="flex flex-wrap gap-3 border-t border-border-default pt-4">
            {#if dj.nextEventInternalPath}
                <a
                    href={resolve(dj.nextEventInternalPath)}
                    data-sveltekit-preload-data="hover"
                    class="btn-secondary"
                >
                    Nächsten Termin ansehen
                </a>
            {:else if dj.nextEventExternalUrl}
                <a
                    href={dj.nextEventExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-secondary"
                >
                    Nächsten Termin extern ansehen
                </a>
            {/if}
        </div>
    </section>

    <section class="space-y-3">
        <h2 class="font-display text-[1.5rem] font-semibold text-text-default">
            Angekuendigte Termine
        </h2>
        {#if events.length === 0}
            <div class="card p-6 text-center">
                <p class="text-[1rem] font-medium text-text-default">
                    Aktuell keine verknuepften Termine
                </p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each events as event (event.id)}
                    <EventCard {event} />
                {/each}
            </div>
        {/if}
    </section>
</div>
