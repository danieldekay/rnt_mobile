export interface CuratedLink {
	title: string;
	url: string;
	description: string;
	category: string;
}

export const CATEGORIES = [
	"Unterricht & Milongas",
	"Community & Events",
	"Musik & CDs",
	"Tanzschuhe & Accessoires",
	"Veranstaltungsportale",
	"Werkzeuge & Apps",
	"Allgemein",
];

export const LINKS: CuratedLink[] = [
	{
		title: "A Bailar",
		url: "https://www.abailar.de/",
		description: "Tango Unterricht und Milongas in München",
		category: "Unterricht & Milongas",
	},
	{
		title: "Tango Tangente",
		url: "http://tango-tangente.com/home_deutsch.php",
		description: "Tango in Kehl - Unterricht und Veranstaltungen",
		category: "Unterricht & Milongas",
	},
	{
		title: "Tangojam.de",
		url: "http://tangojam.de/?page_id=383",
		description: "Tango Jam Sessions und Community",
		category: "Unterricht & Milongas",
	},
	{
		title: "Tango Argentino Pforzheim",
		url: "https://www.diegoymirari.com/",
		description: "Tango Unterricht in Pforzheim",
		category: "Unterricht & Milongas",
	},
	{
		title: "Tangoloco",
		url: "https://www.tangoloco.de/",
		description: "Tango in Heidelberg und Mannheim",
		category: "Unterricht & Milongas",
	},
	{
		title: "TAKK – Tango im AKK",
		url: "https://www.facebook.com/groups/600706246607864/",
		description: "Tango Community Gruppe in Heidelberg",
		category: "Community & Events",
	},
	{
		title: "Rhein-Neckar Tango",
		url: "https://www.rhein-neckar-tango.de/",
		description: "Veranstaltungskalender für Rhein-Neckar Tango",
		category: "Veranstaltungsportale",
	},
	{
		title: "Tango de Argentina",
		url: "https://www.tango.de/",
		description: "Tango Musik und CDs",
		category: "Musik & CDs",
	},
	{
		title: "Tango Klassika",
		url: "https://www.tangoklassika.de/",
		description: "Klassische Tango Musik",
		category: "Musik & CDs",
	},
	{
		title: "TangoSchuh.de",
		url: "https://www.tangoschuh.de/",
		description: "Tanzschuhe und Accessoires für Tango",
		category: "Tanzschuhe & Accessoires",
	},
	{
		title: "Piazzolla Shop",
		url: "https://www.piazzollashop.de/",
		description: "Tango Musik, CDs und Instrumente",
		category: "Musik & CDs",
	},
	{
		title: "Tango Nuevo",
		url: "https://www.tango-nuevo.de/",
		description: "Moderne Tango Musik und Informationen",
		category: "Musik & CDs",
	},
];
