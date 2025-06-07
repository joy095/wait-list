<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Writable } from 'svelte/store';
	import { isFormOpen } from '$lib/store';

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => Promise<void>;
		currentLanguage: Writable<string>;
		supportedLngs: string[];
	}

	const { t, changeLanguage, currentLanguage, supportedLngs } = getContext<I18nContext>('i18n');

	let navbar: HTMLElement;
	let lastScrollY = 0;
	let isVisible = true;
	let mobileMenuOpen = false;

	// Initialize selectedLanguage
	// Use $currentLanguage for reactivity, falling back to supportedLngs[0] or 'en'
	$: selectedLanguage = $currentLanguage || supportedLngs[0] || 'en';

	$: navItems = [
		{ label: t('common', 'home_nav_link') || 'Home', href: `/` },
		{ label: t('common', 'contact_nav_link') || 'Contact', href: `/contact` }
	];
	$: currentPath = $page.url.pathname;

	function buildUrl(path: string): string {
		// Ensure that selectedLanguage is always valid
		const langParam = selectedLanguage || supportedLngs[0] || 'en';
		return `${path}?lang=${langParam}`;
	}

	const languageDisplayMap: Record<string, string> = {
		en: 'English (EN)',
		hi: 'हिंदी (HI)',
		be: 'বাংলা (BE)'
	};

	function handleScroll() {
		if (!browser || !navbar) return;

		const currentScrollY = window.scrollY;
		const scrollDifference = Math.abs(currentScrollY - lastScrollY);

		if (scrollDifference > 10) {
			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				if (isVisible) {
					gsap.to(navbar, { y: -navbar.offsetHeight, duration: 0.3, ease: 'power2.out' });
					isVisible = false;
				}
			} else {
				if (!isVisible) {
					gsap.to(navbar, { y: 0, duration: 0.3, ease: 'power2.out' });
					isVisible = true;
				}
			}
			lastScrollY = currentScrollY;
		}
	}

	async function handleLanguageChange(event: Event | string) {
		let lang = typeof event === 'string' ? event : (event.target as HTMLSelectElement).value;
		console.log('handleLanguageChange called with:', lang); // Debugging
		if (!supportedLngs.includes(lang)) {
			console.warn('Selected language not supported:', lang); // Debugging
			return;
		}
		localStorage.setItem('preferredLanguage', lang);
		console.log('localStorage updated:', lang); // Debugging
		currentLanguage.set(lang);
		console.log('currentLanguage store updated:', $currentLanguage); // Debugging

		await changeLanguage(lang); // This is the function from the context
		console.log('changeLanguage from context called.'); // Debugging

		// Close mobile menu after selection
		mobileMenuOpen = false;

		// Navigate to update URL. This will cause a page reload if necessary
		// In a real SvelteKit app, this is crucial for SSR and data loading.
		await goto(`${$page.url.pathname}?lang=${lang}`);
		console.log('Navigated to:', `${$page.url.pathname}?lang=${lang}`); // Debugging
		// console.log('Navbar: Language changed via context.');

		// Option 1: Full reload of the current page
		location.reload();
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function openSubscribeForm() {
		isFormOpen.set(true);
	}

	onMount(() => {
		if (browser) {
			gsap.set(navbar, { y: 0 }); // Ensure navbar is visible initially

			// Initialize currentLanguage if it's not set from URL params in +layout.svelte
			// This part is mainly for scenarios where no lang param or localStorage exists.
			currentLanguage.update((val) => {
				if (!val && supportedLngs.length > 0) {
					const stored = localStorage.getItem('preferredLanguage');
					const fallback = stored && supportedLngs.includes(stored) ? stored : supportedLngs[0];
					changeLanguage(fallback); // Call changeLanguage to ensure internal state is consistent
					return fallback;
				}
				return val;
			});

			let ticking = false;
			const scrollListener = () => {
				if (!ticking) {
					requestAnimationFrame(() => {
						handleScroll();
						ticking = false;
					});
					ticking = true;
				}
			};

			window.addEventListener('scroll', scrollListener, { passive: true });
			return () => {
				window.removeEventListener('scroll', scrollListener);
			};
		}
	});

	// Reactive statement to log when selectedLanguage changes (for debugging)
	$: console.log('selectedLanguage (reactive):', selectedLanguage);
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
				href={buildUrl('/')}
				class="flex items-center text-2xl font-bold text-gray-900 no-underline transition-colors duration-300 hover:text-blue-500
                dark:text-gray-50 dark:hover:text-blue-400"
				aria-label="Homepage"
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="inline-block align-middle text-blue-500 dark:text-blue-400"
				>
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
				</svg>
				<span class="ml-2">YourBrand</span>
			</a>
		</div>

		<div class="hidden flex-1 justify-center md:flex">
			<ul class="m-0 flex list-none gap-8 p-0">
				{#each navItems as item}
					<li class="group relative">
						<a
							href={buildUrl(item.href)}
							class="relative max-w-fit rounded-md px-4 py-2 text-base font-medium no-underline transition-all
                            duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-0.5
                            after:w-0 after:-translate-x-1/2 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:transition-all after:duration-300 group-hover:after:w-full
                            {currentPath === item.href
								? 'font-semibold text-blue-600 after:w-full dark:text-blue-300'
								: 'text-gray-600 hover:bg-blue-50 hover:text-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400'}"
							aria-current={currentPath === item.href ? 'page' : undefined}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="hidden items-center space-x-4 md:flex">
			<div class="group relative">
				<button
					class="flex items-center space-x-2 rounded-md border border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
					aria-haspopup="listbox"
					aria-expanded={mobileMenuOpen ? 'true' : 'false'}
					on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
					id="language-select-button"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-gray-500 dark:text-gray-400"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="2" y1="12" x2="22" y2="12"></line>
						<path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						></path>
					</svg>
					<span>{selectedLanguage?.toUpperCase() || 'EN'}</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="transform text-gray-500 transition-transform duration-200 dark:text-gray-400"
						class:rotate-180={mobileMenuOpen}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>
				{#if mobileMenuOpen}
					<ul
						class="ring-opacity-5 absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800"
						role="listbox"
						aria-labelledby="language-select-button"
					>
						{#each supportedLngs as lang}
							<li>
								<button
									type="button"
									value={lang}
									class="relative w-full cursor-pointer py-2 pr-9 pl-3 text-left text-gray-900 select-none dark:text-gray-100
                                    {selectedLanguage === lang
										? 'bg-blue-100 text-blue-900 dark:bg-blue-700 dark:text-blue-100'
										: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
									role="option"
									aria-selected={selectedLanguage === lang ? 'true' : 'false'}
									on:click={() => handleLanguageChange(lang)}
									on:keydown={(e) => e.key === 'Enter' && handleLanguageChange(lang)}
								>
									<span class="block truncate">
										{languageDisplayMap[lang] ?? lang.toUpperCase()}
									</span>
									{#if selectedLanguage === lang}
										<span
											class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-300"
										>
											<svg
												class="h-5 w-5"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
										</span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<a
				on:click={openSubscribeForm}
				class="flex-shrink-0 transition-all duration-300 hover:-translate-y-0.5"
			>
				<span
					class="cursor-pointer rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
				>
					{t('common', 'get_notified_btn') || 'Get Notified'}
				</span>
			</a>
		</div>

		<div class="flex items-center md:hidden">
			<button
				on:click={toggleMobileMenu}
				class="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:ring-inset dark:text-gray-300"
				aria-label="Open main menu"
				aria-expanded={mobileMenuOpen ? 'true' : 'false'}
			>
				{#if mobileMenuOpen}
					<svg
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<div
		class="fixed inset-0 z-40 transform bg-white/95 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden dark:bg-gray-900/95"
		class:translate-x-full={!mobileMenuOpen}
		class:translate-x-0={mobileMenuOpen}
		aria-hidden={!mobileMenuOpen}
	>
		<div class="px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex justify-end">
				<button
					on:click={toggleMobileMenu}
					class="rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:ring-inset dark:text-gray-300"
					aria-label="Close main menu"
				>
					<svg
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<div class="mt-6 flow-root">
				<div class="-my-6 divide-y divide-gray-500/10">
					<div class="space-y-2 py-6">
						{#each navItems as item}
							<a
								href={buildUrl(item.href)}
								on:click={toggleMobileMenu}
								class="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 font-semibold
                                {currentPath === item.href
									? 'bg-blue-50 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
									: 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800'}"
								aria-current={currentPath === item.href ? 'page' : undefined}
							>
								{item.label}
							</a>
						{/each}
					</div>
					<div class="py-6">
						<div class="mb-4">
							<label
								for="mobile-language-select"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('common', 'change_language') || 'Change Language'}
							</label>
							<div class="relative">
								<select
									id="mobile-language-select"
									on:change={handleLanguageChange}
									bind:value={selectedLanguage}
									class="block w-full appearance-none rounded-md border border-gray-300 bg-white p-3 pr-10 text-base focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
								>
									{#each supportedLngs as lang}
										<option value={lang}>
											{languageDisplayMap[lang] ?? lang.toUpperCase()}
										</option>
									{/each}
								</select>
								<div
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"
								>
									<svg
										class="h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</div>

						<a
							href={buildUrl('/contact')}
							on:click={toggleMobileMenu}
							class="block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 text-center font-semibold text-white shadow-lg transition-all duration-300
                            hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
						>
							{t('common', 'get_notified_btn') || 'Get Notified'}
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</nav>
