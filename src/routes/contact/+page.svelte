<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly, fade } from 'svelte/transition';
	import { inView } from '$lib/actions/inView';

	import type { Writable } from 'svelte/store';
	import { getContext } from 'svelte';

	// Your existing I18n context logic...
	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	let contactFormVisible = false; // State for the contact form section animation

	// --- Contact Form State ---
	let email: string = '';
	let name: string = '';
	let message: string = '';

	// Validation error messages
	let emailError: string = '';
	let nameError: string = '';
	let messageError: string = '';

	// Form submission status
	let isSubmitting: boolean = false;
	let submitSuccess: boolean = false;
	let submitError: boolean = false;
	let statusMessage: string = '';

	// Function to validate form fields (client-side)
	function validateForm(): boolean {
		let isValid = true;

		// Reset errors and status messages
		emailError = '';
		nameError = '';
		messageError = '';
		submitSuccess = false; // Reset success/error status on new validation
		submitError = false;
		statusMessage = '';

		if (!email.trim()) {
			emailError = 'Email is required.';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			emailError = 'Invalid email format.';
			isValid = false;
		}

		if (!name.trim()) {
			nameError = 'Name is required.';
			isValid = false;
		}

		if (!message.trim()) {
			messageError = 'Message is required.';
			isValid = false;
		}

		return isValid;
	}

	// Function to handle form submission
	async function handleSubmit() {
		if (!validateForm()) {
			return; // Stop if client-side validation fails
		}

		isSubmitting = true;
		statusMessage = 'Sending message...';

		try {
			// Send data to your SvelteKit API endpoint
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, name, message })
			});

			const result = await response.json(); // Parse the JSON response from the server

			if (response.ok) {
				// Check if the HTTP status code is 2xx
				submitSuccess = true;
				statusMessage = result.message || 'Message sent successfully!';
				// Clear form fields on success
				email = '';
				name = '';
				message = '';
			} else {
				submitError = true;
				// Use the message from the server response, or a generic one
				statusMessage = result.message || 'Failed to send message. Please try again.';
			}
		} catch (error) {
			console.error('Submission error:', error);
			submitError = true;
			statusMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isSubmitting = false;
			// Clear status message after a short delay for user feedback
			if (submitSuccess || submitError) {
				setTimeout(() => {
					statusMessage = '';
					submitSuccess = false;
					submitError = false;
				}, 5000); // Message disappears after 5 seconds
			}
		}
	}
</script>

<div
	class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<section
		class="flex min-h-screen items-center justify-center bg-purple-500 p-4"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (contactFormVisible = true)}
	>
		{#if contactFormVisible}
			<div class="container mx-auto" in:fly={{ y: 50, duration: 800, easing: quintOut }}>
				<div
					class="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 rounded-2xl bg-white px-4 py-8 shadow-xl md:flex-row md:px-10 md:py-12"
				>
					<div class="flex w-full flex-col items-center justify-center text-center md:w-1/2">
						<h2 class="mb-2 text-3xl font-bold text-purple-700 uppercase md:text-4xl">
							{t('contact', 'contact_heading')}
						</h2>
						<p class="mb-6 px-4 text-gray-600">
							{t('contact', 'reach_out')}

							<a
								href="mailto:joykarmakar852@gmail.com"
								class="text-purple-600 transition-colors duration-200 hover:text-purple-800 hover:underline"
								>joykarmakar852@gmail.com</a
							>
						</p>
						<img
							src="/img/plane.png"
							alt="Paper plane illustration"
							class="plane-img mt-4 w-full max-w-xs md:block md:max-w-full"
						/>
					</div>

					<div class="w-full md:w-1/2">
						<form on:submit|preventDefault={handleSubmit}>
							<div class="mb-5">
								<label for="uf-imail" class="mb-2 block text-sm font-medium text-gray-700">
									{t('contact', 'email')}
								</label>
								<input
									type="email"
									class="w-full rounded-lg border border-gray-300 p-3 transition duration-200 outline-none focus:ring-2 focus:ring-purple-500 focus:outline-none {emailError
										? 'border-red-500'
										: ''}"
									id="uf-imail"
									aria-describedby="emailHelp"
									placeholder={t('contact', 'email_placeholder')}
									bind:value={email}
									on:input={() => (emailError = '')}
								/>
								{#if emailError}
									<p class="mt-1 text-sm text-red-500" transition:fade={{ duration: 150 }}>
										{emailError}
									</p>
								{/if}
								<p id="emailHelp" class="mt-2 text-sm text-purple-600">
									{t('contact', 'privacy')}
								</p>
							</div>

							<div class="mb-5">
								<label for="uf-iname" class="mb-2 block text-sm font-medium text-gray-700">
									{t('contact', 'name')}
								</label>
								<input
									type="text"
									class="w-full rounded-lg border border-gray-300 p-3 transition duration-200 outline-none focus:ring-2 focus:ring-purple-500 focus:outline-none {nameError
										? 'border-red-500'
										: ''}"
									id="uf-iname"
									placeholder="John Doe"
									bind:value={name}
									on:input={() => (nameError = '')}
								/>
								{#if nameError}
									<p class="mt-1 text-sm text-red-500" transition:fade={{ duration: 150 }}>
										{nameError}
									</p>
								{/if}
							</div>

							<div class="mb-6">
								<label for="uf-itextarea" class="mb-2 block text-sm font-medium text-gray-700">
									{t('contact', 'message')}
								</label>
								<textarea
									class="min-h-[100px] w-full resize-y rounded-lg border border-gray-300 p-3 transition duration-200 outline-none focus:ring-2 focus:ring-purple-500 focus:outline-none {messageError
										? 'border-red-500'
										: ''}"
									id="uf-itextarea"
									rows="4"
									placeholder={t('contact', 'message_placeholder')}
									bind:value={message}
									on:input={() => (messageError = '')}
								></textarea>
								{#if messageError}
									<p class="mt-1 text-sm text-red-500" transition:fade={{ duration: 150 }}>
										{messageError}
									</p>
								{/if}
							</div>

							{#if statusMessage}
								<div
									class="mb-4 rounded-lg p-3 text-center font-medium
                                    {submitSuccess ? 'bg-green-100 text-green-700' : ''}
                                    {submitError ? 'bg-red-100 text-red-700' : ''}"
									transition:fade={{ duration: 200 }}
								>
									{statusMessage}
								</div>
							{/if}

							<button
								type="submit"
								class="focus:ring-opacity-75 w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
								disabled={isSubmitting}
							>
								{#if isSubmitting}
									{t('contact', 'submitting_btn')}
								{:else}
									{t('contact', 'submit_btn')}
								{/if}
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>

<style>
	/* Keyframes for Bounce Animation */
	@keyframes bounce-animation {
		0%,
		100% {
			transform: translateY(-5%); /* Lower bounce distance */
			animation-timing-function: linear; /* Changed to linear */
		}
		50% {
			transform: translateY(0);
			animation-timing-function: linear; /* Changed to linear */
		}
	}

	.plane-img {
		animation: bounce-animation 3s infinite; /* 3s duration, infinite loop */
	}
</style>
