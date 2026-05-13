/**
 * Design Token Utilities
 * Provides utility functions for working with design tokens in TypeScript/Svelte
 */

/**
 * Get CSS custom property value
 * @param property - The CSS custom property name (without --)
 * @param element - The element to get the property from (defaults to document root)
 * @returns The computed property value
 */
export function getToken(property: string, element?: Element): string {
	const elementToUse = element || document.documentElement;
	const computedStyle = getComputedStyle(elementToUse);
	return computedStyle.getPropertyValue(`--${property}`);
}

/**
 * Get RGB color values from a color token
 * @param colorToken - The color token name (without --)
 * @param element - The element to get the property from
 * @returns An array of [r, g, b] values
 */
export function getColorRGB(
	colorToken: string,
	element?: Element,
): [number, number, number] {
	const value = getToken(colorToken, element);
	const rgb = value.trim().split(" ").map(Number);
	return rgb as [number, number, number];
}

/**
 * Get RGB color string from a color token
 * @param colorToken - The color token name (without --)
 * @param element - The element to get the property from
 * @returns CSS RGB string (e.g., "rgb(255, 255, 255)")
 */
export function getColorRGBString(
	colorToken: string,
	element?: Element,
): string {
	const [r, g, b] = getColorRGB(colorToken, element);
	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get spacing value in pixels
 * @param spacingToken - The spacing token name (without --)
 * @param element - The element to get the property from
 * @returns The spacing value in pixels as a number
 */
export function getSpacing(spacingToken: string, element?: Element): number {
	const value = getToken(spacingToken, element);
	// Remove 'rem' and convert to pixels (assuming 1rem = 16px)
	return parseFloat(value) * 16;
}

/**
 * Get font size in pixels
 * @param fontSizeToken - The font size token name (without --)
 * @param element - The element to get the property from
 * @returns The font size in pixels as a number
 */
export function getFontSize(fontSizeToken: string, element?: Element): number {
	const value = getToken(fontSizeToken, element);
	return parseFloat(value) * 16;
}

/**
 * Get border radius value in pixels
 * @param radiusToken - The radius token name (without --)
 * @param element - The element to get the property from
 * @returns The border radius value in pixels as a number
 */
export function getRadius(radiusToken: string, element?: Element): number {
	const value = getToken(radiusToken, element);
	if (value === "9999px") return 9999; // Full border radius
	return parseFloat(value) * 16;
}

/**
 * Get shadow value
 * @param shadowToken - The shadow token name (without --)
 * @param element - The element to get the property from
 * @returns The shadow value string
 */
export function getShadow(shadowToken: string, element?: Element): string {
	return getToken(shadowToken, element);
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color in rgb format [r, g, b]
 * @param color2 - Second color in rgb format [r, g, b]
 * @returns The contrast ratio (4.5:1 is WCAG AA standard)
 */
export function getContrastRatio(
	color1: [number, number, number],
	color2: [number, number, number],
): number {
	const luminance1 = getLuminance(color1);
	const luminance2 = getLuminance(color2);

	const lighter = Math.max(luminance1, luminance2);
	const darker = Math.min(luminance1, luminance2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 * @param color - Color in rgb format [r, g, b]
 * @returns The relative luminance value (0-1)
 */
function getLuminance(color: [number, number, number]): number {
	const [r, g, b] = color.map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if a color has sufficient contrast against a background
 * @param textColor - Text color token name
 * @param bgColor - Background color token name
 * @param element - The element to get properties from
 * @param minRatio - Minimum contrast ratio (default 4.5 for WCAG AA)
 * @returns Whether the contrast meets the minimum requirement
 */
export function hasSufficientContrast(
	textColor: string,
	bgColor: string,
	element?: Element,
	minRatio: number = 4.5,
): boolean {
	const textRGB = getColorRGB(textColor, element);
	const bgRGB = getColorRGB(bgColor, element);
	const contrast = getContrastRatio(textRGB, bgRGB);
	return contrast >= minRatio;
}

/**
 * Get theme variants for a component
 * @returns Object containing theme variant mappings
 */
export function getThemeVariants() {
	return {
		colors: {
			primary: {
				50: "var(--color-primary-50)",
				100: "var(--color-primary-100)",
				200: "var(--color-primary-200)",
				300: "var(--color-primary-300)",
				400: "var(--color-primary-400)",
				500: "var(--color-primary-500)",
				600: "var(--color-primary-600)",
				700: "var(--color-primary-700)",
				800: "var(--color-primary-800)",
				900: "var(--color-primary-900)",
			},
			secondary: {
				50: "var(--color-secondary-50)",
				100: "var(--color-secondary-100)",
				200: "var(--color-secondary-200)",
				300: "var(--color-secondary-300)",
				400: "var(--color-secondary-400)",
				500: "var(--color-secondary-500)",
				600: "var(--color-secondary-600)",
				700: "var(--color-secondary-700)",
				800: "var(--color-secondary-800)",
				900: "var(--color-secondary-900)",
			},
			accent: {
				50: "var(--color-accent-50)",
				100: "var(--color-accent-100)",
				200: "var(--color-accent-200)",
				300: "var(--color-accent-300)",
				400: "var(--color-accent-400)",
				500: "var(--color-accent-500)",
				600: "var(--color-accent-600)",
				700: "var(--color-accent-700)",
				800: "var(--color-accent-800)",
				900: "var(--color-accent-900)",
			},
			neutral: {
				50: "var(--color-neutral-50)",
				100: "var(--color-neutral-100)",
				200: "var(--color-neutral-200)",
				300: "var(--color-neutral-300)",
				400: "var(--color-neutral-400)",
				500: "var(--color-neutral-500)",
				600: "var(--color-neutral-600)",
				700: "var(--color-neutral-700)",
				800: "var(--color-neutral-800)",
				900: "var(--color-neutral-900)",
			},
			semantic: {
				success: "var(--color-success)",
				error: "var(--color-error)",
				warning: "var(--color-warning)",
				info: "var(--color-info)",
			},
		},
		spacing: {
			0: "var(--spacing-0)",
			1: "var(--spacing-1)",
			2: "var(--spacing-2)",
			3: "var(--spacing-3)",
			4: "var(--spacing-4)",
			5: "var(--spacing-5)",
			6: "var(--spacing-6)",
			7: "var(--spacing-7)",
			8: "var(--spacing-8)",
			9: "var(--spacing-9)",
			10: "var(--spacing-10)",
			11: "var(--spacing-11)",
			12: "var(--spacing-12)",
		},
		typography: {
			sizes: {
				xs: "var(--text-xs)",
				sm: "var(--text-sm)",
				base: "var(--text-base)",
				lg: "var(--text-lg)",
				xl: "var(--text-xl)",
				"2xl": "var(--text-2xl)",
				"3xl": "var(--text-3xl)",
				"4xl": "var(--text-4xl)",
				"5xl": "var(--text-5xl)",
				"6xl": "var(--text-6xl)",
			},
			weights: {
				regular: "var(--font-regular)",
				medium: "var(--font-medium)",
				semibold: "var(--font-semibold)",
				bold: "var(--font-bold)",
			},
			lineHeights: {
				tight: "var(--leading-tight)",
				snug: "var(--leading-snug)",
				normal: "var(--leading-normal)",
				relaxed: "var(--leading-relaxed)",
				loose: "var(--leading-loose)",
			},
		},
		borderRadius: {
			none: "var(--radius-none)",
			sm: "var(--radius-sm)",
			md: "var(--radius-md)",
			lg: "var(--radius-lg)",
			xl: "var(--radius-xl)",
			"2xl": "var(--radius-2xl)",
			full: "var(--radius-full)",
		},
		shadows: {
			none: "var(--shadow-none)",
			sm: "var(--shadow-sm)",
			md: "var(--shadow-md)",
			lg: "var(--shadow-lg)",
			xl: "var(--shadow-xl)",
			"2xl": "var(--shadow-2xl)",
		},
	};
}

/**
 * Set CSS custom property value
 * @param property - The CSS custom property name (without --)
 * @param value - The value to set
 * @param element - The element to set the property on (defaults to document root)
 */
export function setToken(
	property: string,
	value: string,
	element?: Element,
): void {
	const elementToUse = (element || document.documentElement) as HTMLElement;
	elementToUse.style.setProperty(`--${property}`, value);
}

/**
 * Set multiple CSS custom properties at once
 * @param tokens - Object mapping property names (without --) to values
 * @param element - The element to set the properties on (defaults to document root)
 */
export function setTokens(
	tokens: Record<string, string>,
	element?: Element,
): void {
	Object.entries(tokens).forEach(([property, value]) => {
		setToken(property, value, element);
	});
}
