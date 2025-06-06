<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import type { Writable } from 'svelte/store';

	// Define the interface for the i18n context that you're providing
	interface I18nContext {
		// `t` function now explicitly takes `namespace` as the first argument
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		// `changeLanguage` is an async function, so type it as returning a Promise<void>
		changeLanguage: (lang: string) => Promise<void>;
		currentLanguage: Writable<string>;
		supportedLngs: string[];
	}

	// Get the i18n context from the layout
	const { t, changeLanguage, currentLanguage, supportedLngs } = getContext<I18nContext>('i18n');

	// Svelte reactive declaration to keep selectedLanguage in sync with the store
	let selectedLanguage = $currentLanguage;
	$: selectedLanguage = $currentLanguage;

	// Optional: Log language changes for debugging
	// $: console.log('Navbar: selectedLanguage updated to:', selectedLanguage);

	let navbar: HTMLElement;
	let lastScrollY = 0;
	let isVisible = true;

	// Use the 'common' namespace for global navigation items
	$: navItems = [
		{ label: t('common', 'home_nav_link'), href: `/?lang=${selectedLanguage}` },
		{ label: t('common', 'about_nav_link'), href: `/about?lang=${selectedLanguage}` },
		{ label: t('common', 'services_nav_link'), href: `/services?lang=${selectedLanguage}` },
		{ label: t('common', 'contact_nav_link'), href: `/contact?lang=${selectedLanguage}` }
	];

	function handleScroll() {
		if (!browser || !navbar) return; // Only run in the browser and if navbar element exists
		const currentScrollY = window.scrollY;
		const scrollDifference = Math.abs(currentScrollY - lastScrollY);

		if (scrollDifference > 10) {
			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				// Scrolling down past 100px, hide navbar
				if (isVisible) {
					gsap.to(navbar, { y: -100, duration: 0.3, ease: 'power2.out' });
					isVisible = false;
				}
			} else {
				// Scrolling up or near top, show navbar
				if (!isVisible) {
					gsap.to(navbar, { y: 0, duration: 0.3, ease: 'power2.out' });
					isVisible = true;
				}
			}
			lastScrollY = currentScrollY; // Update last scroll position
		}
	}

	async function handleLanguageChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement;
		const newLang = selectElement.value;
		// console.log('Navbar: handleLanguageChange called, new language:', newLang);

		// Call the changeLanguage function from the i18n context
		await changeLanguage(newLang);
		// console.log('Navbar: Language changed via context.');

		// Option 1: Full reload of the current page
		location.reload();

		// Option 2: If your i18n system supports URL updates like ?lang=xx, you could also use goto()
		// import { goto } from '$app/navigation';
		// await goto(`${window.location.pathname}?lang=${newLang}`);

		// invalidateAll() is handled within the changeLanguage function in +layout.svelte,
		// so calling it here again is redundant and can be removed.
		// If changeLanguage in +layout.svelte does NOT call invalidateAll(), then keep this line.
		// await invalidateAll(); // Consider if this is truly needed here or if `changeLanguage` already triggers it
		// console.log('Navbar: Language change process initiated.');
	}

	onMount(() => {
		if (browser) {
			gsap.set(navbar, { y: 0 }); // Ensure navbar is visible on initial load
			let ticking = false; // Flag to throttle scroll events
			const scrollListener = () => {
				if (!ticking) {
					requestAnimationFrame(() => {
						handleScroll();
						ticking = false;
					});
					ticking = true;
				}
			};
			window.addEventListener('scroll', scrollListener, { passive: true }); // Use passive for performance
			// Cleanup function for onDestroy
			return () => {
				window.removeEventListener('scroll', scrollListener);
			};
		}
	});

	const languageDisplayMap: Record<string, string> = {
		en: 'English (EN)',
		hi: 'हिंदी (HI)',
		be: 'বাংলা (BE)'
	};
</script>

<nav
	bind:this={navbar}
	class="fixed top-0 right-0 left-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm transition-all duration-300
    dark:border-white/10 dark:bg-gray-900/95"
	aria-label="Main navigation"
>
	<div class="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 md:px-8">
		<div class="flex-shrink-0">
			<a
				href={`/?lang=${selectedLanguage}`}
				class="text-2xl font-bold text-gray-900 no-underline transition-colors duration-300 hover:text-blue-500
                dark:text-gray-50 dark:hover:text-blue-400"
			>
				<span class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
					>Brand</span
				>
			</a>
		</div>

		<div class="hidden flex-1 justify-center md:flex">
			<ul class="m-0 flex list-none gap-8 p-0">
				{#each navItems as item}
					<li class="group relative">
						<a
							href={item.href}
							class="relative max-w-fit rounded-md px-4 py-2 text-base font-medium text-gray-600 no-underline transition-all
                            duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-0.5
                            after:w-0 after:-translate-x-1/2 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:transition-all after:duration-300 group-hover:after:w-full hover:bg-blue-50 hover:text-blue-500
                            dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="flex items-center space-x-4">
			<div class="language-switcher">
				<label for="language-select" class="sr-only">{t('common', 'change_language')}</label>
				<select
					id="language-select"
					on:change={handleLanguageChange}
					bind:value={selectedLanguage}
					class="rounded-md border border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
				>
					{#each supportedLngs as lang}
						<option value={lang}>
							{languageDisplayMap[lang] ?? lang.toUpperCase()}
						</option>
					{/each}
				</select>
			</div>

			<a
				href={`/mailing-list?lang=${selectedLanguage}`}
				class="flex-shrink-0 transition-all duration-300 hover:-translate-y-0.5"
			>
				<span
					class="cursor-pointer rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
				>
					{t('common', 'get_notified_btn')}
				</span>
			</a>
		</div>
	</div>
</nav>
