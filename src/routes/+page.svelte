<script>
	import HomePage from '$lib/HomePage.svelte';

	const pageTitle = 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists';
	const pageDescription = 'Join the exclusive waitlist for Bookings...';
	const pageImage = 'https://wait-list-gamma.vercel.app/wait-list.png';
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
	<meta property="og:title" content={pageTitle} />
	<meta property="og:site_name" content="Wait List" />
	<meta property="og:url" content="https://wait-list-gamma.vercel.app" />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={pageImage} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://wait-list-gamma.vercel.app" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={pageImage} />
</svelte:head>

<HomePage />
