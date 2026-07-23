export type NavMatch = "exact" | "prefix";

export type NavItem = {
    label: string;
    href: string;
    match: NavMatch;
    iconPath: string;
};

export type FooterLink =
    | { label: string; href: string; action?: never }
    | { label: string; action: "consent"; href?: never };

export const navItems: NavItem[] = [
    {
        label: "Veranstaltungen",
        href: "/",
        match: "exact",
        iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16",
    },
    {
        label: "Kalender",
        href: "/kalender",
        match: "prefix",
        iconPath:
            "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
        label: "News",
        href: "/blog",
        match: "prefix",
        iconPath:
            "M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm3 4h8m-8 4h8m-8 4h5",
    },
    {
        label: "Ankündigungen",
        href: "/ankuendigungen",
        match: "prefix",
        iconPath:
            "M7 8h10M7 12h10M7 16h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
    },
    {
        label: "DJs",
        href: "/djs",
        match: "prefix",
        iconPath:
            "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    },
    {
        label: "Veranstalter",
        href: "/veranstalter",
        match: "prefix",
        iconPath:
            "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
        label: "Tanzräume",
        href: "/tanzraeume",
        match: "prefix",
        iconPath:
            "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
        label: "Links",
        href: "/links",
        match: "prefix",
        iconPath:
            "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    },
];

export const footerLinks: FooterLink[] = [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Cookie-Richtlinie", href: "/cookie-richtlinie" },
    { label: "Einwilligung", action: "consent" },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
    if (item.match === "exact") {
        return pathname === item.href;
    }

    return (
        pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
}
