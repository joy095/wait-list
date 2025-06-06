<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	// Assuming these types are defined in a './types.ts' file relative to this component

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string; // Note the added 'namespace' argument
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse } from './types';
	import type { Writable } from 'svelte/store';
	import { getContext } from 'svelte';

	let name: string = '';
	let email: string = '';
	let phone: string = '';
	let addressCity: string = '';
	let addressState: string = ''; // This will hold the selected state value
	let message: string = '';
	let formFeedback: string = '';
	let isValidEmail: boolean = true;
	let isSubmitting: boolean = false;
	let submittedSuccessfully: boolean = false;

	// Validation error states for each field
	let nameError: string = '';
	let emailInputError: string = '';
	let addressCityError: string = '';
	let addressStateError: string = '';
	let generalFormError: string = '';

	// State for the custom searchable dropdown
	let stateSearchInput: string = ''; // Input value for searching states
	let showStateSuggestions: boolean = false; // Controls visibility of the suggestion list

	// Regex for basic email validation
	const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Function to validate email format
	function validateEmail(): void {
		isValidEmail = emailRegex.test(email);
		formFeedback = isValidEmail ? '' : 'Invalid email format';
	}

	// List of Indian States for the dropdown, sorted alphabetically
	const indianStates = [
		'Andaman and Nicobar Islands',
		'Andhra Pradesh',
		'Arunachal Pradesh',
		'Assam',
		'Bihar',
		'Chandigarh',
		'Chhattisgarh',
		'Dadra and Nagar Haveli and Daman and Diu',
		'Delhi',
		'Goa',
		'Gujarat',
		'Haryana',
		'Himachal Pradesh',
		'Jharkhand',
		'Karnataka',
		'Kerala',
		'Ladakh',
		'Lakshadweep',
		'Madhya Pradesh',
		'Maharashtra',
		'Manipur',
		'Meghalaya',
		'Mizoram',
		'Nagaland',
		'Odisha',
		'Punjab',
		'Puducherry',
		'Rajasthan',
		'Sikkim',
		'Tamil Nadu',
		'Telangana',
		'Tripura',
		'Uttar Pradesh',
		'Uttarakhand',
		'West Bengal'
	].sort(); // Ensure it's always alphabetical

	// Filtered states based on search input
	$: filteredStates = indianStates.filter((state) =>
		state.toLowerCase().includes(stateSearchInput.toLowerCase())
	);

	// Function to handle selection from the suggestion list
	function selectState(state: string): void {
		addressState = state;
		stateSearchInput = state; // Update input to show selected state
		showStateSuggestions = false; // Hide suggestions
		addressStateError = ''; // Clear error on selection
	}

	// Function to validate all form fields
	function validateForm(): boolean {
		let isValid = true;

		// Reset all errors and feedback
		nameError = '';
		emailInputError = '';
		addressCityError = '';
		addressStateError = '';
		generalFormError = '';
		formFeedback = '';
		submittedSuccessfully = false;

		// Name validation
		if (!name.trim()) {
			nameError = 'Name is required.';
			isValid = false;
		}

		// Email validation
		if (!email.trim()) {
			emailInputError = 'Email is required.';
			isValid = false;
		} else if (!emailRegex.test(email)) {
			emailInputError = 'Invalid email format.';
			isValid = false;
		}

		// Address City validation
		if (!addressCity.trim()) {
			addressCityError = 'City is required.';
			isValid = false;
		}

		// Address State validation (for dropdown)
		// Check if a state has been selected AND if it's one of the valid states
		if (!addressState || !indianStates.includes(addressState)) {
			addressStateError = 'Please select a valid state.';
			isValid = false;
		}

		// If any field is invalid, set a general form error message
		if (!isValid) {
			generalFormError = 'Please fill in all required fields correctly.';
		}

		return isValid;
	}

	async function handleSubmit(): Promise<void> {
		if (!validateForm()) {
			return; // Stop if client-side validation fails
		}

		isSubmitting = true;
		formFeedback = 'Sending your request...'; // Indicate submission in progress

		try {
			const requestBody: SubscriptionRequestBody = {
				name,
				email,
				phone: phone.trim() || undefined, // Only send if not empty
				addressCity,
				addressState,
				message: message.trim() || undefined // Only send if not empty
			};

			const response = await fetch('/api/subscribe', {
				// Assuming your API endpoint is /api/subscribe
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (response.ok) {
				const data: SubscriptionResponse = await response.json();
				submittedSuccessfully = true;
				formFeedback = data.message || 'Thank you for subscribing! We will be in touch soon.';
				// Clear all inputs on success
				name = '';
				email = '';
				phone = '';
				addressCity = '';
				addressState = ''; // Reset selected state
				stateSearchInput = ''; // Reset search input
				message = '';
			} else {
				const errorData: ErrorResponse = await response.json();
				submittedSuccessfully = false;
				formFeedback = errorData.message || 'Something went wrong. Please try again.';
				generalFormError = formFeedback; // Display error at the top
			}
		} catch (error) {
			console.error('Submission error:', error);
			submittedSuccessfully = false;
			formFeedback = 'Network error. Please try again later.';
			generalFormError = formFeedback; // Display error at the top
		} finally {
			isSubmitting = false;
			// Clear status message after a short delay for user feedback
			setTimeout(() => {
				formFeedback = '';
				generalFormError = '';
			}, 7000); // Message disappears after 7 seconds
		}
	}
</script>

<div class="font-inter flex min-h-screen items-center justify-center">
	<div
		class="hover:shadow-xl-strong mx-auto my-16 w-full max-w-xl rounded-3xl bg-white p-8 text-center text-gray-800 shadow-2xl transition-shadow duration-300 md:p-12"
		in:fly={{ y: 50, duration: 800, easing: quintOut }}
	>
		<div class="mb-8">
			<h2 class="mb-3 text-3xl font-extrabold tracking-tight text-purple-700 md:text-4xl">
				{t('mailing-list', 'join')}
			</h2>
			<p class="text-xl leading-relaxed text-gray-600">
				{t('mailing-list', 'stay_updated')}
			</p>
		</div>

		{#if submittedSuccessfully}
			<div
				class="rounded-lg border border-green-300 bg-green-50 p-4 font-medium text-green-800"
				transition:fly={{ y: -20, duration: 300, easing: quintOut }}
			>
				{formFeedback}
			</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				{#if generalFormError}
					<div
						class="rounded-lg border border-red-300 bg-red-50 p-4 font-medium text-red-800"
						transition:fly={{ y: -10, duration: 200 }}
					>
						{generalFormError}
					</div>
				{/if}

				<div class="text-left">
					<label for="name" class="mb-2 block text-base font-semibold text-gray-700"
						>{t('mailing-list', 'name_label')} <span class="text-red-500">*</span></label
					>
					<input
						type="text"
						id="name"
						bind:value={name}
						placeholder={t('mailing-list', 'name_label')}
						required
						class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200
                        {nameError ? 'border-red-500 bg-red-50' : ''}"
						on:input={() => (nameError = '')}
					/>
					{#if nameError}
						<p class="mt-1 text-sm text-red-600" transition:fly={{ y: -10, duration: 200 }}>
							{nameError}
						</p>
					{/if}
				</div>

				<div class="text-left">
					<label for="email" class="mb-2 block text-base font-semibold text-gray-700"
						>{t('mailing-list', 'email_placeholder')} <span class="text-red-500">*</span></label
					>
					<input
						type="email"
						id="email"
						bind:value={email}
						on:blur={() => {
							validateEmail();
							emailInputError = !isValidEmail ? formFeedback : '';
						}}
						on:input={() => {
							isValidEmail = true;
							emailInputError = '';
						}}
						class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200
                        {emailInputError ? 'border-red-500 bg-red-50' : ''}"
						placeholder={t('mailing-list', 'email_label')}
						required
					/>
					{#if emailInputError}
						<p class="mt-1 text-sm text-red-600" transition:fly={{ y: -10, duration: 200 }}>
							{emailInputError}
						</p>
					{/if}
				</div>

				<div class="text-left">
					<label for="phone" class="mb-2 block text-base font-semibold text-gray-700"
						>{t('mailing-list', 'phone_label')}</label
					>
					<input
						type="tel"
						id="phone"
						bind:value={phone}
						placeholder={t('mailing-list', 'phone_placeholder')}
						class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200"
					/>
				</div>

				<div class="text-left">
					<label class="mb-2 block text-base font-semibold text-gray-700"
						>{t('mailing-list', 'address_label')} <span class="text-red-500">*</span></label
					>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="relative">
							<input
								type="text"
								id="addressStateSearch"
								bind:value={stateSearchInput}
								placeholder={t('mailing-list', 'address_placeholder')}
								class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200
                                {addressStateError ? 'border-red-500 bg-red-50' : ''}"
								on:focus={() => (showStateSuggestions = true)}
								on:blur={() => setTimeout(() => (showStateSuggestions = false), 150)}
								on:input={() => {
									addressState = '';
									addressStateError = '';
								}}
							/>
							{#if addressStateError}
								<p class="mt-1 text-sm text-red-600" transition:fly={{ y: -10, duration: 200 }}>
									{addressStateError}
								</p>
							{/if}

							{#if showStateSuggestions && filteredStates.length > 0}
								<ul
									class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-300 bg-white shadow-lg"
								>
									{#each filteredStates as state}
										<li
											class="cursor-pointer px-4 py-2 text-left text-base text-gray-900 hover:bg-purple-100"
											on:mousedown|preventDefault={() => selectState(state)}
										>
											{state}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
						<input
							type="text"
							id="addressCity"
							bind:value={addressCity}
							placeholder={t('mailing-list', 'city_placeholder')}
							required
							class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200
                            {addressCityError ? 'border-red-500 bg-red-50' : ''}"
							on:input={() => (addressCityError = '')}
						/>
						{#if addressCityError}
							<p
								class="col-span-full mt-1 text-sm text-red-600"
								transition:fly={{ y: -10, duration: 200 }}
							>
								{addressCityError}
							</p>
						{/if}
					</div>
				</div>

				<div class="text-left">
					<label for="message" class="mb-2 block text-base font-semibold text-gray-700"
						>{t('mailing-list', 'message_label')}</label
					>
					<textarea
						id="message"
						bind:value={message}
						placeholder={t('mailing-list', 'message_placeholder')}
						rows="4"
						class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full transform rounded-full bg-purple-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
				>
					{#if isSubmitting}
						{t('mailing-list', 'button_submitting')}
					{:else}
						{t('mailing-list', 'button')}
					{/if}
				</button>
			</form>
			{#if formFeedback && !generalFormError}
				<p class="mt-6 text-base font-medium text-purple-600 italic">{formFeedback}</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* Custom font import */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

	.font-inter {
		font-family: 'Inter', sans-serif;
	}

	/* Custom shadow for a stronger hover effect (if not defined in tailwind.config.js) */
	.hover\:shadow-xl-strong:hover {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	/* Ensure the body or root element has min-h-screen for full height */
	html,
	body {
		height: 100%;
	}
</style>
