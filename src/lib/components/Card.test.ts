import { describe, it, expect } from 'vitest';

import { renderComponent } from '../../test/render';
import Card from './Card.svelte';
import CardSlotWrapper from '../../test/fixtures/CardSlotWrapper.svelte';

describe('Card Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Card);
		const card = component.querySelector('div');
		expect(card).toBeTruthy();
		expect(card?.classList.contains('bg-card')).toBe(true);
	});

	it('renders with elevated variant', () => {
		const { component } = renderComponent(Card, { variant: 'elevated' });
		const card = component.querySelector('div');
		expect(card?.classList.contains('shadow-lg')).toBe(true);
		expect(card?.classList.contains('hover:shadow-xl')).toBe(true);
	});

	it('renders with outlined variant', () => {
		const { component } = renderComponent(Card, { variant: 'outlined' });
		const card = component.querySelector('div');
		expect(card?.classList.contains('border')).toBe(true);
		expect(card?.classList.contains('border-border-default')).toBe(true);
	});

	it('renders with custom padding', () => {
		const { component } = renderComponent(Card, { padding: 'lg' });
		const card = component.querySelector('div');
		expect(card?.classList.contains('p-6')).toBe(true);
	});

	it('renders with custom radius', () => {
		const { component } = renderComponent(Card, { radius: 'full' });
		const card = component.querySelector('div');
		expect(card?.classList.contains('rounded-full')).toBe(true);
	});

	it('renders with custom shadow', () => {
		const { component } = renderComponent(Card, { shadow: 'xl' });
		const card = component.querySelector('div');
		expect(card?.classList.contains('shadow-xl')).toBe(true);
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Card, { as: 'section' });
		const card = component.querySelector('section');
		expect(card).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Card, {
			role: 'region',
			ariaLabel: 'Test Card',
			id: 'test-card',
			title: 'Test Title'
		});
		const card = component.querySelector('div');
		expect(card?.getAttribute('role')).toBe('region');
		expect(card?.getAttribute('aria-label')).toBe('Test Card');
		expect(card?.getAttribute('id')).toBe('test-card');
		expect(card?.getAttribute('title')).toBe('Test Title');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Card, { responsive: true });
		const card = component.querySelector('div');
		expect(card?.classList.contains('sm:p-6')).toBe(true);
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Card, { responsive: false });
		const card = component.querySelector('div');
		expect(card?.classList.contains('sm:p-6')).toBe(false);
	});

	it('renders with slot content', () => {
		const { component } = renderComponent(CardSlotWrapper);
		const card = component.querySelector('div');
		expect(card?.textContent?.includes('Test Content')).toBe(true);
	});

	it('handles tabindex', () => {
		const { component } = renderComponent(Card, { tabindex: 1 });
		const card = component.querySelector('div');
		expect(card?.getAttribute('tabindex')).toBe('1');
	});
});