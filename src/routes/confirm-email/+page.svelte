<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { gsap } from 'gsap';

	$: status = $page.url.searchParams.get('status');
	$: message = $page.data?.message;

	// Base URL (e.g., http://localhost:5173)
	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://yourdomain.com'; // Fallback for SSR

	// SEO and sharing metadata
	const pageTitle = 'Email Confirmation - Wait list Signup';
	const pageDescription = 'Confirm your email and share this page with your network!';
	const pageImage = '/wait-list.webp';

	// Copy base URL to clipboard
	function copyToClipboard() {
		if (browser) {
			navigator.clipboard.writeText(baseUrl);
			// Replace with toast notification (placeholder)
			// toast.success('Base URL copied to clipboard!');
			alert('Base URL copied to clipboard!'); // Temporary fallback
		}
	}

	// Social sharing configuration
	$: shareUrl = encodeURIComponent(baseUrl);
	$: shareText = encodeURIComponent(`${pageTitle} - ${pageDescription}`);
	$: socialLinks = {
		whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		instagram: `https://www.instagram.com/`, // Redirects to app
		x: `https://x.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
	};

	// GSAP animations
	onMount(() => {
		gsap.fromTo(
			'.card',
			{ opacity: 0, y: 50 },
			{ opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
		);
		gsap.fromTo(
			'.heading',
			{ opacity: 0, scale: 0.9 },
			{ opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
		);
		gsap.fromTo(
			'.content',
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4 }
		);
		gsap.fromTo(
			'.main-button',
			{ opacity: 0, scale: 0.8 },
			{ opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.6 }
		);
		gsap.fromTo(
			'.social-button',
			{ opacity: 0, scale: 0.5, rotate: -10 },
			{
				opacity: 1,
				scale: 1,
				rotate: 0,
				duration: 0.5,
				ease: 'back.out(1.7)',
				stagger: 0.1,
				delay: 0.8
			}
		);
	});
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={baseUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={pageImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={baseUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={pageImage} />

	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4"
>
	<div
		class="card hover:shadow-3xl w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl transition-all duration-300"
	>
		{#if status === 'success'}
			<h2 class="heading mb-4 text-3xl font-extrabold text-emerald-600">Email Confirmed! 🎉</h2>
			<p class="content mb-6 text-lg text-gray-600">
				Thank you for confirming your email. Your subscription is now active.
			</p>
			<a
				href="/"
				class="main-button focus:ring-opacity-50 inline-block rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
				aria-label="Go to homepage"
			>
				Go to Homepage
			</a>
		{:else if status === 'already_subscribed'}
			<h2 class="heading mb-4 text-3xl font-extrabold text-blue-600">Already Subscribed!</h2>
			<p class="content mb-6 text-lg text-gray-600">
				Your email address has already been confirmed and you're subscribed. Welcome back!
			</p>
			<a
				href="/"
				class="main-button focus:ring-opacity-50 inline-block rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
				aria-label="Go to homepage"
			>
				Go to Homepage
			</a>
		{:else}
			<h2 class="heading mb-4 text-3xl font-extrabold text-rose-600">Verification Failed 😔</h2>
			<p class="content mb-6 text-lg text-gray-600">
				{#if message}
					{message}
				{:else}
					We couldn't verify your email. The link might be invalid, expired, or something else went
					wrong.
				{/if}
			</p>
			<a
				href="/multi-step-form"
				class="main-button focus:ring-opacity-50 inline-block rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
				aria-label="Try signing up again"
			>
				Try Signing Up Again
			</a>
		{/if}

		{#if message}
			<p class="error-message mt-4">
				{message}
			</p>
		{/if}

		<!-- Share Buttons -->
		<div class="mt-8 flex justify-center space-x-4">
			<a
				href={socialLinks.whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-all duration-200 hover:scale-110 hover:bg-green-600"
				title="Share on WhatsApp"
				aria-label="Share on WhatsApp"
			>
				<Icon icon="ic:baseline-whatsapp" width="24" />
			</a>
			<a
				href={socialLinks.facebook}
				target="_blank"
				rel="noopener noreferrer"
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all duration-200 hover:scale-110 hover:bg-blue-700"
				title="Share on Facebook"
				aria-label="Share on Facebook"
			>
				<Icon icon="mdi:facebook" width="24" />
			</a>
			<a
				href={socialLinks.instagram}
				target="_blank"
				rel="noopener noreferrer"
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white transition-all duration-200 hover:scale-110 hover:bg-pink-600"
				title="Open Instagram to share manually"
				aria-label="Open Instagram to share manually"
			>
				<Icon icon="mdi:instagram" width="24" />
			</a>
			<a
				href={socialLinks.x}
				target="_blank"
				rel="noopener noreferrer"
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:scale-110 hover:bg-gray-800"
				title="Share on X"
				aria-label="Share on X"
			>
				<Icon icon="simple-icons:x" width="24" />
			</a>
			<a
				href={socialLinks.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition-all duration-200 hover:scale-110 hover:bg-blue-800"
				title="Share on LinkedIn"
				aria-label="Share on LinkedIn"
			>
				<Icon icon="mdi:linkedin" width="24" />
			</a>
			<button
				on:click={copyToClipboard}
				class="social-button flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white transition-all duration-200 hover:scale-110 hover:bg-gray-600"
				title="Copy Base URL"
				aria-label="Copy base URL to clipboard"
			>
				<Icon icon="mdi:content-copy" width="24" />
			</button>
		</div>
	</div>
</div>

<style>
	/* Custom shadow for premium look */
	.shadow-3xl {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	/* Subtle background gradient animation */
	@keyframes gradientShift {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	.min-h-screen {
		background: linear-gradient(135deg, #f9fafb, #e5e7eb);
		background-size: 200% 200%;
		animation: gradientShift 15s ease infinite;
	}

	.card {
		max-width: 28rem; /* Matches max-w-md */
		border: 1px solid rgba(0, 0, 0, 0.05); /* Subtle border for premium feel */
	}

	.heading {
		line-height: 1.2;
	}

	.content {
		line-height: 1.5;
	}

	.main-button {
		text-decoration: none;
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem;
		border-radius: 6px;
		background-color: #fef1f2;
		color: #9f1239;
		border: 1px solid #fecdd3;
		font-size: 0.9rem;
	}
</style>
