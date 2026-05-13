export type ReleaseNote = {
    version: string;
    releasedAt: string;
    headline: string;
    summary: string;
    highlights: string[];
};

export const releaseNotes: ReleaseNote[] = [
    {
        version: '0.2.0',
        releasedAt: '2026-05-09',
        headline: 'Profile, Redaktion und Verzeichnisse wachsen zusammen',
        summary:
            'Dieses Minor-Release bringt mehr App-eigene Detailseiten, bessere Redaktionszugriffe auf WordPress und einheitliche Filter für DJs, Veranstalter und Tanzraeume.',
        highlights: [
            'Blogbeitraege, Ankuendigungen, DJs und Veranstalter haben jetzt eigene Detailseiten direkt in der App.',
            'Event- und Listenansichten verlinken jetzt auf interne DJ- und Veranstalterprofile statt nur auf externe Ziele.',
            'Ankuendigungen verknuepfen sich jetzt mit passenden Terminen, Veranstalterprofilen und dem WordPress-Backend.',
            'Die linke Desktop-Seitenleiste zeigt jetzt WordPress-Loginstatus und Schnellzugriffe auf wichtige Admin-Bereiche.',
            'Links und Ankuendigungen wurden für Desktop klarer neu strukturiert: Filter liegen direkt ueber dem Inhalt und Raster wirken konsistenter.',
            'DJs, Veranstalter und Tanzraeume teilen sich jetzt dieselben Datumsfilter für Nächste 7 Tage, diesen Monat und Nächste 3 Monate.',
            'Der Kalender wurde auf Desktop weiter verfeinert und direkte Aufrufe dynamischer Seiten laufen in Produktion jetzt stabil ueber den Worker-Assets-Stack.'
        ]
    },
    {
        version: '0.1.7',
        releasedAt: '2026-05-07',
        headline: 'Bessere Navigation und klarere Rueckmeldungen',
        summary:
            'Dieses Update verbessert die Navigation, ueberarbeitet die Newsletter-Bestaetigung und bringt mehrere kleinere Interface-Verbesserungen.',
        highlights: [
            'Der Kalender ist jetzt unter /kalender erreichbar – passend zur deutschen Sprache der App.',
            'Das RNT-Logo im Header ist jetzt ein Link zur Startseite.',
            'Die monatliche Ansicht laedt jetzt alle Termine bis zum letzten Tag des laufenden Monats.',
            'Die Newsletter-Anmeldung zeigt jetzt eine klare Bestaetigung: „Vielen Dank! Wir haben dir eine Bestaetigungs-E-Mail geschickt.“',
            'Der Newsletter-Bereich im Footer ist standardmaessig eingeklappt.',
            'Filter-Chips zeigen jetzt die Anzahl der Veranstaltungen pro Kategorie an.',
            'Das Eintritts-Preissymbol zeigt jetzt ein €-Zeichen statt eines Dollar-Icons.',
            'Das App-Logo wird jetzt als Quadrat angezeigt.'
        ]
    },
    {
        version: '0.1.6',
        releasedAt: '2026-04-30',
        headline: 'Newsletter-Anmeldung direkt in der App',
        summary:
            'Dieses Patch-Release bringt eine neue Newsletter-Anmeldung im Footer, die ohne Seitenwechsel funktioniert und ueber den RNT-Worker sicher an Sendy weitergeleitet wird.',
        highlights: [
            'Neuer Newsletter-Bereich im Footer auf allen Seiten der App.',
            'Die Anmeldung laeuft ohne Neuladen der Seite und zeigt Rueckmeldungen direkt im Formular an.',
            'Der Browser sendet die Anmeldung an einen gleichnamigen RNT-Endpunkt, der sie serverseitig an Sendy weiterleitet.',
            'E-Mail-Pruefung und Honeypot-Schutz reduzieren fehlerhafte oder automatisierte Eintraege.',
            'Deployment- und Worker-Konfiguration wurden um die Sendy-Anbindung erweitert.'
        ]
    },
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
    },
    {
        version: '0.1.3',
        releasedAt: '2026-04-27',
        headline: 'Sicherheitsupdate und Analytics',
        summary:
            'Kleine, aber wichtige Verbesserungen unter der Haube: eine Sicherheitslücke in einer Abhängigkeit wurde geschlossen und die Nutzungsstatistiken funktionieren jetzt zuverlässig für installierte Apps.',
        highlights: [
            'Sicherheitslücke in der cookie-Bibliothek (GHSA-pxg6-pf52-xh8x) wurde durch einen Versionsfix behoben – npm audit meldet jetzt null Schwachstellen.',
            'Matomo-Analytics laufen jetzt vollständig für installierte PWA-Apps – zuvor wurden Besuche in der installierten App nicht erfasst.',
            'Installierte Apps werden in den Statistiken jetzt sauber vom normalen Browser-Aufruf unterschieden.',
            'Lange Sitzungen in der installierten App werden jetzt korrekt mit realen Nutzungszeiten gemessen.',
            'Offline-Ereignisse werden beim nächsten Netzwerkzugriff zuverlässig nachgesendet.'
        ]
    },
    {
        version: '0.1.2',
        releasedAt: '2026-04-27',
        headline: 'App installieren – jetzt für alle Browser',
        summary:
            'Der neue Installieren-Button im Header ermöglicht es, die App auf jedem Gerät und in jedem Browser als PWA zu speichern – mit verständlichen Schritt-für-Schritt-Anleitungen.',
        highlights: [
            'Neuer Installieren-Button im Header der App – sichtbar auf allen Seiten.',
            'Auf Android und Desktop öffnet sich der native Installationsdialog des Browsers.',
            'Auf iOS Safari, Android Firefox, Samsung Internet und Desktop Safari gibt es illustrierte Anweisungen, wie die App zum Startbildschirm hinzugefügt wird.',
            'Der frühere Installations-Banner am unteren Bildschirmrand wurde durch diese Lösung ersetzt.'
        ]
    },
    {
        version: '0.1.1',
        releasedAt: '2026-04-27',
        headline: 'Erster öffentlicher Launch',
        summary:
            'Der RNT Kalender ist als progressive Web-App (PWA) gestartet. Du kannst ihn direkt im Browser nutzen oder auf deinem Gerät installieren.',
        highlights: [
            'Veranstaltungen des Rhein-Neckar-Tango direkt im Browser – ohne Installation notwendig.',
            'Kalenderansicht und Listenansicht mit Filter nach Datum, Typ und Musikstil.',
            'Kartenansicht zeigt Veranstaltungsorte in der Region.',
            'Suchfunktion für schnellen Zugriff auf bestimmte Veranstaltungen.',
            'Datenschutzkonforme Nutzung: Analytik und Karten nur nach ausdrücklicher Zustimmung.',
            'Automatische Updates: die App hält sich selbst aktuell und zeigt einen Hinweis, wenn eine neue Version bereitsteht.',
            'Als PWA installierbar: Startbildschirm-Icon, Offline-fähigkeit und App-ähnliche Darstellung.'
        ]
    }
];