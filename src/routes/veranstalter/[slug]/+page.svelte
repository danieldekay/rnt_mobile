<script lang="ts">
    import { resolve } from "$app/paths";
    import OrganizerCard from "$lib/components/OrganizerCard.svelte";
    import EventCard from "$lib/components/EventCard.svelte";
    import { sanitizeHtml } from "$lib/utils/html";
    import type { TribeEvent, EnhancedOrganizer } from "$lib/types";
    import type { PageProps } from "./$types";

    type EnhancedOrganizerDetail = EnhancedOrganizer & {
        cityLabel: string;
        upcomingCount: number;
    };

    let { data }: PageProps = $props();

    const organizer = $derived(data.organizer as EnhancedOrganizerDetail);
    const events = $derived((data.events as TribeEvent[]) ?? []);
    const backendUrl = $derived((data.backendUrl as string | null) ?? null);
    const safeDescription = $derived(
        organizer?.description ? sanitizeHtml(organizer.description) : "",
    );
    const pageTitle = $derived(
        organizer ? organizer.organizer : "Veranstalter",
    );
    const listHref = resolve("/veranstalter");
</script>

<svelte:head>
    <title>{pageTitle} - Veranstalter - RNT Kalender</title>
</svelte:head>

<div class="space-y-6">
    <a
        href={listHref}
        class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
    >
        Zurueck zu den Veranstaltern
    </a>

    {#if organizer}
        {@const enhancedOrganizer = {
            ...organizer,
            image: typeof organizer.image === "string" ? organizer.image : (false as const),
            verification: organizer.verification || {},
            contact: organizer.contact || {},
            details: organizer.details || {}
        }}
        <OrganizerCard
            organizer={enhancedOrganizer}
            showVerification={true}
            showSocialLinks={false}
            showContactInfo={true}
            showDescription={true}
            showStatistics={false}
        />
    {/if}

    <section class="space-y-3">
        <h2 class="font-display text-[1.5rem] font-semibold text-text-default">
            Naechste Termine
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