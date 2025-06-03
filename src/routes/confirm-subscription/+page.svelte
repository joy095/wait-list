<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	// Assuming these types are defined in a '$lib/types.ts' file
	import type { SubscriptionResponse, ErrorResponse } from '$lib/types';

	let message: string = 'Confirming your subscription...';
	let isError: boolean = false;
	let isLoading: boolean = true;

	// This function will be called when the component is mounted in the browser
	onMount(async () => {
		// Get the token from the URL query parameters
		const token = $page.url.searchParams.get('token');

		if (!token) {
			// If no token is found in the URL
			message = 'Confirmation link is invalid or missing a token.';
			isError = true;
			isLoading = false;
			return; // Stop execution
		}

		try {
			// Call the backend API endpoint for confirmation
			// The endpoint is a GET request that expects the token as a query parameter
			const response = await fetch(`/confirm-subscription?token=${token}`);

			const data: SubscriptionResponse | ErrorResponse = await response.json();

			if (response.ok) {
				// If the response status is 200 OK (success)
				message = data.message || 'Your subscription has been successfully confirmed!';
				isError = false; // It's a success message
			} else {
				// If the response status is not OK (e.g., 400, 404, 500)
				message = data.message || 'Failed to confirm your subscription. Please try again.';
				isError = true; // It's an error message
			}
		} catch (error) {
			// Catch network errors or issues with the fetch request
			console.error('Confirmation fetch error:', error);
			message = 'A network error occurred while confirming your subscription.';
			isError = true; // It's an error message
		} finally {
			// This block runs regardless of success or error
			isLoading = false; // Stop loading state
		}
	});
</script>

<svelte:head>
	<title>Confirm Subscription</title>
	<meta name="description" content="Confirm your email subscription." />
</svelte:head>

<div
	class="font-inter flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
>
	<div
		class="confirmation-content w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl transition-shadow duration-300 hover:shadow-2xl md:p-12 dark:bg-gray-800"
		in:fly={{ y: -50, duration: 600, easing: quintOut }}
	>
		{#if isLoading}
			<p class="mb-6 text-lg">{message}</p>
			<div
				class="spinner mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"
			></div>
		{:else if isError}
			<h1 class="mb-4 text-4xl font-extrabold text-red-600 md:text-5xl dark:text-red-400">
				Confirmation Failed
			</h1>
			<p class="mb-6 text-lg text-gray-700 dark:text-gray-300">{message}</p>
			<a
				href="/"
				class="home-button inline-block transform rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
			>
				Go to Homepage
			</a>
		{:else}
			<h1 class="mb-4 text-4xl font-extrabold text-green-600 md:text-5xl dark:text-green-400">
				Subscription Confirmed!
			</h1>
			<p class="mb-6 text-lg text-gray-700 dark:text-gray-300">{message}</p>
			<a
				href="/"
				class="home-button inline-block transform rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
			>
				Go to Homepage
			</a>
		{/if}
	</div>
</div>

<style>
	/* Custom font import (if not using global CSS or Tailwind config) */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

	.font-inter {
		font-family: 'Inter', sans-serif;
	}

	/* Ensure the body or root element has min-h-screen for full height */
	html,
	body {
		height: 100%;
	}

	/* No custom CSS needed for .spinner, h1, p, .home-button as Tailwind handles them */
	/* The animate-spin class is provided by Tailwind CSS directly */
</style>
