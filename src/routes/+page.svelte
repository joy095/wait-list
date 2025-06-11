<script>
	import HomePage from '$lib/HomePage.svelte';

	const pageTitle = 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists';
	const pageDescription = 'Join the exclusive waitlist for Bookings...';

	// Try with query parameter to bust cache
	const pageImage = 'https://wait-list-gamma.vercel.app/wait-list.png?v=1';
	const siteUrl = 'https://wait-list-gamma.vercel.app';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={pageImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Bookings Waitlist Preview" />
	<meta property="og:site_name" content="Bookings" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={pageImage} />
</svelte:head>

<HomePage />
