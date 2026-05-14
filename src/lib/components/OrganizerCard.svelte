<!--
  OrganizerCard component using design tokens and enhanced organizer data
  
  Features:
  - Profile image display with fallbacks
  - Organizer information and bio
  - Next 2 events preview (like DJ cards)
  - Social media links
  - Verification status
  - Responsive design
  - Accessibility features
-->

<script lang="ts">
    import { onMount } from "svelte";
    import Card from "./Card.svelte";
    import Heading from "./Heading.svelte";
    import Text from "./Text.svelte";
    import Badge from "./Badge.svelte";
    import Button from "./Button.svelte";
    import { resolve } from "$app/paths";
    import type {
        EnhancedOrganizer,
        OrganizerNextEventSummary,
    } from "$lib/types";

    let {
        organizer,
        nextEvents = [],
        showVerification = true,
        showSocialLinks = true,
        showContactInfo = false,
        showDescription = true,
        maxDescriptionLength = 150,
        showStatistics = false,
    }: {
        organizer: EnhancedOrganizer;
        nextEvents?: OrganizerNextEventSummary[];
        showVerification?: boolean;
        showSocialLinks?: boolean;
        showContactInfo?: boolean;
        showDescription?: boolean;
        maxDescriptionLength?: number;
        showStatistics?: boolean;
    } = $props();

    let imageUrl: string | null = $state(null);
    let isLoading = $state(true);

    // Load image with error handling
    onMount(async () => {
        try {
            if (organizer.image && organizer.image !== "false") {
                const img = new Image();
                img.onload = () => {
                    imageUrl = organizer.image || null;
                    isLoading = false;
                };
                img.onerror = () => {
                    imageUrl = null;
                    isLoading = false;
                };
                img.src = organizer.image || "";
            } else {
                imageUrl = null;
                isLoading = false;
            }
        } catch (err) {
            console.error("Error loading organizer image:", err);
            imageUrl = null;
            isLoading = false;
        }
    });

    // Get initials for avatar fallback
    function getInitials(): string {
        if (!organizer.organizer) return "";
        const tokens = organizer.organizer
            .split(/[\s\-_]+/)
            .map((t) => t.replace(/[^a-zA-Z\u00C0-\u017E]/g, ""))
            .filter((t) => t.length > 0);
        if (tokens.length === 0) return "";
        if (tokens.length === 1) return tokens[0].charAt(0).toUpperCase();
        return (tokens[0].charAt(0) + tokens[1].charAt(0)).toUpperCase();
    }

    // Generate a colorful background color based on initials
    function getAvatarColor(initials: string): string {
        const colors = [
            "#3B82F6",
            "#8B5CF6",
            "#EC4899",
            "#F59E0B",
            "#10B981",
            "#F97316",
            "#6366F1",
            "#84CC16",
            "#06B6D4",
            "#D94600",
        ];
        let hash = 0;
        for (let i = 0; i < initials.length; i++) {
            hash = initials.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // Truncate description
    function truncateDescription(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    // Format phone number
    function formatPhone(phone: string): string {
        if (!phone) return "";
        return phone.replace(/\s/g, "").replace(/^(\+49|0)/, "+49 ");
    }

    // Get social media platforms
    function getSocialPlatforms(): string[] {
        if (!organizer.socialMedia) return [];
        return Object.keys(organizer.socialMedia).filter(
            (platform) =>
                organizer.socialMedia?.[
                    platform as keyof typeof organizer.socialMedia
                ],
        );
    }

    // Handle social media link click
    function handleSocialClick(platform: string, url: string) {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    // Handle contact action
    function handleContactAction(type: "phone" | "email" | "website") {
        const contactInfo = {
            phone: organizer.phone,
            email: organizer.email,
            website: organizer.website,
        }[type];

        if (!contactInfo) return;

        if (type === "phone") {
            window.location.href = `tel:${formatPhone(contactInfo)}`;
        } else if (type === "email") {
            window.location.href = `mailto:${contactInfo}`;
        } else if (type === "website") {
            window.open(contactInfo, "_blank", "noopener,noreferrer");
        }
    }

    // Handle organizer profile view
    function handleViewProfile() {
        if (organizer.slug) {
            window.location.href = resolve(`/veranstalter/${organizer.slug}`);
        }
    }

    // Format event meta line
    function getEventMeta(event: OrganizerNextEventSummary): string {
        return event.city
            ? `${event.dateLabel} · ${event.city}`
            : event.dateLabel;
    }
</script>

<Card
    variant="outlined"
    padding="md"
    responsive={true}
    role="article"
    class="flex flex-col h-full"
>
    <!-- Top row: avatar + name/badges -->
    <div class="organizer-card-top">
        <!-- Avatar -->
        <div
            class="organizer-avatar {imageUrl
                ? 'organizer-avatar--image'
                : 'organizer-avatar--initials'}"
        >
            {#if isLoading}
                <div class="skeleton"></div>
            {:else if imageUrl}
                <img
                    src={imageUrl}
                    alt="{organizer.organizer} logo"
                    loading="lazy"
                    width={56}
                    height={56}
                    class="organizer-image"
                    onerror={() => (imageUrl = null)}
                />
            {:else}
                <div
                    class="organizer-avatar-initials"
                    style="background-color: {getAvatarColor(getInitials())}"
                >
                    <span class="organizer-initials-text">{getInitials()}</span>
                </div>
            {/if}

            {#if showVerification && organizer.verification?.isVerified}
                <Badge variant="success" size="sm">Verified</Badge>
            {/if}
        </div>

        <!-- Name and badges -->
        <div class="organizer-header">
            <Heading
                level={3}
                size="base"
                weight="semibold"
                id="organizer-name"
            >
                <a
                    href={organizer.slug
                        ? resolve(`/veranstalter/${organizer.slug}`)
                        : undefined}
                    data-sveltekit-preload-data="hover"
                    class="transition-colors hover:text-action-primary"
                >
                    {organizer.organizer}
                </a>
            </Heading>
            {#if organizer.details?.organizationType}
                <Badge variant="muted" size="sm">
                    {organizer.details.organizationType}
                </Badge>
            {/if}
        </div>
    </div>

    <!-- Description -->
    {#if showDescription && organizer.details?.description}
        <Text size="sm" color="muted" class="mt-2">
            {truncateDescription(
                organizer.details.description,
                maxDescriptionLength,
            )}
        </Text>
    {/if}

    <!-- Events – full card width -->
    {#if nextEvents.length > 0}
        <div class="organizer-events">
            {#each nextEvents as event}
                <a
                    href={event.internalPath
                        ? resolve(event.internalPath)
                        : event.externalUrl}
                    data-sveltekit-preload-data="hover"
                    target={event.externalUrl && !event.internalPath
                        ? "_blank"
                        : undefined}
                    rel={event.externalUrl && !event.internalPath
                        ? "noopener noreferrer"
                        : undefined}
                    class="block hover:opacity-90 transition-opacity"
                >
                    <div class="flex items-start gap-2">
                        <svg
                            class="h-4 w-4 text-action-primary flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-medium leading-snug text-text-default line-clamp-2"
                            >
                                {event.title}
                            </p>
                            <p class="text-xs text-text-muted mt-0.5">
                                {getEventMeta(event)}
                            </p>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <div class="organizer-events organizer-events--empty">
            <svg
                class="h-4 w-4 text-amber-600/80 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0 1 1 0 002 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                />
            </svg>
            <p class="text-sm text-amber-800/80">
                Keine Termine im gewählten Zeitraum
            </p>
        </div>
    {/if}

    <!-- Action -->
    <div class="organizer-actions">
        <a
            href={resolve(`/veranstalter/${organizer.slug}`)}
            data-sveltekit-preload-data="hover"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-text-default bg-white border border-border-default hover:bg-surface-subtle hover:shadow-md transition-all duration-200 rounded-badge"
        >
            Profil ansehen
        </a>
    </div>

    <!-- Tags -->
    {#if organizer.details?.tags && organizer.details.tags.length > 0}
        <div class="organizer-tags">
            {#each organizer.details.tags as tag}
                <Badge variant="muted" size="sm">{tag}</Badge>
            {/each}
        </div>
    {/if}
</Card>

<style>
    /* ── Top row: avatar + name ── */
    .organizer-card-top {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
    }

    /* Avatar wrapper – size varies by content type */
    .organizer-avatar {
        flex-shrink: 0;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Image avatar: larger circle */
    .organizer-avatar--image {
        width: 56px;
        height: 56px;
    }

    /* Initials avatar: smaller circle */
    .organizer-avatar--initials {
        width: 40px;
        height: 40px;
    }

    /* Skeleton loading placeholder */
    .skeleton {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .organizer-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        /* hairline ring */
        box-shadow: 0 0 0 1px var(--border-default, #e5e7eb);
    }

    .organizer-avatar-initials {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        /* hairline ring */
        box-shadow: 0 0 0 1px var(--border-default, #e5e7eb);
    }

    .organizer-initials-text {
        font-family: "Arial Narrow", Arial, ui-sans-serif, sans-serif;
        font-size: 0.8125rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: white;
        -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.25);
        line-height: 1;
    }

    /* Name + badge column */
    .organizer-header {
        flex: 1;
        min-width: 0;
        padding-top: 0.125rem;
    }

    .organizer-header a {
        color: inherit;
        text-decoration: none;
    }

    /* Events section – full card width */
    .organizer-events {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid
            color-mix(in srgb, var(--border-default, #e5e7eb) 50%, transparent);
    }

    .organizer-events--empty {
        flex-direction: row;
        gap: 0.5rem;
        align-items: flex-start;
        border-top-color: color-mix(in srgb, #fbbf24 30%, transparent);
    }

    /* Bottom-right action button */
    .organizer-actions {
        display: flex;
        margin-top: auto;
        padding-top: 0.75rem;
        justify-content: flex-end;
    }

    .organizer-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-default, #e5e7eb);
    }
</style>
