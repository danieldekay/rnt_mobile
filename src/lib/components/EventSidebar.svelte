<script lang="ts">
    import type { TribeEvent, Organizer } from "$lib/types";

    let {
        event,
        formattedDate,
        isoStartDate,
        startTime,
        endTime,
        eventTypeLabel,
        eventTypeBadgeClass,
        musicLabel,
        musicBadgeClass,
        primaryOrganizer,
        dj,
        venueLink,
        venueProfileLink = "",
        organizerProfileLink,
        organizerWebsiteLink,
        djProfileLink,
    }: {
        event: TribeEvent;
        formattedDate: string;
        isoStartDate: string;
        startTime: string;
        endTime: string;
        eventTypeLabel: string | null;
        eventTypeBadgeClass: string;
        musicLabel: string | null;
        musicBadgeClass: string;
        primaryOrganizer: Organizer | null;
        dj: string | null;
        venueLink: string;
        venueProfileLink?: string;
        organizerProfileLink: string;
        organizerWebsiteLink: string;
        djProfileLink: string;
    } = $props();
</script>

<div class="space-y-4 lg:sticky lg:top-6">
    <section class="card space-y-4 p-5">
        <div>
            <p class="meta-text">Schnellueberblick</p>
            <div class="mt-3 flex flex-wrap gap-2">
                {#if eventTypeLabel}
                    <span
                        class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {eventTypeBadgeClass}"
                    >
                        {eventTypeLabel}
                    </span>
                {/if}
                {#if musicLabel}
                    <span
                        class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {musicBadgeClass}"
                    >
                        {musicLabel}
                    </span>
                {/if}
            </div>
        </div>

        <div class="space-y-4 border-t border-border-default pt-4">
            <div>
                <p class="meta-text">Datum und Zeit</p>
                <p class="mt-1 text-[1rem] font-semibold text-text-default">
                    <time datetime={isoStartDate}>{formattedDate}</time>
                </p>
                <p class="meta-text mt-1">
                    {#if event.all_day}
                        Ganztägig
                    {:else}
                        {startTime}{endTime ? ` – ${endTime}` : ""}
                    {/if}
                </p>
            </div>

            {#if event.venue}
                <div>
                    <p class="meta-text">Ort</p>
                    {#if venueProfileLink}
                        <a
                            href={venueProfileLink}
                            data-sveltekit-preload-data="hover"
                            class="mt-1 inline-flex items-center gap-2 text-[1rem] font-semibold text-text-link underline underline-offset-4"
                        >
                            {event.venue.venue}
                        </a>
                    {:else if venueLink}
                        <a
                            href={venueLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-1 inline-flex items-center gap-2 text-[1rem] font-semibold text-text-link underline underline-offset-4"
                        >
                            {event.venue.venue}
                        </a>
                    {:else}
                        <p
                            class="mt-1 text-[1rem] font-semibold text-text-default"
                        >
                            {event.venue.venue}
                        </p>
                    {/if}
                    {#if event.venue.address || event.venue.city}
                        <p class="meta-text mt-1">
                            {[event.venue.address, event.venue.city]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                    {/if}
                </div>
            {/if}

            {#if primaryOrganizer}
                <div>
                    <p class="meta-text">Veranstalter</p>
                    {#if organizerProfileLink}
                        <a
                            href={organizerProfileLink}
                            data-sveltekit-preload-data="hover"
                            class="mt-1 inline-flex items-center gap-2 text-[1rem] font-semibold text-text-link underline underline-offset-4"
                        >
                            {primaryOrganizer.organizer}
                        </a>
                    {:else if organizerWebsiteLink}
                        <a
                            href={organizerWebsiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-1 inline-flex items-center gap-2 text-[1rem] font-semibold text-text-link underline underline-offset-4"
                        >
                            {primaryOrganizer.organizer}
                        </a>
                    {:else}
                        <p
                            class="mt-1 text-[1rem] font-semibold text-text-default"
                        >
                            {primaryOrganizer.organizer}
                        </p>
                    {/if}
                </div>
            {/if}

            {#if dj}
                <div>
                    <p class="meta-text">DJ</p>
                    {#if djProfileLink}
                        <a
                            href={djProfileLink}
                            data-sveltekit-preload-data="hover"
                            class="mt-1 inline-flex items-center gap-2 text-[1rem] font-semibold text-text-link underline underline-offset-4"
                        >
                            {dj}
                        </a>
                    {:else}
                        <p
                            class="mt-1 text-[1rem] font-semibold text-text-default"
                        >
                            {dj}
                        </p>
                    {/if}
                </div>
            {/if}
        </div>

        {#if event.url}
            <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary w-full text-center"
            >
                Zur Anmeldung
            </a>
        {/if}
    </section>
</div>
