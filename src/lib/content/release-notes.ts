export type ReleaseNote = {
	version: string;
	releasedAt: string;
	headline: string;
	summary: string;
	highlights: string[];
};

export const releaseNotes: ReleaseNote[] = [
	{
		version: '0.1.5',
		releasedAt: '2026-04-28',
		headline: 'Teilen, speichern und besser orientieren',
		summary:
			'Dieses Update macht Veranstaltungen leichter teilbar, verbessert die Orientierung auf der Karte und behebt Datums- und Ladeprobleme in der App.',
		highlights: [
			'Veranstaltungen lassen sich jetzt direkt aus der Detailansicht teilen.',
			'Termine koennen als Kalenderdatei gespeichert und in den persoenlichen Kalender uebernommen werden.',
			'Die Kartenansicht zeigt in Markern jetzt Datum, Uhrzeit und Preis an.',
			'Mehrere Veranstaltungen am gleichen Ort werden in der Karte sauber zu einem Marker zusammengefasst.',
			'Der Kalender hat einen Schnellzugriff auf Heute bekommen.',
			'Die Datumsberechnung und das Laden der Veranstaltungsdaten wurden stabilisiert.'
		]
	}
];