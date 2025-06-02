<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';

	let navbar: HTMLElement;
	let lastScrollY = 0;
	let isVisible = true;

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Services', href: '/services' },
		{ label: 'Contact', href: '/contact' }
	];

	function handleScroll() {
		if (!browser || !navbar) return;

		const currentScrollY = window.scrollY;
		const scrollDifference = Math.abs(currentScrollY - lastScrollY);

		// Only trigger animation if scroll difference is significant (prevents jittery behavior)
		if (scrollDifference > 10) {
			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				// Scrolling down - hide navbar
				if (isVisible) {
					gsap.to(navbar, {
						y: -100,
						duration: 0.3,
						ease: 'power2.out'
					});
					isVisible = false;
				}
			} else {
				// Scrolling up - show navbar
				if (!isVisible) {
					gsap.to(navbar, {
						y: 0,
						duration: 0.3,
						ease: 'power2.out'
					});
					isVisible = true;
				}
			}
			lastScrollY = currentScrollY;
		}
	}

	function handleGetStarted() {
		// Add your button action here
		console.log('Get Started clicked!');
		// Example: navigate to mailing list
		window.location.href = '/mailing-list';
	}

	onMount(() => {
		if (browser) {
			// Set initial position
			gsap.set(navbar, { y: 0 });

			// Add scroll listener with throttling
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

			// Cleanup
			return () => {
				window.removeEventListener('scroll', scrollListener);
			};
		}
	});
</script>

<nav bind:this={navbar} class="navbar" role="navigation" aria-label="Main navigation">
	<div class="navbar-container">
		<!-- Logo Section -->
		<div class="navbar-brand">
			<a href="/" class="brand-link">
				<span class="brand-text">YourBrand</span>
			</a>
		</div>

		<!-- Navigation Links -->
		<div class="navbar-nav">
			<ul class="nav-list">
				{#each navItems as item}
					<li class="nav-item">
						<a href={item.href} class="nav-link">
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- CTA Button -->
		<div class="navbar-actions">
			<button class="cta-button" on:click={handleGetStarted}> Get Started </button>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.navbar-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
	}

	/* Brand/Logo */
	.navbar-brand {
		flex-shrink: 0;
	}

	.brand-link {
		text-decoration: none;
		color: #1a1a1a;
		font-weight: 700;
		font-size: 1.5rem;
		transition: color 0.3s ease;
	}

	.brand-link:hover {
		color: #3b82f6;
	}

	.brand-text {
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Navigation */
	.navbar-nav {
		display: none;
		flex: 1;
		justify-content: center;
	}

	.nav-list {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 2rem;
	}

	.nav-item {
		position: relative;
	}

	.nav-link {
		text-decoration: none;
		color: #4b5563;
		font-weight: 500;
		font-size: 0.95rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		transition: all 0.3s ease;
		position: relative;
	}

	.nav-link:hover {
		color: #3b82f6;
		background-color: rgba(59, 130, 246, 0.1);
	}

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		width: 0;
		height: 2px;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		transition: all 0.3s ease;
		transform: translateX(-50%);
	}

	.nav-link:hover::after {
		width: 80%;
	}

	/* CTA Button */
	.navbar-actions {
		flex-shrink: 0;
	}

	.cta-button {
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
	}

	.cta-button:active {
		transform: translateY(0);
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.navbar-nav {
			display: flex;
		}

		.navbar-container {
			padding: 0 2rem;
		}
	}

	@media (min-width: 1024px) {
		.nav-list {
			gap: 2.5rem;
		}

		.cta-button {
			padding: 0.875rem 2rem;
		}
	}

	/* Focus states for accessibility */
	.brand-link:focus,
	.nav-link:focus,
	.cta-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.navbar,
		.nav-link,
		.cta-button,
		.brand-link {
			transition: none;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.navbar {
			background: rgba(17, 24, 39, 0.95);
			border-bottom-color: rgba(255, 255, 255, 0.1);
		}

		.brand-link {
			color: #f9fafb;
		}

		.nav-link {
			color: #d1d5db;
		}

		.nav-link:hover {
			color: #60a5fa;
			background-color: rgba(96, 165, 250, 0.1);
		}
	}
</style>
