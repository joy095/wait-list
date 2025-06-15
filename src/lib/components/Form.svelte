<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { isFormOpen } from '$lib/store';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import PremiumGlassSelect from './CustomSelect.svelte';

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	const userDescribe = [
		{ value: 'customer_barber', label: 'describes_you_1' },
		{ value: 'customer_makeup', label: 'describes_you_2' },
		{ value: 'owner_barber', label: 'describes_you_3' },
		{ value: 'owner_makeup', label: 'describes_you_4' }
	];

	const barberVisit = [
		{ value: 'weekly', label: 'visit_barber_1' },
		{ value: 'biweekly', label: 'visit_barber_2' },
		{ value: 'monthly', label: 'visit_barber_3' },
		{ value: 'few-months', label: 'visit_barber_4' }
	];

	const commissionCharge = [
		{ value: '', label: 'charged_commission_0' },
		{ value: 'yes_5_10', label: 'charged_commission_1' },
		{ value: 'yes_10_15', label: 'charged_commission_2' },
		{ value: 'no_monthly_fee', label: 'charged_commission_3' }
	];

	const discountsSubscriptions = [
		{ value: '', label: 'discounts_subscriptions_0' },
		{ value: 'yes_10_percent', label: 'discounts_subscriptions_1' },
		{ value: 'yes_subscriptions', label: 'discounts_subscriptions_2' },
		{ value: 'no', label: 'discounts_subscriptions_3' }
	];

	const makeupFeature = [
		{ value: '', label: 'features_0' },
		{ value: 'yes_high_priority', label: 'features_1' },
		{ value: 'yes_valuable', label: 'features_2' },
		{ value: 'no', label: 'features_3' }
	];

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
		generalMessage: string;
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
		userType: true,
		otherDescription: true
	};

	function validateField(field: keyof FormData): boolean {
		switch (field) {
			case 'firstName':
			case 'lastName':
				return !!formData[field].trim();
			case 'email':
				return /^\S+@\S+\.\S+$/.test(formData.email);

			case 'userType':
				return ['customer_barber', 'customer_makeup', 'owner_barber', 'owner_makeup'].includes(
					formData.userType
				);

			default:
				return true;
		}
	}

	$: {
		fieldValidity.firstName = validateField('firstName');
		fieldValidity.lastName = validateField('lastName');
		fieldValidity.email = validateField('email');
		fieldValidity.userType = validateField('userType');
		fieldValidity.otherDescription = validateField('otherDescription');
	}

	function validateCurrentStep(): boolean {
		formErrors = {};
		console.log(`[Form] Validating step ${currentStep}, userType: ${formData.userType}`); // Debug
		switch (currentStep) {
			case 1:
				if (!formData.firstName) formErrors.firstName = t('form', 'first_name_error');
				if (!formData.lastName) formErrors.lastName = t('form', 'last_name_error');
				if (!formData.email) formErrors.email = t('form', 'email_error');
				else if (!validateField('email')) formErrors.email = t('form', 'email_invalid');
				if (!formData.userType) formErrors.userType = t('form', 'select_error');
				else if (!validateField('userType')) formErrors.userType = t('form', 'select_invalid');
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
						formErrors.makeupOccasions = t('form', 'makeup_occasions_error');
					if (formData.importantFactors.length === 0)
						formErrors.importantFactors = t('form', 'choosing_makeup_artist_error');
				} else if (userType === 'owner_barber') {
					if (!formData.commissionPreference)
						formErrors.commissionPreference = t('form', 'charged_commission_error');
					if (!formData.offerDiscounts)
						formErrors.offerDiscounts = t('form', 'discounts_subscriptions_error');
				} else if (userType === 'owner_makeup') {
					if (!formData.commissionPreference)
						formErrors.commissionPreference = t('form', 'charged_commission_error');
					if (!formData.portfolioInterest)
						formErrors.portfolioInterest = t('form', 'portfolio_interest_error');
				} else if (userType === 'other') {
					if (!formData.otherDescription)
						formErrors.otherDescription = t('form', 'other_description_error');
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
				console.log(`[Form] Moved to step ${currentStep}`); // Debug
			}
		} else {
			console.log(`[Form] Validation failed on step ${currentStep}:`, formErrors); // Debug
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

	const submitAction: import('@sveltejs/kit').SubmitFunction = () => {
		if (!validateCurrentStep()) {
			return;
		}
		if (
			!['customer_barber', 'customer_makeup', 'owner_barber', 'owner_makeup', 'other'].includes(
				formData.userType
			)
		) {
			formErrors.general = t('form', 'select_invalid');
			return;
		}
		submitting = true;
		return async ({ formData, action, result, update }) => {
			// Log FormData for debugging
			const formDataEntries = Object.fromEntries(formData);
			console.log('Client FormData:', {
				...formDataEntries,
				barberServices: formData.getAll('barberServices'),
				makeupOccasions: formData.getAll('makeupOccasions'),
				importantFactors: formData.getAll('importantFactors')
			});
			submitting = false;

			if (result.type === 'success') {
				isFormOpen.set(false);
				showConfirmation = true;
			} else if (result.type === 'failure') {
				console.error('Submission error:', result.data);
				formErrors.general = result.data?.message || t('form', 'submission_failed');
			} else if (result.type === 'error') {
				console.error('Server error:', result.error);
				formErrors.general = result.error?.message || t('form', 'server_error');
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
				class="form-container animate-card glass-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl shadow-2xl"
				in:fly={{ y: 50, duration: 400, easing: quintOut }}
				out:fly={{ y: 50, duration: 300 }}
			>
				<button
					on:click={closeAllModals}
					class="hover: absolute top-4 right-4 z-10 cursor-pointer rounded-full p-2 text-gray-500 transition-colors"
					aria-label={t('form', 'close_form')}
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
					<h2 class="section-title mb-6 text-center text-2xl font-bold sm:text-3xl">
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
							<span class="text-subtitle font-medium">
								{t('form', 'progress')}
								{Math.round($progress * 100)}%
							</span>
						</div>
					</div>
					<form
						method="POST"
						action="?/submitForm"
						use:enhance={submitAction}
						class="text-subtitle"
					>
						<div
							class:hidden={currentStep !== 1}
							class="space-y-5"
							transition:fade={{ duration: 200 }}
						>
							<h3 class="section-title text-lg font-semibold">
								{t('form', 'your_details')}
							</h3>
							<div>
								<label
									for="firstName"
									class="text-subtitle block text-sm font-medium"
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
								<label for="lastName" class="block text-sm font-medium" aria-required="true">
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
								<label for="email" class="block text-sm font-medium" aria-required="true">
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
							<div>
								<PremiumGlassSelect
									name="userType"
									label="describes_you"
									options={userDescribe}
									bind:selected={formData.userType}
									required={true}
								/>
								{#if formErrors.userType}
									<p id="userType-error" class="mt-1 text-xs text-red-600">{formErrors.userType}</p>
								{/if}
							</div>
						</div>

						<div
							class:hidden={currentStep !== 2}
							class="space-y-6"
							transition:fade={{ duration: 200 }}
						>
							{#if formData.userType === 'customer_barber'}
								<div class="space-y-6">
									<h3 class="section-title text-lg font-semibold">
										{t('form', 'barber_heading')}
									</h3>
									<div>
										<PremiumGlassSelect
											name="visitFrequency"
											label="visit_barber"
											options={barberVisit}
											bind:selected={formData.visitFrequency}
											required={true}
										/>
										{#if formErrors.visitFrequency}
											<p id="visitFrequency-error" class="mt-1 text-xs text-red-600">
												{formErrors.visitFrequency}
											</p>
										{/if}
									</div>
									<fieldset>
										<legend class="block text-sm font-medium">
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
										<legend class="block text-sm font-medium">
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
										<label for="bookingFrustrations" class="block text-sm font-medium">
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
										<label for="generalMessage" class="block text-sm font-medium">
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
									<h3 class="section-title text-lg font-semibold">
										{t('form', 'makeup_heading')}
									</h3>
									<fieldset>
										<legend class="block text-sm font-medium">
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
										<legend class="block text-sm font-medium">
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
										<label for="bookingFrustrations" class="block text-sm font-medium">
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
										<label for="generalMessage" class="block text-sm font-medium">
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
									<h3 class="section-title text-lg font-semibold">
										{t('form', 'business_heading')}
									</h3>
									<div>
										<PremiumGlassSelect
											name="commissionPreference"
											label="charged_commission"
											options={commissionCharge}
											bind:selected={formData.commissionPreference}
											required={true}
										/>
										{#if formErrors.commissionPreference}
											<p id="commissionPreference-error" class="mt-1 text-xs text-red-600">
												{formErrors.commissionPreference}
											</p>
										{/if}
									</div>
									<div>
										<PremiumGlassSelect
											name="offerDiscounts"
											label="discounts_subscriptions"
											options={discountsSubscriptions}
											bind:selected={formData.offerDiscounts}
											required={true}
										/>
										{#if formErrors.offerDiscounts}
											<p id="offerDiscounts-error" class="mt-1 text-xs text-red-600">
												{formErrors.offerDiscounts}
											</p>
										{/if}
									</div>
									<div>
										<label for="biggestChallenges" class="block text-sm font-medium">
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
									<h3 class="section-title text-lg font-semibold">
										{t('form', 'business_heading')}
									</h3>
									<div>
										<PremiumGlassSelect
											name="commissionPreference"
											label="charged_commission"
											options={commissionCharge}
											bind:selected={formData.commissionPreference}
											required={true}
										/>
										{#if formErrors.commissionPreference}
											<p id="commissionPreference-error" class="mt-1 text-xs text-red-600">
												{formErrors.commissionPreference}
											</p>
										{/if}
									</div>
									<div>
										<PremiumGlassSelect
											name="portfolioInterest"
											label="features"
											options={makeupFeature}
											bind:selected={formData.portfolioInterest}
											required={true}
										/>
										{#if formErrors.portfolioInterest}
											<p id="portfolioInterest-error" class="mt-1 text-xs text-red-600">
												{formErrors.portfolioInterest}
											</p>
										{/if}
									</div>
									<div>
										<label for="biggestChallenges" class="block text-sm font-medium">
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
							{#if formData.userType === 'other'}
								<div class="space-y-6">
									<h3 class="section-title text-lg font-semibold">
										{t('form', 'other_heading')}
									</h3>
									<div>
										<label for="otherDescription" class="block text-sm font-medium">
											{t('form', 'other_description')} <span class="text-red-500">*</span>
										</label>
										<textarea
											id="otherDescription"
											name="otherDescription"
											bind:value={formData.otherDescription}
											rows="4"
											class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 {formErrors.otherDescription
												? 'error border-red-500'
												: ''}"
											placeholder={t('form', 'other_description_placeholder')}
											aria-describedby="otherDescription-error"
										></textarea>
										{#if formErrors.otherDescription}
											<p id="otherDescription-error" class="mt-1 text-xs text-red-600">
												{formErrors.otherDescription}
											</p>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<div
							class:hidden={currentStep !== 3}
							class="space-y-4"
							transition:fade={{ duration: 200 }}
						>
							<h3 class="section-title text-lg font-semibold">{t('form', 'review_information')}</h3>
							<div class="rounded-lg p-4">
								<div class="rounded-lg p-4">
									<div class="grid gap-2 text-sm">
										<p><strong>{t('form', 'first_name')}:</strong> {formData.firstName}</p>
										<p><strong>{t('form', 'last_name')}:</strong> {formData.lastName}</p>
										<p><strong>{t('form', 'email')}:</strong> {formData.email}</p>
										<p>
											<strong>{t('form', 'describes_you')}:</strong>
											{t(
												'form',
												userDescribe.find((o) => o.value === formData.userType)?.label || 'N/A'
											)}
										</p>
										{#if formData.userType === 'other'}
											<p>
												<strong>{t('form', 'other_description')}:</strong>
												{formData.otherDescription || 'N/A'}
											</p>
										{/if}
										{#if formData.userType === 'customer_barber'}
											<p>
												<strong>{t('form', 'visit_barber')}:</strong>
												{t(
													'form',
													barberVisit.find((o) => o.value === formData.visitFrequency)?.label ||
														'N/A'
												)}
											</p>
											<p>
												<strong>{t('form', 'barber_services')}:</strong>
												{formData.barberServices.join(', ') || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'choosing_barber')}:</strong>
												{formData.importantFactors.join(', ') || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'frustrations_barber')}:</strong>
												{formData.bookingFrustrations || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'feedback')}:</strong>
												{formData.generalMessage || 'N/A'}
											</p>
										{:else if formData.userType === 'customer_makeup'}
											<p>
												<strong>{t('form', 'makeup_questions')}:</strong>
												{formData.makeupOccasions.join(', ') || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'choosing_makeup_artist')}:</strong>
												{formData.importantFactors.join(', ') || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'frustrations_booking_makeup')}:</strong>
												{formData.bookingFrustrations || 'N/A'}
											</p>
											<p>
												<strong>{t('form', 'feedback')}:</strong>
												{formData.generalMessage || 'N/A'}
											</p>
										{:else if formData.userType === 'owner_barber'}
											<p>
												<strong>{t('form', 'charged_commission')}:</strong>
												{t(
													'form',
													commissionCharge.find((o) => o.value === formData.commissionPreference)
														?.label || 'N/A'
												)}
											</p>
											<p>
												<strong>{t('form', 'discounts_subscriptions')}:</strong>
												{t(
													'form',
													discountsSubscriptions.find((o) => o.value === formData.offerDiscounts)
														?.label || 'N/A'
												)}
											</p>
											<p>
												<strong>{t('form', 'managing_bookings')}:</strong>
												{formData.biggestChallenges || 'N/A'}
											</p>
										{:else if formData.userType === 'owner_makeup'}
											<p>
												<strong>{t('form', 'charged_commission')}:</strong>
												{t(
													'form',
													commissionCharge.find((o) => o.value === formData.commissionPreference)
														?.label || 'N/A'
												)}
											</p>
											<p>
												<strong>{t('form', 'features')}:</strong>
												{t(
													'form',
													makeupFeature.find((o) => o.value === formData.portfolioInterest)
														?.label || 'N/A'
												)}
											</p>
											<p>
												<strong>{t('form', 'managing_bookings')}:</strong>
												{formData.biggestChallenges || 'N/A'}
											</p>
										{:else if formData.userType === 'other'}
											<p>
												<strong>{t('form', 'other_description')}:</strong>
												{formData.otherDescription || 'N/A'}
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
						</div>
						<!-- Navigation Buttons -->
						<div class="mt-6 flex justify-between border-t border-gray-200 pt-5">
							<button
								type="button"
								on:click={prevStep}
								class="cta-button cta-button-secondary inline-flex cursor-pointer items-center rounded-lg focus:outline-none disabled:opacity-50 {currentStep ===
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
								{t('form', 'back')}
							</button>
							<div class="flex space-x-2">
								{#if currentStep < totalSteps}
									<button
										type="button"
										on:click={nextStep}
										class="cta-button cta-button-primary inline-flex cursor-pointer items-center rounded-lg bg-[rgba(59,130,246,0.1)] px-4 py-0 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-[rgba(59,130,246,0.2)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
									>
										{t('form', 'continue')}
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
										class="cta-button cta-button-primary inline-flex cursor-pointer items-center rounded-lg bg-[rgba(59,130,246,0.1)] px-4 py-0 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-[rgba(59,130,246,0.2)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
											{t('form', 'processing')}
										{:else}
											{t('form', 'submit')}
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
				<h3 id="confirmation-title" class="section-title mb-4 text-2xl font-bold">
					{t('form', 'thank_you')}
				</h3>
				<p id="confirmation-message" class="mb-2">
					{t('form', 'confirmation_email_sent', { email: formData.email })}
				</p>
				<p class="mb-6 text-gray-600">Check Inbox</p>
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
