<script>
	import { browser } from '$app/environment';
	import HomePage from '$lib/HomePage.svelte';

	// --- SEO & Sharing Metadata ---
	const pageTitle = 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists';
	const pageDescription =
		'Join the exclusive waitlist for Bookings. The ultimate platform for barbers and makeup artists to elevate their brand, streamline scheduling, and attract high-value clientele.';
	const pageImage = '/wait-list.webp'; // Optimal for social sharing

	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://yourdomain.com'; // Fallback for SSR
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{pageTitle}</title>
	<meta name="title" content={pageTitle} />
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content="premium booking, elite barbers, makeup artists, scheduling software, luxury salon, waitlist"
	/>

	<!-- Open Graph / Facebook / LinkedIn -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://wait-list-gamma.vercel.app/" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={pageImage} />
	<meta property="og:site_name" content="Bookings Waitlist" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://wait-list-gamma.vercel.app/" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={pageImage} />

	<!-- Optional for better card handling -->
	<meta name="twitter:site" content="@YourTwitterHandle" />
	<meta name="twitter:creator" content="@YourCreatorHandle" />
</svelte:head>

<HomePage />
