import { describe, it, expect } from 'vitest';

import { renderComponent } from '../../test/render';
import TextSlotWrapper from '../../test/fixtures/TextSlotWrapper.svelte';
import Text from './Text.svelte';

describe('Text Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Text);
		const text = component.querySelector('p');
		expect(text).toBeTruthy();
		expect(text?.classList.contains('text-base')).toBe(true);
		expect(text?.classList.contains('font-regular')).toBe(true);
	});

	it('renders with different sizes', () => {
		const { component: xs } = renderComponent(Text, { size: 'xs' });
		const { component: sm } = renderComponent(Text, { size: 'sm' });
		const { component: base } = renderComponent(Text, { size: 'base' });
		const { component: lg } = renderComponent(Text, { size: 'lg' });
		const { component: xl } = renderComponent(Text, { size: 'xl' });
		const { component: size2xl } = renderComponent(Text, { size: '2xl' });
		const { component: size3xl } = renderComponent(Text, { size: '3xl' });
		const { component: size4xl } = renderComponent(Text, { size: '4xl' });
		const { component: size5xl } = renderComponent(Text, { size: '5xl' });
		const { component: size6xl } = renderComponent(Text, { size: '6xl' });

		expect(xs.querySelector('p')?.classList.contains('text-xs')).toBe(true);
		expect(sm.querySelector('p')?.classList.contains('text-sm')).toBe(true);
		expect(base.querySelector('p')?.classList.contains('text-base')).toBe(true);
		expect(lg.querySelector('p')?.classList.contains('text-lg')).toBe(true);
		expect(xl.querySelector('p')?.classList.contains('text-xl')).toBe(true);
		expect(size2xl.querySelector('p')?.classList.contains('text-2xl')).toBe(true);
		expect(size3xl.querySelector('p')?.classList.contains('text-3xl')).toBe(true);
		expect(size4xl.querySelector('p')?.classList.contains('text-4xl')).toBe(true);
		expect(size5xl.querySelector('p')?.classList.contains('text-5xl')).toBe(true);
		expect(size6xl.querySelector('p')?.classList.contains('text-6xl')).toBe(true);
	});

	it('renders with different weights', () => {
		const { component: regular } = renderComponent(Text, { weight: 'regular' });
		const { component: medium } = renderComponent(Text, { weight: 'medium' });
		const { component: semibold } = renderComponent(Text, { weight: 'semibold' });
		const { component: bold } = renderComponent(Text, { weight: 'bold' });

		expect(regular.querySelector('p')?.classList.contains('font-regular')).toBe(true);
		expect(medium.querySelector('p')?.classList.contains('font-medium')).toBe(true);
		expect(semibold.querySelector('p')?.classList.contains('font-semibold')).toBe(true);
		expect(bold.querySelector('p')?.classList.contains('font-bold')).toBe(true);
	});

	it('renders with different line heights', () => {
		const { component: tight } = renderComponent(Text, { lineHeight: 'tight' });
		const { component: snug } = renderComponent(Text, { lineHeight: 'snug' });
		const { component: normal } = renderComponent(Text, { lineHeight: 'normal' });
		const { component: relaxed } = renderComponent(Text, { lineHeight: 'relaxed' });
		const { component: loose } = renderComponent(Text, { lineHeight: 'loose' });

		expect(tight.querySelector('p')?.classList.contains('leading-tight')).toBe(true);
		expect(snug.querySelector('p')?.classList.contains('leading-snug')).toBe(true);
		expect(normal.querySelector('p')?.classList.contains('leading-normal')).toBe(true);
		expect(relaxed.querySelector('p')?.classList.contains('leading-relaxed')).toBe(true);
		expect(loose.querySelector('p')?.classList.contains('leading-loose')).toBe(true);
	});

	it('renders with different colors', () => {
		const { component: defaultColor } = renderComponent(Text, { color: 'default' });
		const { component: mutedColor } = renderComponent(Text, { color: 'muted' });
		const { component: subtleColor } = renderComponent(Text, { color: 'subtle' });
		const { component: inverseColor } = renderComponent(Text, { color: 'inverse' });
		const { component: linkColor } = renderComponent(Text, { color: 'link' });

		expect(defaultColor.querySelector('p')?.classList.contains('text-text-default')).toBe(true);
		expect(mutedColor.querySelector('p')?.classList.contains('text-text-muted')).toBe(true);
		expect(subtleColor.querySelector('p')?.classList.contains('text-text-subtle')).toBe(true);
		expect(inverseColor.querySelector('p')?.classList.contains('text-text-inverse')).toBe(true);
		expect(linkColor.querySelector('p')?.classList.contains('text-text-link')).toBe(true);
	});

	it('renders with tracking', () => {
		const { component: tight } = renderComponent(Text, { tracking: 'tight' });
		const { component: normal } = renderComponent(Text, { tracking: 'normal' });
		const { component: wide } = renderComponent(Text, { tracking: 'wide' });

		expect(tight.querySelector('p')?.classList.contains('tracking-tight')).toBe(true);
		expect(normal.querySelector('p')?.classList.contains('tracking-normal')).toBe(true);
		expect(wide.querySelector('p')?.classList.contains('tracking-wide')).toBe(true);
	});

	it('renders with text transform', () => {
		const { component: uppercase } = renderComponent(Text, { transform: 'uppercase' });
		const { component: lowercase } = renderComponent(Text, { transform: 'lowercase' });
		const { component: capitalize } = renderComponent(Text, { transform: 'capitalize' });

		expect(uppercase.querySelector('p')?.classList.contains('uppercase')).toBe(true);
		expect(lowercase.querySelector('p')?.classList.contains('lowercase')).toBe(true);
		expect(capitalize.querySelector('p')?.classList.contains('capitalize')).toBe(true);
	});

	it('renders with truncate enabled', () => {
		const { component } = renderComponent(Text, { truncate: true });
		const text = component.querySelector('p');
		expect(text?.classList.contains('truncate')).toBe(true);
	});

	it('renders with wrap enabled', () => {
		const { component } = renderComponent(Text, { wrap: true });
		const text = component.querySelector('p');
		expect(text?.classList.contains('whitespace-normal')).toBe(true);
	});

	it('renders with wrap disabled', () => {
		const { component } = renderComponent(Text, { wrap: false });
		const text = component.querySelector('p');
		expect(text?.classList.contains('whitespace-nowrap')).toBe(true);
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Text, { as: 'span' });
		const text = component.querySelector('span');
		expect(text).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Text, {
			id: 'test-text',
			role: 'paragraph'
		});
		const text = component.querySelector('p');
		expect(text?.getAttribute('id')).toBe('test-text');
		expect(text?.getAttribute('role')).toBe('paragraph');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Text, { responsive: true, size: 'base' });
		const text = component.querySelector('p');
		expect(text?.classList.contains('sm:text-lg')).toBe(true);
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Text, { responsive: false, size: 'base' });
		const text = component.querySelector('p');
		expect(text?.classList.contains('sm:text-lg')).toBe(false);
	});

	it('renders with slot content', () => {
		const { component } = renderComponent(TextSlotWrapper);
		const text = component.querySelector('p');
		expect(text?.textContent?.includes('Test Text Content')).toBe(true);
	});
});