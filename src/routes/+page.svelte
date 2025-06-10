<script>
	import { browser } from '$app/environment';
	import HomePage from '$lib/HomePage.svelte';

	// --- SEO & Sharing Metadata ---
	const pageTitle = 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists';
	const pageDescription =
		'Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele.';
	const pageImage = 'https://placehold.co/1200x630/1a1a1a/ffd700?text=Bookings'; // Optimal for social sharing

	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://yourdomain.com'; // Fallback for SSR
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content="premium booking, elite barbers, makeup artists, scheduling software, luxury salon, waitlist"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={baseUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={pageImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={baseUrl} />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={pageDescription} />
	<meta property="twitter:image" content={pageImage} />
</svelte:head>

<HomePage />
