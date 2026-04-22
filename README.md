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
- Static Adapter → Cloudflare Worker Assets

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

Deployed automatically via **GitHub Actions** to the Cloudflare Worker Assets service `rnt` on push to `main`.

Live URLs:

- `https://mobile.rhein-neckar-tango.de`
- `https://rnt.daniel-1f6.workers.dev`

### Manual Deploy

```bash
npm run build
npx wrangler deploy --message "Manual deploy"
```

## API

Events werden vom WordPress REST API geladen:
`https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1`

## Lizenz

MIT