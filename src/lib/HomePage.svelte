<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { inView } from '$lib/actions/inView';
	import Icon from '@iconify/svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string; // Note the added 'namespace' argument
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	let heroVisible = false;
	let featuresVisible = false;
	let ctaVisible = false;

	const features = [
		{
			icon: 'ph:rocket-launch-duotone',
			titleKey: 'blazing_fast_title',
			descriptionKey: 'blazing_fast_desc'
		},
		{
			icon: 'ph:paint-brush-broad-duotone',
			titleKey: 'stunning_design_title',
			descriptionKey: 'stunning_design_desc'
		},
		{
			icon: 'ph:shield-check-duotone',
			titleKey: 'secure_reliable_title',
			descriptionKey: 'secure_reliable_desc'
		},
		{
			icon: 'ph:headset-duotone',
			titleKey: 'dedicated_support_title',
			descriptionKey: 'dedicated_support_desc'
		}
	];
</script>

<div class="font-inter min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
	<section
		class="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-4 text-white"
		use:inView={{ threshold: 0.1 }}
		on:inview={() => (heroVisible = true)}
	>
		{#if heroVisible}
			<div class="z-10 text-center" in:fly={{ y: 50, duration: 1000, easing: quintOut }}>
				<h1 class="mb-4 text-5xl leading-tight font-extrabold drop-shadow-lg md:text-7xl">
					{t('home', 'home_page_title')}
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
					{t('home', 'welcome')} Your one-stop destination for everything you need to know and more.
				</p>
				<a
					href="/services"
					class="inline-block transform rounded-full bg-white px-8 py-3 font-bold text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
				>
					{t('home', 'explore_services')}
				</a>
			</div>
		{/if}
	</section>

	<section
		class="bg-white px-4 py-20 md:px-8 lg:px-16 dark:bg-gray-800"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (featuresVisible = true)}
	>
		<div class="container mx-auto text-center">
			<h2 class="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
				{t('home', 'why_choose_us')}
			</h2>
			<p class="mx-auto mb-12 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
				We combine creativity with technical expertise to deliver solutions that truly stand out.
			</p>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				{#each features as feature, i}
					{#if featuresVisible}
						<div
							class="flex transform cursor-pointer flex-col items-center rounded-xl bg-gray-100 p-6 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-700"
							in:fly={{ y: 50, duration: 700, delay: i * 100, easing: quintOut }}
						>
							<div class="mb-4 text-5xl text-blue-600 dark:text-blue-400">
								<Icon icon={feature.icon} width="50" height="50" />
							</div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
								{t('home', feature.titleKey)}
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								{t('home', feature.descriptionKey)}
							</p>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>

	<section
		class="bg-purple-600 py-20 text-center text-white"
		use:inView={{ threshold: 0.3 }}
		on:inview={() => (ctaVisible = true)}
	>
		{#if ctaVisible}
			<div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, easing: quintOut }}>
				<h2 class="mb-6 text-4xl font-bold drop-shadow-md md:text-5xl">
					{t('home', 'ready_to_build')}
				</h2>
				<p class="mx-auto mb-10 max-w-3xl text-lg opacity-90 md:text-xl">
					Whether you have a clear vision or just an idea, we're here to help bring it to life.
				</p>
				<a
					href="/contact"
					class="inline-block transform rounded-full bg-white px-10 py-4 font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-100"
				>
					{t('home', 'get_free_quote')}
				</a>
			</div>
		{/if}
	</section>
</div>
