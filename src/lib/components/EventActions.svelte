<script lang="ts">
    import { trackFeatureEvent } from "$lib/matomo";
    import type { TribeEvent } from "$lib/types";

    let {
        shareData,
        calendarFileName,
        event,
    }: {
        shareData: { text: string; url: string } | null;
        calendarFileName: string;
        event: TribeEvent | null;
    } = $props();

    let shareState = $state<"idle" | "copied" | "error">("idle");
    let calendarState = $state<"idle" | "saved" | "error">("idle");

    function resetShareState() {
        window.setTimeout(() => {
            shareState = "idle";
        }, 2200);
    }

    function resetCalendarState() {
        window.setTimeout(() => {
            calendarState = "idle";
        }, 2200);
    }

    async function handleShare() {
        if (!event || !shareData) {
            return;
        }

        try {
            if (
                typeof navigator !== "undefined" &&
                typeof navigator.share === "function"
            ) {
                await navigator.share(shareData);
                trackFeatureEvent("events", "share", String(event.id));
                return;
            }
        } catch (shareError) {
            if (
                shareError instanceof DOMException &&
                shareError.name === "AbortError"
            ) {
                trackFeatureEvent(
                    "events",
                    "share_cancelled",
                    String(event.id),
                );
                return;
            }
        }

        try {
            await navigator.clipboard.writeText(
                [shareData.text, shareData.url].join("\n"),
            );
            shareState = "copied";
            trackFeatureEvent("events", "share", String(event.id));
            resetShareState();
        } catch {
            shareState = "error";
            trackFeatureEvent("events", "share_failed", String(event.id));
            resetShareState();
        }
    }

    async function handleCalendarSave() {
        if (!event) {
            return;
        }

        try {
            const { createEventCalendarIcs } = await import("$lib/utils/event-actions");
            const ics = createEventCalendarIcs(event);
            const blob = new Blob([ics], {
                type: "text/calendar;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = calendarFileName;
            document.body.append(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            calendarState = "saved";
            trackFeatureEvent("events", "calendar_save", String(event.id));
            resetCalendarState();
        } catch {
            calendarState = "error";
            trackFeatureEvent(
                "events",
                "calendar_save_failed",
                String(event.id),
            );
            resetCalendarState();
        }
    }
</script>

<section class="card p-4">
    <p class="meta-text">Schnellaktionen</p>
    <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <button
            type="button"
            onclick={handleShare}
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
        >
            <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    width="2"
                    d="M8.684 13.342C9.314 12.955 10.055 12.73 10.848 12.73c.793 0 1.534.225 2.164.612m-4.328 0a3 3 0 10-2.165-2.91m6.493 2.91a3 3 0 112.164-2.91m-8.657 2.91l8.657-5.82"
                />
            </svg>
            {shareState === "copied"
                ? "Link kopiert"
                : shareState === "error"
                ? "Teilen fehlgeschlagen"
                : "Teilen"}
        </button>

        <button
            type="button"
            onclick={handleCalendarSave}
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
        >
            <svg
                class="h-4 w-4"
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
            {calendarState === "saved"
                ? "Kalenderdatei geladen"
                : calendarState === "error"
                ? "Kalender fehlgeschlagen"
                : "In Kalender speichern"}
        </button>
    </div>

    {#if shareState === "copied"}
        <p class="meta-text mt-3">
            Den Veranstaltungslink kannst du jetzt in Messenger
            oder Mail einfuegen.
        </p>
    {:else if shareState === "error"}
        <p class="meta-text mt-3">
            Teilen war in diesem Browser nicht moeglich.
        </p>
    {/if}

    {#if calendarState === "saved"}
        <p class="meta-text mt-3">
            Die `.ics`-Datei wurde für deinen Kalender
            heruntergeladen.
        </p>
    {:else if calendarState === "error"}
        <p class="meta-text mt-3">
            Die Kalenderdatei konnte nicht erstellt werden.
        </p>
    {/if}
</section>
