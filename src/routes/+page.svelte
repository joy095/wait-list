<script>
	import { browser } from '$app/environment';
	import HomePage from '$lib/HomePage.svelte';

	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://yourdomain.com'; // Fallback for SSR

	// SEO and sharing metadata
	const pageTitle = 'Email Confirmation - Wait list Signup';
	const pageDescription = 'Confirm your email and share this page with your network!';
	const pageImage = `${baseUrl}/wait-list.webp`;

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

<HomePage />
