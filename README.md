# RNT Kalender - Tango Events in der Region Rhein-Neckar

Mobile PWA für Tango-Veranstaltungen im Raum Heidelberg/Mannheim/Ludwigshafen. Listet Events vom [Rhein-Neckar-Tango](https://www.rhein-neckar-tango.de) WordPress.

## Features

- 📅 Event-Liste mit Datum-Filter (heute, Woche, Monat, alle)
- 🏷️ Typ-Filter (Milonga, Practica, Workshop, Kurs)
- 🔍 Sofort-Suche (Titel, Ort, DJ, Beschreibung)
- 🗺️ Ergebnisse auf Karte anzeigen
- 🖼️ Bild-Anzeige umschaltbar
- 📆 Kalender-Ansicht
- 📱 PWA - auf Home-Screen installierbar
- 📱 Mobil-optimiert

## Tech Stack

- [SvelteKit 5](https://kit.svelte.dev/) + Svelte 5
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) (OpenStreetMap)
- [@melt-ui/svelte](https://melt-ui.com/) (Accessible components)
- [carbon-icons-svelte](https://github.com/IBM/carbon-icons-svelte)
- Static Adapter → Cloudflare Pages

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Typecheck
npm run check

# Build
npm run build
```

## Deployment

Deployed automatically to **Cloudflare Pages** via GitHub Actions on push to `main`.

Custom Domain: `https://rnt.danieldekay.com`

### Manual Deploy

```bash
npm run build
wrangler pages deploy build
```

## API

Events werden vom WordPress REST API geladen:
`https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1`

## Lizenz

MIT