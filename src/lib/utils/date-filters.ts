import type { TribeEvent, OrganizerNextEventSummary } from '$lib/types';
export type EntityDateFilter = 'all' | 'next-7-days' | 'current-month' | 'next-3-months';

export type DateFilterCounts = Record<EntityDateFilter, number>;

export const ENTITY_DATE_FILTER_OPTIONS: Array<{ id: EntityDateFilter; label: string }> = [
    { id: 'all', label: 'Alle' },
    { id: 'next-7-days', label: 'Nächste 7 Tage' },
    { id: 'current-month', label: 'Dieser Monat' },
    { id: 'next-3-months', label: 'Nächste 3 Monate' }
];

export function emptyDateFilterCounts(): DateFilterCounts {
    return {
        all: 0,
        'next-7-days': 0,
        'current-month': 0,
        'next-3-months': 0
    };
}

export function getDateFilterLabel(filter: EntityDateFilter): string {
    return ENTITY_DATE_FILTER_OPTIONS.find((option) => option.id === filter)?.label ?? 'Alle';
}

export function countEntitiesForDateFilters<T>(
    items: T[],
    getCounts: (item: T) => Partial<Record<EntityDateFilter, number>>
): DateFilterCounts {
    const totals = emptyDateFilterCounts();

    for (const item of items) {
        const counts = getCounts(item);

        for (const option of ENTITY_DATE_FILTER_OPTIONS) {
            if ((counts[option.id] ?? 0) > 0) {
                totals[option.id] += 1;
            }
        }
    }

    return totals;
}

export function getMatchingDateFilters(startDate: string, referenceDate: Date = new Date()): EntityDateFilter[] {
    const timestamp = Date.parse(startDate);
    if (!Number.isFinite(timestamp)) {
        return [];
    }

    const reference = startOfDay(referenceDate).getTime();
    if (timestamp < reference) {
        return [];
    }

    const currentMonthEnd = endOfMonth(referenceDate).getTime();
    const next7DaysEnd = endOfDay(addDays(referenceDate, 6)).getTime();
    const next3MonthsEnd = endOfMonth(addMonths(referenceDate, 2)).getTime();

    const filters: EntityDateFilter[] = ['all'];

    if (timestamp <= next7DaysEnd) {
        filters.push('next-7-days');
    }

    if (timestamp <= currentMonthEnd) {
        filters.push('current-month');
    }

    if (timestamp <= next3MonthsEnd) {
        filters.push('next-3-months');
    }

    return filters;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

function addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, date.getDate(), 0, 0, 0, 0);
}
// Helper to create OrganizerNextEventSummary from TribeEvent
export function createOrganizerNextEventSummary(event: TribeEvent): OrganizerNextEventSummary {
    const startDate = new Date(event.start_date);
    const dateLabel = startDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short'
    });
    
    return {
        internalPath: `/event/${event.id}` as `/event/${number}`,
        externalUrl: event.url,
        title: event.title,
        dateLabel,
        city: event.venue?.city ?? ''
    };
}

// Get next events for an organizer from their events
export function getNextEventsForOrganizer(
    events: TribeEvent[],
    organizerId: number,
    maxResults: number = 2
): OrganizerNextEventSummary[] {
    const now = new Date();
    return events
        .filter(event => 
            event.organizer.some(org => org.id === organizerId) &&
            new Date(event.start_date) >= now
        )
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, maxResults)
        .map(createOrganizerNextEventSummary);
}
