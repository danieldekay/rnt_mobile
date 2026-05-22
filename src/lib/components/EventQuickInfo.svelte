<script lang="ts">
    import type { TribeEvent, Organizer } from "$lib/types";

    let {
        event,
        formattedDate,
        startTime,
        endTime,
        primaryOrganizer,
        dj,
        workshop,
        cost,
    }: {
        event: TribeEvent;
        formattedDate: string;
        startTime: string;
        endTime: string;
        primaryOrganizer: Organizer | null;
        dj: string | null;
        workshop: string | null;
        cost: string | null;
    } = $props();
</script>

<div class="space-y-3">
    <!-- Date/Time -->
    <div class="card p-4">
        <div class="flex items-center gap-4">
            <div
                class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle"
            >
                <svg
                    class="h-6 w-6 text-text-default"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <div>
                <p class="text-[1rem] font-semibold text-text-default">
                    {formattedDate}
                </p>
                <p class="meta-text">
                    {#if event.all_day}
                        Ganztägig
                    {:else}
                        {startTime}{endTime ? ` – ${endTime}` : ""}
                    {/if}
                </p>
            </div>
        </div>
    </div>

    <!-- Venue -->
    {#if event.venue}
        <div class="card p-4">
            <div class="flex items-start gap-4">
                <div
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-subtle"
                >
                    <svg
                        class="h-6 w-6 text-text-default"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 8 0111.314 0z"
                        />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-[1rem] font-semibold text-text-default">
                        {event.venue.venue}
                    </p>
                    {#if event.venue.address || event.venue.city}
                        <p class="meta-text">
                            {[
                                event.venue.address,
                                event.venue.city,
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                    {/if}
                    {#if event.venue.website}
                        <a
                            href={event.venue.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-2 inline-flex items-center gap-1 text-[0.9375rem] text-text-link underline underline-offset-4"
                        >
                            <svg
                                class="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            Website
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <!-- Organizer -->
    {#if primaryOrganizer}
        <div class="card p-4">
            <div class="flex items-center gap-4">
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle"
                >
                    <svg
                        class="h-6 w-6 text-text-default"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <div>
                    <p class="meta-text">Veranstalter</p>
                    <p class="text-[1rem] font-semibold text-text-default">
                        {primaryOrganizer.organizer}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- Cost -->
    {#if cost}
        <div class="card p-4">
            <div class="flex items-center gap-4">
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle"
                >
                    <span
                        class="text-[1.25rem] font-bold leading-none text-text-default"
                        aria-hidden="true"
                    >
                        €
                    </span>
                </div>
                <div>
                    <p class="meta-text">Eintritt</p>
                    <p class="text-[1rem] font-semibold text-text-default">
                        {cost}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- DJ / Workshop -->
    {#if dj || workshop}
        <div class="card p-4">
            <div class="flex items-center gap-4">
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle"
                >
                    <svg
                        class="h-6 w-6 text-text-default"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            width="2"
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                </div>
                <div>
                    {#if dj}
                        <p class="meta-text">DJ</p>
                        <p class="text-[1rem] font-semibold text-text-default">
                            {dj}
                        </p>
                    {/if}
                    {#if workshop}
                        <p class="meta-text mt-2">Workshop</p>
                        <p class="text-[1rem] font-semibold text-text-default">
                            {workshop}
                        </p>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
