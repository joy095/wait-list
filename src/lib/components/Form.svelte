<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { isFormOpen } from '$lib/store';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	// Define the shape of your form data
	type FormData = {
		firstName: string;
		lastName: string;
		email: string;
		userType: string;
		otherDescription: string;
		visitFrequency: string;
		barberServices: string[];
		importantFactors: string[];
		bookingFrustrations: string;
		makeupOccasions: string[];
		commissionPreference: string;
		offerDiscounts: string;
		portfolioInterest: string;
		biggestChallenges: string;
		generalMessage: string; // New field for customer types
	};

	let currentStep = 1;
	const totalSteps = 3;
	let formData: FormData = {
		firstName: '',
		lastName: '',
		email: '',
		userType: '',
		otherDescription: '',
		visitFrequency: '',
		barberServices: [],
		importantFactors: [],
		bookingFrustrations: '',
		makeupOccasions: [],
		commissionPreference: '',
		offerDiscounts: '',
		portfolioInterest: '',
		biggestChallenges: '',
		generalMessage: ''
	};

	const progress = tweened(0, {
		duration: 500,
		easing: quintOut
	});

	$: $progress = (currentStep - 1) / (totalSteps - 1);
	let submitting = false;
	let formErrors: Record<string, string> = {};
	let showConfirmation = false;
	let formContainer: HTMLElement;

	$: isModalActive = $isFormOpen || showConfirmation;

	// Real-time validation state
	let fieldValidity: Record<string, boolean> = {
		firstName: true,
		lastName: true,
		email: true,
		userType: true
	};

	// Validate individual fields in real-time
	function validateField(field: keyof FormData): boolean {
		switch (field) {
			case 'firstName':
			case 'lastName':
				return !!formData[field].trim();
			case 'email':
				return /^\S+@\S+\.\S+$/.test(formData.email);
			case 'userType':
				return !!formData.userType;
			default:
				return true;
		}
	}

	// Update field validity on input
	$: {
		fieldValidity.firstName = validateField('firstName');
		fieldValidity.lastName = validateField('lastName');
		fieldValidity.email = validateField('email');
		fieldValidity.userType = validateField('userType');
	}

	function validateCurrentStep(): boolean {
		formErrors = {};
		switch (currentStep) {
			case 1:
				if (!formData.firstName) formErrors.firstName = t('form', 'first_name_error');
				if (!formData.lastName) formErrors.lastName = t('form', 'last_name_error');
				if (!formData.email) formErrors.email = t('form', 'email_error');
				else if (!validateField('email')) formErrors.email = 'Invalid email format.';
				if (!formData.userType) formErrors.userType = t('form', 'select_error');
				return Object.keys(formErrors).length === 0;

			case 2:
				const { userType } = formData;
				if (userType === 'customer_barber') {
					if (!formData.visitFrequency) formErrors.visitFrequency = t('form', 'visit_barber_error');
					if (formData.barberServices.length === 0)
						formErrors.barberServices = t('form', 'barber_services_error');
					if (formData.importantFactors.length === 0)
						formErrors.importantFactors = t('form', 'choosing_barber_error');
				} else if (userType === 'customer_makeup') {
					if (formData.makeupOccasions.length === 0)
						formErrors.makeupOccasions = 'Please select at least one occasion.';
					if (formData.importantFactors.length === 0)
						formErrors.importantFactors = t('form', 'choosing_barber_error');
				} else if (userType === 'owner_barber') {
					if (!formData.commissionPreference)
						formErrors.commissionPreference = t('form', 'charged_commission_error');
					if (!formData.offerDiscounts)
						formErrors.offerDiscounts = t('form', 'discounts_subscriptions_error');
				} else if (userType === 'owner_makeup') {
					if (!formData.commissionPreference)
						formErrors.commissionPreference = t('form', 'charged_commission_error');
					if (!formData.portfolioInterest)
						formErrors.portfolioInterest = t('form', 'discounts_subscriptions_error');
				}
				return Object.keys(formErrors).length === 0;

			case 3:
				return true;
			default:
				return true;
		}
	}

	function nextStep() {
		if (validateCurrentStep()) {
			if (currentStep < totalSteps) {
				currentStep++;
			}
		} else {
			const firstErrorField = formContainer.querySelector('.error');
			if (firstErrorField) {
				firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	function prevStep() {
		formErrors = {};
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function resetFormState() {
		formData = {
			firstName: '',
			lastName: '',
			email: '',
			userType: '',
			otherDescription: '',
			visitFrequency: '',
			barberServices: [],
			importantFactors: [],
			bookingFrustrations: '',
			makeupOccasions: [],
			commissionPreference: '',
			offerDiscounts: '',
			portfolioInterest: '',
			biggestChallenges: '',
			generalMessage: ''
		};
		currentStep = 1;
		formErrors = {};
		submitting = false;
	}

	function closeAllModals() {
		isFormOpen.set(false);
		showConfirmation = false;
		setTimeout(() => {
			resetFormState();
		}, 300);
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeAllModals();
		}
	}

	const submitAction = () => {
		if (!validateCurrentStep()) {
			return;
		}
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				isFormOpen.set(false);
				showConfirmation = true;
			} else if (result.type === 'failure') {
				formErrors.general = result.data?.message || 'Submission failed. Please check your inputs.';
			} else if (result.type === 'error') {
				formErrors.general = result.error.message || 'An unexpected server error occurred.';
			}
			await update({ reset: false });
		};
	};

	onMount(() => {
		const firstInput = formContainer?.querySelector('input');
		if (firstInput) firstInput.focus();
	});
</script>

{#if isModalActive}
	<div
		class="backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Escape' && closeAllModals()}
		role="dialog"
		aria-modal="true"
		tabindex="0"
		transition:fade={{ duration: 300 }}
	>
		{#if $isFormOpen}
			<div
				bind:this={formContainer}
				class="form-container relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
				in:fly={{ y: 50, duration: 400, easing: quintOut }}
				out:fly={{ y: 50, duration: 300 }}
			>
				<button
					on:click={closeAllModals}
					class="absolute top-4 right-4 z-10 cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
					aria-label="Close form"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<div class="p-6 sm:p-8">
					<h2 class="mb-6 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
						{t('form', 'heading')}
					</h2>
					<div class="mb-6">
						<div class="relative h-2 rounded-full bg-gray-200">
							<div
								class="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
								style="width: {$progress * 100}%"
							></div>
						</div>
						<div class="mt-2 flex justify-between text-xs text-gray-600">
							<span></span>
							<span class="font-medium">
								{t('form', 'progress')}
								{Math.round($progress * 100)}%</span
							>
						</div>
					</div>
					<form method="POST" action="?/submitForm" use:enhance={submitAction}>
						<div
							class:hidden={currentStep !== 1}
							class="space-y-5"
							transition:fade={{ duration: 200 }}
						>
							<h3 class="text-lg font-semibold text-gray-800">
								{t('form', 'your_details')}
							</h3>
							<div>
								<label
									for="firstName"
									class="block text-sm font-medium text-gray-700"
									aria-required="true"
								>
									{t('form', 'first_name')} <span class="text-red-500">*</span>
								</label>
								<div class="relative mt-1">
									<input
										type="text"
										id="firstName"
										name="firstName"
										autocomplete="off"
										bind:value={formData.firstName}
										class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.firstName
											? 'error border-red-500'
											: ''}"
										placeholder="John"
										aria-describedby="firstName-error"
									/>
									{#if fieldValidity.firstName && formData.firstName}
										<span class="absolute top-1/2 right-3 -translate-y-1/2 text-green-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</span>
									{/if}
								</div>
								{#if formErrors.firstName}
									<p id="firstName-error" class="mt-1 text-xs text-red-600">
										{formErrors.firstName}
									</p>
								{/if}
							</div>
							<div>
								<label
									for="lastName"
									class="block text-sm font-medium text-gray-700"
									aria-required="true"
								>
									{t('form', 'last_name')} <span class="text-red-500">*</span>
								</label>
								<div class="relative mt-1">
									<input
										type="text"
										id="lastName"
										name="lastName"
										autocomplete="off"
										bind:value={formData.lastName}
										class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.lastName
											? 'error border-red-500'
											: ''}"
										placeholder="Doe"
										aria-describedby="lastName-error"
									/>
									{#if fieldValidity.lastName && formData.lastName}
										<span class="absolute top-1/2 right-3 -translate-y-1/2 text-green-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</span>
									{/if}
								</div>
								{#if formErrors.lastName}
									<p id="lastName-error" class="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
								{/if}
							</div>
							<div>
								<label
									for="email"
									class="block text-sm font-medium text-gray-700"
									aria-required="true"
								>
									{t('form', 'email')} <span class="text-red-500">*</span>
								</label>
								<div class="relative mt-1">
									<input
										type="email"
										id="email"
										name="email"
										bind:value={formData.email}
										autocomplete="off"
										class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.email
											? 'error border-red-500'
											: ''}"
										placeholder="john.doe@example.com"
										aria-describedby="email-error"
									/>
									{#if fieldValidity.email && formData.email}
										<span class="absolute top-1/2 right-3 -translate-y-1/2 text-green-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</span>
									{/if}
								</div>
								{#if formErrors.email}
									<p id="email-error" class="mt-1 text-xs text-red-600">{formErrors.email}</p>
								{/if}
							</div>
							<fieldset>
								<legend class="block text-sm font-medium text-gray-700" aria-required="true">
									{t('form', 'describes_you')}
									<span class="text-red-500">*</span>
								</legend>
								<div class="mt-2 space-y-2">
									<label class="flex items-center text-sm">
										<input
											type="radio"
											name="userType"
											value="customer_barber"
											bind:group={formData.userType}
											class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
											aria-describedby="userType-error"
										/>
										{t('form', 'describes_you_1')}
									</label>
									<label class="flex items-center text-sm">
										<input
											type="radio"
											name="userType"
											value="customer_makeup"
											bind:group={formData.userType}
											class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
										/>
										{t('form', 'describes_you_2')}
									</label>
									<label class="flex items-center text-sm">
										<input
											type="radio"
											name="userType"
											value="owner_barber"
											bind:group={formData.userType}
											class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
										/>
										{t('form', 'describes_you_3')}
									</label>
									<label class="flex items-center text-sm">
										<input
											type="radio"
											name="userType"
											value="owner_makeup"
											bind:group={formData.userType}
											class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
										/>
										{t('form', 'describes_you_4')}
									</label>
								</div>
								{#if formErrors.userType}
									<p id="userType-error" class="mt-1 text-xs text-red-600">{formErrors.userType}</p>
								{/if}
							</fieldset>
						</div>

						<div
							class:hidden={currentStep !== 2}
							class="space-y-6"
							transition:fade={{ duration: 200 }}
						>
							{#if formData.userType === 'customer_barber'}
								<div class="space-y-6">
									<h3 class="text-lg font-semibold text-gray-800">
										{t('form', 'barber_heading')}
									</h3>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'visit_barber')}
											<span class="text-red-500">*</span>
										</legend>
										<select
											name="visitFrequency"
											bind:value={formData.visitFrequency}
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.visitFrequency
												? 'error border-red-500'
												: ''}"
											aria-describedby="visitFrequency-error"
										>
											<option value="" disabled>Select frequency...</option>
											<option value="weekly">
												{t('form', 'visit_barber_1')}
												Weekly</option
											>
											<option value="biweekly">{t('form', 'visit_barber_2')}</option>
											<option value="monthly">{t('form', 'visit_barber_3')}</option>
											<option value="few-months">{t('form', 'visit_barber_4')}</option>
										</select>
										{#if formErrors.visitFrequency}
											<p id="visitFrequency-error" class="mt-1 text-xs text-red-600">
												{formErrors.visitFrequency}
											</p>
										{/if}
									</fieldset>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'barber_services')}
											<span class="text-red-500">*</span>
										</legend>
										<div class="mt-2 space-y-2">
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="barberServices"
													value="haircut"
													bind:group={formData.barberServices}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
													aria-describedby="barberServices-error"
												/>
												{t('form', 'barber_services_1')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="barberServices"
													value="shave"
													bind:group={formData.barberServices}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'barber_services_2')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="barberServices"
													value="beard-trim"
													bind:group={formData.barberServices}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'barber_services_3')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="barberServices"
													value="facial"
													bind:group={formData.barberServices}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'barber_services_4')}
											</label>
										</div>
										{#if formErrors.barberServices}
											<p id="barberServices-error" class="mt-1 text-xs text-red-600">
												{formErrors.barberServices}
											</p>
										{/if}
									</fieldset>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'choosing_barber')}
											<span class="text-red-500">*</span>
										</legend>
										<div class="mt-2 space-y-2">
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="availability"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
													aria-describedby="importantFactors-error"
												/>
												{t('form', 'choosing_barber_1')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="skill"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'choosing_barber_2')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="reviews"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'choosing_barber_3')}
											</label>
										</div>
										{#if formErrors.importantFactors}
											<p id="importantFactors-error" class="mt-1 text-xs text-red-600">
												{formErrors.importantFactors}
											</p>
										{/if}
									</fieldset>
									<div>
										<label
											for="bookingFrustrations"
											class="block text-sm font-medium text-gray-700"
										>
											{t('form', 'frustrations_barber')}
										</label>
										<textarea
											id="bookingFrustrations"
											name="bookingFrustrations"
											bind:value={formData.bookingFrustrations}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'frustrations_barber_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'feedback_optional')}
										</p>
									</div>
									<div>
										<label for="generalMessage" class="block text-sm font-medium text-gray-700">
											{t('form', 'feedback')}
										</label>
										<textarea
											id="generalMessage"
											name="generalMessage"
											bind:value={formData.generalMessage}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'feedback_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'feedback_optional')}
										</p>
									</div>
								</div>
							{/if}

							{#if formData.userType === 'customer_makeup'}
								<div class="space-y-6">
									<h3 class="text-lg font-semibold text-gray-800">
										{t('form', 'makeup_heading')}
									</h3>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'makeup_questions')}
											<span class="text-red-500">*</span>
										</legend>
										<div class="mt-2 space-y-2">
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="makeupOccasions"
													value="wedding"
													bind:group={formData.makeupOccasions}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
													aria-describedby="makeupOccasions-error"
												/>
												{t('form', 'makeup_questions_1')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="makeupOccasions"
													value="event"
													bind:group={formData.makeupOccasions}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'makeup_questions_2')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="makeupOccasions"
													value="photoshoot"
													bind:group={formData.makeupOccasions}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'makeup_questions_3')}
											</label>
										</div>
										{#if formErrors.makeupOccasions}
											<p id="makeupOccasions-error" class="mt-1 text-xs text-red-600">
												{formErrors.makeupOccasions}
											</p>
										{/if}
									</fieldset>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'choosing_makeup_artist')} <span class="text-red-500">*</span>
										</legend>
										<div class="mt-2 space-y-2">
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="portfolio"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
													aria-describedby="importantFactors-error"
												/>
												{t('form', 'choosing_makeup_artist_1')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="reviews"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'choosing_makeup_artist_2')}
											</label>
											<label class="flex items-center text-sm">
												<input
													type="checkbox"
													name="importantFactors"
													value="specialization"
													bind:group={formData.importantFactors}
													class="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
												/>
												{t('form', 'choosing_makeup_artist_3')}
											</label>
										</div>
										{#if formErrors.importantFactors}
											<p id="importantFactors-error" class="mt-1 text-xs text-red-600">
												{formErrors.importantFactors}
											</p>
										{/if}
									</fieldset>
									<div>
										<label
											for="bookingFrustrations"
											class="block text-sm font-medium text-gray-700"
										>
											{t('form', 'frustrations_booking_makeup')}
										</label>
										<textarea
											id="bookingFrustrations"
											name="bookingFrustrations"
											bind:value={formData.bookingFrustrations}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'frustrations_booking_makeup_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'frustrations_booking_makeup_optional')}
										</p>
									</div>
									<div>
										<label for="generalMessage" class="block text-sm font-medium text-gray-700">
											{t('form', 'feedback')}
										</label>
										<textarea
											id="generalMessage"
											name="generalMessage"
											bind:value={formData.generalMessage}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'feedback_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'feedback_optional')}
										</p>
									</div>
								</div>
							{/if}

							{#if formData.userType === 'owner_barber'}
								<div class="space-y-6">
									<h3 class="text-lg font-semibold text-gray-800">
										{t('form', 'business_heading')}
									</h3>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'charged_commission')}

											<span class="text-red-500">*</span>
										</legend>
										<select
											name="commissionPreference"
											bind:value={formData.commissionPreference}
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.commissionPreference
												? 'error border-red-500'
												: ''}"
											aria-describedby="commissionPreference-error"
										>
											<option value="" disabled>{t('form', 'charged_commission_0')} </option>
											<option value="yes_5_10">{t('form', 'charged_commission_1')} </option>
											<option value="yes_10_15">{t('form', 'charged_commission_2')} </option>
											<option value="no_monthly_fee">{t('form', 'charged_commission_3')} </option>
										</select>
										{#if formErrors.commissionPreference}
											<p id="commissionPreference-error" class="mt-1 text-xs text-red-600">
												{formErrors.commissionPreference}
											</p>
										{/if}
									</fieldset>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'discounts_subscriptions')}

											<span class="text-red-500">*</span>
										</legend>
										<select
											name="offerDiscounts"
											bind:value={formData.offerDiscounts}
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.offerDiscounts
												? 'error border-red-500'
												: ''}"
											aria-describedby="offerDiscounts-error"
										>
											<option value="" disabled>
												{t('form', 'discounts_subscriptions_0')}
											</option>
											<option value="yes_10_percent"
												>{t('form', 'discounts_subscriptions_1')}</option
											>
											<option value="yes_20_percent"
												>{t('form', 'discounts_subscriptions_2')}</option
											>
											<option value="yes_subscriptions"
												>{t('form', 'discounts_subscriptions_3')}</option
											>
											<option value="no">{t('form', 'discounts_subscriptions_4')}</option>
										</select>
										{#if formErrors.offerDiscounts}
											<p id="offerDiscounts-error" class="mt-1 text-xs text-red-600">
												{formErrors.offerDiscounts}
											</p>
										{/if}
									</fieldset>
									<div>
										<label for="biggestChallenges" class="block text-sm font-medium text-gray-700">
											{t('form', 'managing_bookings')}
										</label>
										<textarea
											id="biggestChallenges"
											name="biggestChallenges"
											bind:value={formData.biggestChallenges}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'managing_bookings_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'managing_bookings_optional')}
										</p>
									</div>
								</div>
							{/if}

							{#if formData.userType === 'owner_makeup'}
								<div class="space-y-6">
									<h3 class="text-lg font-semibold text-gray-800">
										{t('form', 'business_heading')}
									</h3>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'charged_commission')}
											<span class="text-red-500">*</span>
										</legend>
										<select
											name="commissionPreference"
											bind:value={formData.commissionPreference}
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.commissionPreference
												? 'error border-red-500'
												: ''}"
											aria-describedby="commissionPreference-error"
										>
											<option value="" disabled>
												{t('form', 'charged_commission_0')}
											</option>
											<option value="yes_5_10">{t('form', 'charged_commission_1')}</option>
											<option value="yes_10_15">{t('form', 'charged_commission_2')}</option>
											<option value="no_monthly_fee">{t('form', 'charged_commission_3')}</option>
										</select>
										{#if formErrors.commissionPreference}
											<p id="commissionPreference-error" class="mt-1 text-xs text-red-600">
												{formErrors.commissionPreference}
											</p>
										{/if}
									</fieldset>
									<fieldset>
										<legend class="block text-sm font-medium text-gray-700">
											{t('form', 'features')} <span class="text-red-500">*</span>
										</legend>
										<select
											name="portfolioInterest"
											bind:value={formData.portfolioInterest}
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.portfolioInterest
												? 'error border-red-500'
												: ''}"
											aria-describedby="portfolioInterest-error"
										>
											<option value="" disabled> {t('form', 'features_0')} </option>
											<option value="yes_high_priority"> {t('form', 'features_1')} </option>
											<option value="yes_valuable"> {t('form', 'features_2')} </option>
											<option value="no"> {t('form', 'features_3')} </option>
										</select>
										{#if formErrors.portfolioInterest}
											<p id="portfolioInterest-error" class="mt-1 text-xs text-red-600">
												{formErrors.portfolioInterest}
											</p>
										{/if}
									</fieldset>
									<div>
										<label for="biggestChallenges" class="block text-sm font-medium text-gray-700">
											{t('form', 'managing_bookings')}
										</label>
										<textarea
											id="biggestChallenges"
											name="biggestChallenges"
											bind:value={formData.biggestChallenges}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
											placeholder={t('form', 'managing_bookings_placeholder')}
										></textarea>
										<p class="mt-1 text-xs text-gray-500">
											{t('form', 'managing_bookings_optional')}
										</p>
									</div>
								</div>
							{/if}
						</div>

						<div
							class:hidden={currentStep !== 3}
							class="space-y-4"
							transition:fade={{ duration: 200 }}
						>
							<h3 class="text-lg font-semibold text-gray-800">Review Your Information</h3>
							<div class="rounded-lg bg-gray-50 p-4">
								<div class="grid gap-2 text-sm">
									<p><strong>First Name:</strong> {formData.firstName}</p>
									<p><strong>Last Name:</strong> {formData.lastName}</p>
									<p><strong>Email:</strong> {formData.email}</p>
									<p>
										<strong>User Type:</strong>
										{formData.userType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
									</p>
									{#if formData.userType === 'other'}
										<p><strong>Description:</strong> {formData.otherDescription || 'N/A'}</p>
									{/if}
									{#if formData.userType === 'customer_barber'}
										<p><strong>Visit Frequency:</strong> {formData.visitFrequency || 'N/A'}</p>
										<p>
											<strong>Barber Services:</strong>
											{formData.barberServices.join(', ') || 'N/A'}
										</p>
										<p>
											<strong>Important Factors:</strong>
											{formData.importantFactors.join(', ') || 'N/A'}
										</p>
										<p>
											<strong>Booking Frustrations:</strong>
											{formData.bookingFrustrations || 'N/A'}
										</p>
										<p><strong>Additional Feedback:</strong> {formData.generalMessage || 'N/A'}</p>
									{:else if formData.userType === 'customer_makeup'}
										<p>
											<strong>Makeup Occasions:</strong>
											{formData.makeupOccasions.join(', ') || 'N/A'}
										</p>
										<p>
											<strong>Important Factors:</strong>
											{formData.importantFactors.join(', ') || 'N/A'}
										</p>
										<p>
											<strong>Booking Frustrations:</strong>
											{formData.bookingFrustrations || 'N/A'}
										</p>
										<p><strong>Additional Feedback:</strong> {formData.generalMessage || 'N/A'}</p>
									{:else if formData.userType === 'owner_barber'}
										<p>
											<strong>Commission Preference:</strong>
											{formData.commissionPreference || 'N/A'}
										</p>
										<p><strong>Offer Discounts:</strong> {formData.offerDiscounts || 'N/A'}</p>
										<p>
											<strong>Biggest Challenges:</strong>
											{formData.biggestChallenges || 'N/A'}
										</p>
									{:else if formData.userType === 'owner_makeup'}
										<p>
											<strong>Commission Preference:</strong>
											{formData.commissionPreference || 'N/A'}
										</p>
										<p>
											<strong>Portfolio Interest:</strong>
											{formData.portfolioInterest || 'N/A'}
										</p>
										<p>
											<strong>Biggest Challenges:</strong>
											{formData.biggestChallenges || 'N/A'}
										</p>
									{/if}
								</div>
							</div>
						</div>

						{#if formErrors.general}
							<div
								class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
								transition:fade={{ duration: 200 }}
							>
								{formErrors.general}
							</div>
						{/if}

						<div class="mt-6 flex justify-between border-t border-gray-200 pt-5">
							<button
								type="button"
								on:click={prevStep}
								class="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 {currentStep ===
								1
									? 'invisible'
									: ''}"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-2 h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								Back
							</button>
							{#if currentStep < totalSteps}
								<button
									type="button"
									on:click={nextStep}
									class="inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
								>
									Continue
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="ml-2 h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							{:else}
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
									disabled={submitting}
								>
									{#if submitting}
										<svg
											class="mr-2 h-4 w-4 animate-spin"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Processing...
									{:else}
										Submit
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="ml-2 h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									{/if}
								</button>
							{/if}
						</div>
					</form>
				</div>
			</div>
		{:else if showConfirmation}
			<div
				class="form-container relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 text-center shadow-2xl"
				in:scale={{ duration: 400, start: 0.9 }}
				out:fade={{ duration: 300 }}
				role="dialog"
				aria-labelledby="confirmation-title"
				aria-describedby="confirmation-message"
			>
				<div class="mb-5 flex justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-14 w-14 animate-pulse text-green-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<h3 id="confirmation-title" class="mb-4 text-2xl font-bold text-gray-900">Thank you!</h3>

				<p id="confirmation-message" class="mb-2 text-gray-700">
					A confirmation email has been sent to <span class="font-medium">{formData.email}</span>.
				</p>

				<p class="mb-6 text-gray-600">Please check your inbox and confirm your email to proceed.</p>

				<button
					on:click={closeAllModals}
					class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
				>
					Start Exploring
				</button>
			</div>
		{/if}
	</div>
{/if}
