<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { inView } from '$lib/actions/inView';
	import Icon from '@iconify/svelte';
	import { getContext } from 'svelte';
	// Removed supportedLngs import as it's not directly used here anymore

	// Get the i18n context
	interface I18nContext {
		t: (key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => void;
		currentLanguage: any; // Still needed if you use currentLanguage for other purposes on the page
	}
	const { t, changeLanguage, currentLanguage } = getContext<I18nContext>('i18n');

	// Removed selectedLanguage binding as the select is no longer here
	// let selectedLanguage = $currentLanguage;

	const currentYear = new Date().getFullYear();

	let heroVisible = false;
	let featuresVisible = false;
	let ctaVisible = false;
	let demoContentVisible: boolean[] = Array(5).fill(false);
	let footerVisible = false;

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

	// Removed handleLanguageChange function as the select is no longer here
	// function handleLanguageChange(event: Event) {
	//     const selectElement = event.target as HTMLSelectElement;
	//     changeLanguage(selectElement.value);
	// }
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
					{t('home_page_title')}
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
					{t('welcome')} Your one-stop destination for everything you need to know and more.
				</p>
				<a
					href="/services"
					class="inline-block transform rounded-full bg-white px-8 py-3 font-bold text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
				>
					{t('explore_services')}
				</a>
			</div>
		{/if}
		<div class="absolute inset-0 z-0 opacity-10">
			<svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<circle cx="10" cy="90" r="15" fill="currentColor" class="text-blue-500"></circle>
				<circle cx="90" cy="10" r="10" fill="currentColor" class="text-purple-500"></circle>
				<rect
					x="30"
					y="70"
					width="25"
					height="25"
					fill="currentColor"
					class="rotate-45 text-blue-400"
				></rect>
				<polygon points="70,30 80,40 60,40" fill="currentColor" class="text-purple-400"></polygon>
			</svg>
		</div>
	</section>

	<section
		class="bg-white px-4 py-20 md:px-8 lg:px-16 dark:bg-gray-800"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (featuresVisible = true)}
	>
		<div class="container mx-auto text-center">
			<h2 class="mb-4 text-4xl font-bold text-gray-800 dark:text-white">{t('why_choose_us')}</h2>
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
								{t(feature.titleKey)}
							</h3>
							<p class="text-gray-600 dark:text-gray-300">{t(feature.descriptionKey)}</p>
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
					{t('ready_to_build')}
				</h2>
				<p class="mx-auto mb-10 max-w-3xl text-lg opacity-90 md:text-xl">
					Whether you have a clear vision or just an idea, we're here to help bring it to life.
				</p>
				<a
					href="/contact"
					class="inline-block transform rounded-full bg-white px-10 py-4 font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-100"
				>
					{t('get_free_quote')}
				</a>
			</div>
		{/if}
	</section>

	<section class="bg-gray-50 px-4 py-20 md:px-8 lg:px-16 dark:bg-gray-900">
		<div class="container mx-auto text-center">
			<h2 class="mb-8 text-4xl font-bold text-gray-800 dark:text-white">
				Scroll Down to See More!
			</h2>
			<p class="mx-auto mb-12 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
				This content is here to demonstrate scroll behavior and animations.
			</p>

			{#each Array(5) as _, i}
				<div
					class="mb-8 rounded-xl bg-white p-8 text-left shadow-md dark:bg-gray-700"
					use:inView={{ threshold: 0.3 }}
					on:inview={() => (demoContentVisible[i] = true)}
				>
					{#if demoContentVisible[i]}
						<div in:fly={{ y: 30, duration: 600, delay: 50, easing: quintOut }}>
							<h3 class="mb-4 text-2xl font-semibold text-blue-600 dark:text-blue-400">
								Demo Section {i + 1}
							</h3>
							<p class="text-gray-700 dark:text-gray-300">
								This is demo content to create scrollable height. Lorem ipsum dolor sit amet,
								consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
								magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
								voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
								cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
								laborum.
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

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
					<p class="text-sm">{t('copyright', { year: currentYear })}</p>
					<p class="text-xs text-gray-400">{t('made_with_love')}</p>
				</div>

				<nav class="flex flex-wrap justify-center space-x-4">
					<a
						href="/terms"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>{t('terms_conditions')}</a
					>
					<a
						href="/privacy"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>{t('privacy_policy')}</a
					>
					<a
						href="/shipping"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>{t('shipping_policy')}</a
					>
					<a
						href="/contact"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>{t('contact_us')}</a
					>
					<a
						href="/cancellation"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>{t('cancellation_refunds')}</a
					>
				</nav>
			</div>
		{/if}
	</footer>
</div>
