<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import { getContext } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import type { Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string; // Note the added 'namespace' argument
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	const currentYear = new Date().getFullYear();

	let footerVisible = false;
</script>

<footer
	class="bg-gray-800 p-8 text-white dark:bg-gray-900"
	use:inView={{ threshold: 0.1 }}
	on:inview={() => (footerVisible = true)}
>
	{#if footerVisible}
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between text-center md:flex-row md:text-left"
			in:fly={{ y: 20, duration: 500, easing: quintOut }}
		>
			<div class="mb-4 md:mb-0">
				<p class="text-sm">{t('common', 'copyright', { year: currentYear })}</p>
				<p class="text-xs text-gray-400">{t('common', 'made_with_love', {})}</p>
			</div>

			<nav class="flex flex-wrap justify-center space-x-4">
				<a
					href="/terms"
					class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
					>{t('common', 'terms_conditions')}</a
				>
				<a
					href="/privacy"
					class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
					>{t('common', 'privacy_policy')}</a
				>
				<a
					href="/shipping"
					class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
					>{t('common', 'shipping_policy')}</a
				>
				<a
					href="/contact"
					class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
					>{t('common', 'contact_us')}</a
				>
				<a
					href="/cancellation"
					class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
					>{t('common', 'cancellation_refunds')}</a
				>
			</nav>
		</div>
	{/if}
</footer>
