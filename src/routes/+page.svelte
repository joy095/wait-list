<script>
	import { browser } from '$app/environment';
	import HomePage from '$lib/HomePage.svelte';

	// --- SEO & Sharing Metadata ---
	const pageTitle = 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists';
	const pageDescription =
		'Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele.';
	const pageImage = 'https://wait-list-gamma.vercel.app/wait-list.png'; // Optimal for social sharing

	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://wait-list-gamma.vercel.app'; // Fallback for SSR
</script>

<svelte:head>
	<title>Bookings | Premium Waitlist for Top Barbers & Makeup Artists</title>
	<meta
		name="description"
		content="Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele."
	/>

	<!-- Open Graph Meta Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://wait-list-gamma.vercel.app" />
	<meta
		property="og:title"
		content="Bookings | Premium Waitlist for Top Barbers & Makeup Artists"
	/>
	<meta
		property="og:description"
		content="Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele."
	/>
	<meta property="og:image" content="https://wait-list-gamma.vercel.app/wait-list.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Bookings Waitlist Preview" />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://wait-list-gamma.vercel.app" />
	<meta
		name="twitter:title"
		content="Bookings | Premium Waitlist for Top Barbers & Makeup Artists"
	/>
	<meta
		name="twitter:description"
		content="Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele."
	/>
	<meta name="twitter:image" content="https://wait-list-gamma.vercel.app/wait-list.png" />
</svelte:head>

<HomePage />
