<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { gsap } from 'gsap';
	import { isFormOpen } from '$lib/store'; // Assuming this path is correct

	// Function to open the form by setting the store value to true
	function openSubscribeForm(): void {
		isFormOpen.set(true);
		// Optionally close the mobile menu when the form is opened
		if (mobileMenuOpen) {
			toggleMobileMenu();
		}
	}

	// Define a type for the i18n context
	interface I18nContext {
		t: (namespace: string, key: string) => string;
		changeLanguage: (lang: string) => Promise<void>;
		currentLanguage: {
			subscribe: (callback: (value: string) => void) => () => void;
			set: (value: string) => void;
			update: (updater: (value: string) => string) => void;
		};
		supportedLngs: string[];
	}

	// i18n context
	const { t, changeLanguage, currentLanguage, supportedLngs } = getContext<I18nContext>('i18n');

	let navbar: HTMLElement; // Explicitly type navbar as HTMLElement
	let lastScrollY = 0;
	let isVisible = true;
	let mobileMenuOpen = false;
	let hasScrolled = false;

	// Initialize selectedLanguage
	$: selectedLanguage = $currentLanguage || supportedLngs[0] || 'en';

	// Navigation items
	$: navItems = [
		{ label: t('common', 'home_nav_link') || 'Home', href: '/' },
		{ label: t('common', 'contact_nav_link') || 'Contact', href: '/contact' }
	];
	$: currentPath = $page.url.pathname;

	// Build URL with language param
	function buildUrl(path: string): string {
		const langParam = selectedLanguage || supportedLngs[0] || 'en';
		return `${path}?lang=${langParam}`;
	}

	// Language display mapping
	const languageDisplayMap: { [key: string]: string } = {
		en: 'English (EN)',
		hi: 'हिंदी (HI)',
		be: 'বাংলা (BE)'
	};

	// Removed the scrollToForm function as it's no longer needed

	// Handle scroll for hide/show navbar
	function handleScroll(): void {
		if (!browser || !navbar) return;
		const currentScrollY = window.scrollY;
		const scrollDifference = Math.abs(currentScrollY - lastScrollY);

		if (scrollDifference > 10) {
			hasScrolled = true;
			if (currentScrollY > lastScrollY && currentScrollY > 100 && hasScrolled) {
				if (isVisible) {
					gsap.to(navbar, { y: -navbar.offsetHeight, duration: 0.4, ease: 'power2.out' });
					isVisible = false;
				}
			} else if (currentScrollY < lastScrollY || currentScrollY < 100) {
				if (!isVisible) {
					gsap.to(navbar, { y: 0, duration: 0.4, ease: 'power2.out' });
					isVisible = true;
				}
			}
			lastScrollY = currentScrollY;
		}
	}

	// Handle language change
	async function handleLanguageChange(event: Event | string): Promise<void> {
		let lang: string;
		if (typeof event === 'string') {
			lang = event;
		} else {
			lang = (event.target as HTMLSelectElement).value;
		}

		if (!supportedLngs.includes(lang)) return;
		localStorage.setItem('preferredLanguage', lang);
		currentLanguage.set(lang);
		await changeLanguage(lang);
		mobileMenuOpen = false;
		await goto(`${$page.url.pathname}?lang=${lang}`);
		location.reload();
	}

	// Toggle mobile menu
	function toggleMobileMenu(): void {
		mobileMenuOpen = !mobileMenuOpen;
		if (mobileMenuOpen) {
			gsap.to('.mobile-menu', { x: 0, duration: 0.5, ease: 'power3.out' });
		} else {
			gsap.to('.mobile-menu', { x: '100%', duration: 0.5, ease: 'power3.in' });
		}
	}

	onMount(() => {
		if (browser) {
			// Ensure navbar is visible on load
			gsap.set(navbar, { y: 0 });
			// Subtle fade-in animation
			gsap.fromTo(navbar, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power3.out' });

			// Animate nav links on hover
			gsap.utils.toArray<HTMLElement>('.nav-link').forEach((link) => {
				link.addEventListener('mouseenter', () => {
					gsap.to(link, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
				});
				link.addEventListener('mouseleave', () => {
					gsap.to(link, { scale: 1, duration: 0.3, ease: 'power2.out' });
				});
			});

			// Initialize language
			currentLanguage.update((val) => {
				if (!val && supportedLngs.length > 0) {
					const stored = localStorage.getItem('preferredLanguage');
					const fallback = stored && supportedLngs.includes(stored) ? stored : supportedLngs[0];
					changeLanguage(fallback);
					return fallback;
				}
				return val;
			});

			// Initialize scroll position
			lastScrollY = window.scrollY;

			// Scroll listener with delay
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
			setTimeout(() => {
				window.addEventListener('scroll', scrollListener, { passive: true });
			}, 100);
			return () => window.removeEventListener('scroll', scrollListener);
		}
	});
</script>

<nav
	bind:this={navbar}
	class="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-lg transition-all duration-300"
	aria-label="Main navigation"
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex-shrink-0">
			<a
				href={buildUrl('/')}
				class="flex items-center text-2xl font-bold text-gray-800 transition-all duration-300 hover:text-purple-600"
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
					class="mr-2 inline-block text-purple-600 transition-transform duration-300 hover:scale-110"
				>
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
				</svg>
				<!-- <span>YourBrand</span> -->
			</a>
		</div>

		<div class="hidden flex-1 justify-center space-x-8 md:flex">
			{#each navItems as item}
				<a
					href={buildUrl(item.href)}
					class="nav-link group relative px-4 py-2 text-base font-medium text-gray-600 transition-all duration-300 hover:text-purple-600"
					class:active={currentPath === item.href}
					aria-current={currentPath === item.href ? 'page' : undefined}
				>
					{item.label}
					<span
						class="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"
						class:active={currentPath === item.href}
					></span>
				</a>
			{/each}
		</div>

		<div class="hidden items-center space-x-4 md:flex">
			<div class="group relative">
				<button
					class="flex cursor-pointer items-center space-x-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
					aria-haspopup="listbox"
					aria-expanded={mobileMenuOpen}
					on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
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
						class="text-gray-500"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="2" y1="12" x2="22" y2="12"></line>
						<path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						></path>
					</svg>
					<span>{selectedLanguage.toUpperCase()}</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-gray-500 transition-transform duration-200"
						class:rotate-180={mobileMenuOpen}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>
				{#if mobileMenuOpen}
					<ul
						class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none"
						role="listbox"
					>
						{#each supportedLngs as lang}
							<li>
								<button
									type="button"
									value={lang}
									class="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
									class:bg-purple-100={selectedLanguage === lang}
									class:text-purple-600={selectedLanguage === lang}
									role="option"
									aria-selected={selectedLanguage === lang}
									on:click={() => handleLanguageChange(lang)}
									on:keydown={(e) => e.key === 'Enter' && handleLanguageChange(lang)}
								>
									{languageDisplayMap[lang] ?? lang.toUpperCase()}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<button
				on:click={openSubscribeForm}
				class="cursor-pointer rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
			>
				{t('common', 'get_notified_btn') || 'Get Notified'}
			</button>
		</div>

		<div class="md:hidden">
			<button
				on:click={toggleMobileMenu}
				class="p-2 text-gray-600 hover:text-purple-600 focus:ring-2 focus:ring-purple-600 focus:outline-none"
				aria-label="Toggle mobile menu"
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<div
		class="mobile-menu fixed inset-0 z-40 transform bg-white/95 backdrop-blur-lg transition-transform duration-500 md:hidden"
		class:translate-x-full={!mobileMenuOpen}
		aria-hidden={!mobileMenuOpen}
	>
		<div class="bg-white/95 px-4 py-6 sm:px-6">
			<div class="flex justify-end">
				<button
					on:click={toggleMobileMenu}
					class="p-2 text-gray-600 hover:text-purple-600 focus:ring-2 focus:ring-purple-600 focus:outline-none"
					aria-label="Close mobile menu"
				>
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="mt-6 space-y-4">
				{#each navItems as item}
					<a
						href={buildUrl(item.href)}
						on:click={toggleMobileMenu}
						class="block rounded-lg px-4 py-2 text-base font-semibold text-gray-800 hover:bg-gray-100 hover:text-purple-600"
						class:bg-purple-100={currentPath === item.href}
						class:text-purple-600={currentPath === item.href}
						aria-current={currentPath === item.href ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
				<div>
					<label for="mobile-language-select" class="block text-sm font-medium text-gray-700">
						{t('common', 'change_language') || 'Change Language'}
					</label>
					<select
						id="mobile-language-select"
						on:change={handleLanguageChange}
						bind:value={selectedLanguage}
						class="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
					>
						{#each supportedLngs as lang}
							<option value={lang}>{languageDisplayMap[lang] ?? lang.toUpperCase()}</option>
						{/each}
					</select>
				</div>
				<button
					on:click={openSubscribeForm}
					class="w-full cursor-pointer rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
				>
					{t('common', 'get_notified_btn') || 'Get Notified'}
				</button>
			</div>
		</div>
	</div>
</nav>

<style>
	.active .absolute {
		width: 100%;
	}
</style>
