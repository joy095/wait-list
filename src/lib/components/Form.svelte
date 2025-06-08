<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { isFormOpen } from '$lib/store'; // Define the shape of your form data

	type FormData = {
		firstName: string;
		lastName: string;
		email: string;
		userType: string;
		otherDescription: string; // Customer (Barber)
		visitFrequency: string;
		barberServices: string[];
		importantFactors: string[];
		bookingFrustrations: string; // Customer (Makeup)
		makeupOccasions: string[]; // Owner
		commissionPreference: string;
		offerDiscounts: string;
		portfolioInterest: string;
		biggestChallenges: string;
	};

	let currentStep = 1;
	const totalSteps = 3; // Step 1: Details, Step 2: Role Questions, Step 3: Review
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
		biggestChallenges: ''
	};

	const progress = tweened(0, {
		duration: 500,
		easing: quintOut
	});

	$: $progress = (currentStep - 1) / (totalSteps - 1);
	let submitting = false;
	let formError: string | null = null;
	let showConfirmation = false;
	let formContainer: HTMLElement;
	$: isModalActive = $isFormOpen || showConfirmation; // --- Form Validation Logic (UPDATED) ---

	function validateCurrentStep(): boolean {
		formError = null; // Clear previous errors
		switch (currentStep) {
			case 1:
				if (!formData.firstName || !formData.lastName || !formData.email) {
					formError = 'Please fill in all personal information fields.';
					return false;
				}
				if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
					formError = 'Please enter a valid email address.';
					return false;
				}
				if (!formData.userType) {
					formError = 'Please select the option that best describes you.';
					return false;
				}
				return true; // --- NEW VALIDATION FOR STEP 2 ---

			case 2:
				const { userType } = formData;
				if (userType === 'customer_barber') {
					if (
						!formData.visitFrequency ||
						formData.barberServices.length === 0 ||
						formData.importantFactors.length === 0
					) {
						formError = 'Please answer all the required questions.';
						return false;
					}
				} else if (userType === 'customer_makeup') {
					if (formData.makeupOccasions.length === 0 || formData.importantFactors.length === 0) {
						formError = 'Please answer all the required questions.';
						return false;
					}
				} else if (userType === 'owner_barber') {
					if (!formData.commissionPreference || !formData.offerDiscounts) {
						formError = 'Please answer all the required questions.';
						return false;
					}
				} else if (userType === 'owner_makeup') {
					if (!formData.commissionPreference || !formData.portfolioInterest) {
						formError = 'Please answer all the required questions.';
						return false;
					}
				}
				return true; // All checks passed for this step

			case 3: // Review Step
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
		}
	}

	function prevStep() {
		formError = null;
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
			biggestChallenges: ''
		};
		currentStep = 1;
		formError = null;
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
			return; // Final check before submitting
		}
		submitting = true;
		formError = null;

		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				isFormOpen.set(false);
				showConfirmation = true;
			} else if (result.type === 'failure') {
				formError = result.data?.message || 'Submission failed. Please check your inputs.';
			} else if (result.type === 'error') {
				formError = result.error.message || 'An unexpected server error occurred.';
			}
			await update({ reset: false });
		};
	};
</script>

{#if isModalActive}
	<div
		class="backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 300 }}
	>
		{#if $isFormOpen}
			<div
				bind:this={formContainer}
				class="form-container relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white shadow-2xl"
				in:fly={{ y: 40, duration: 400, easing: quintOut }}
				out:fly={{ y: 40, duration: 300 }}
			>
				<button
					on:click={closeAllModals}
					class="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600"
					aria-label="Close form"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
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
				<div class="p-8">
					<h2 class="mb-6 text-center text-3xl font-bold text-gray-800">Tell Us About You</h2>
					<div class="mb-8">
						<div class="h-1.5 rounded-full bg-gray-100">
							<div
								class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
								style={`width: ${$progress * 100}%`}
							></div>
						</div>
						<p class="mt-2 text-right text-xs text-gray-500">Step {currentStep} of {totalSteps}</p>
					</div>
					<form method="POST" action="?/submitForm" use:enhance={submitAction}>
						<div class:hidden={currentStep !== 1} class="space-y-4" transition:fade>
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Details</h3>
							<div>
								<label for="firstName" class="label-style"
									>First Name <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									id="firstName"
									name="firstName"
									bind:value={formData.firstName}
									class="input-style w-full"
									placeholder="John"
								/>
							</div>
							<div>
								<label for="lastName" class="label-style"
									>Last Name <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									id="lastName"
									name="lastName"
									bind:value={formData.lastName}
									class="input-style w-full"
									placeholder="Doe"
								/>
							</div>
							<div>
								<label for="email" class="label-style"
									>Email <span class="text-red-500">*</span></label
								>
								<input
									type="email"
									id="email"
									name="email"
									bind:value={formData.email}
									class="input-style w-full"
									placeholder="john.doe@example.com"
								/>
							</div>
							<fieldset>
								<legend class="label-style"
									>Which best describes you? <span class="text-red-500">*</span></legend
								>
								<div class="mt-2 space-y-2">
									<label class="flex items-center">
										<input
											type="radio"
											name="userType"
											value="customer_barber"
											bind:group={formData.userType}
											class="mr-2"
										/>
										Customer looking for a Barber
									</label>
									<label class="flex items-center">
										<input
											type="radio"
											name="userType"
											value="customer_makeup"
											bind:group={formData.userType}
											class="mr-2"
										/>
										Customer looking for a Makeup Artist
									</label>
									<label class="flex items-center">
										<input
											type="radio"
											name="userType"
											value="owner_barber"
											bind:group={formData.userType}
											class="mr-2"
										/>
										Barber Shop Owner
									</label>
									<label class="flex items-center">
										<input
											type="radio"
											name="userType"
											value="owner_makeup"
											bind:group={formData.userType}
											class="mr-2"
										/>
										Makeup Artist (Independent)
									</label>
									<label class="flex items-center">
										<input
											type="radio"
											name="userType"
											value="other"
											bind:group={formData.userType}
											class="mr-2"
										/>
										Other
									</label>
									{#if formData.userType === 'other'}
										<input
											type="text"
											name="otherDescription"
											bind:value={formData.otherDescription}
											class="input-style mt-2 w-full"
											placeholder="Please specify"
										/>
									{/if}
								</div>
							</fieldset>
						</div>
						<div class:hidden={currentStep !== 2}>
							{#if formData.userType === 'customer_barber'}
								<div class="space-y-6" transition:fade>
									<h3 class="text-xl font-semibold text-gray-800">Barber Questions</h3>
									<fieldset>
										<legend class="label-style"
											>How often do you visit a barber shop? <span class="text-red-500">*</span
											></legend
										>
										<select
											name="visitFrequency"
											bind:value={formData.visitFrequency}
											class="input-style w-full"
										>
											<option value="" disabled>Select frequency...</option>
											<option value="weekly">Weekly</option>
											<option value="biweekly">Bi-weekly</option>
											<option value="monthly">Monthly</option>
											<option value="few-months">Every few months</option>
										</select>
									</fieldset>
									<fieldset>
										<legend class="label-style"
											>What services do you typically book? <span class="text-red-500">*</span
											></legend
										>
										<div class="mt-2 space-y-2">
											<label class="flex items-center"
												><input
													type="checkbox"
													name="barberServices"
													value="haircut"
													bind:group={formData.barberServices}
													class="mr-2"
												/> Haircut</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="barberServices"
													value="shave"
													bind:group={formData.barberServices}
													class="mr-2"
												/> Shave</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="barberServices"
													value="beard-trim"
													bind:group={formData.barberServices}
													class="mr-2"
												/> Beard Trim</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="barberServices"
													value="facial"
													bind:group={formData.barberServices}
													class="mr-2"
												/> Facial</label
											>
										</div>
									</fieldset>
									<fieldset>
										<legend class="label-style"
											>What's most important when choosing a barber? <span class="text-red-500"
												>*</span
											></legend
										>
										<div class="mt-2 space-y-2">
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="availability"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Availability</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="skill"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Barber's Skill</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="reviews"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Online Reviews</label
											>
										</div>
									</fieldset>
								</div>
							{/if}

							{#if formData.userType === 'customer_makeup'}
								<div class="space-y-6" transition:fade>
									<h3 class="text-xl font-semibold text-gray-800">Makeup Questions</h3>
									<fieldset>
										<legend class="label-style"
											>For what occasions do you book makeup services? <span class="text-red-500"
												>*</span
											></legend
										>
										<div class="mt-2 space-y-2">
											<label class="flex items-center"
												><input
													type="checkbox"
													name="makeupOccasions"
													value="wedding"
													bind:group={formData.makeupOccasions}
													class="mr-2"
												/> Wedding</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="makeupOccasions"
													value="event"
													bind:group={formData.makeupOccasions}
													class="mr-2"
												/> Party/Special Event</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="makeupOccasions"
													value="photoshoot"
													bind:group={formData.makeupOccasions}
													class="mr-2"
												/> Photoshoot</label
											>
										</div>
									</fieldset>
									<fieldset>
										<legend class="label-style"
											>What's most important when choosing a makeup artist? <span
												class="text-red-500">*</span
											></legend
										>
										<div class="mt-2 space-y-2">
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="portfolio"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Portfolio/Work</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="reviews"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Online Reviews</label
											>
											<label class="flex items-center"
												><input
													type="checkbox"
													name="importantFactors"
													value="specialization"
													bind:group={formData.importantFactors}
													class="mr-2"
												/> Artist's Specialization</label
											>
										</div>
									</fieldset>
								</div>
							{/if}

							{#if formData.userType === 'owner_barber'}
								<div class="space-y-6" transition:fade>
									<h3 class="text-xl font-semibold text-gray-800">Business Questions</h3>
									<fieldset>
										<legend class="label-style"
											>Would you use an app that charged commission? <span class="text-red-500"
												>*</span
											></legend
										>
										<select
											name="commissionPreference"
											bind:value={formData.commissionPreference}
											class="input-style w-full"
										>
											<option value="" disabled>Select a preference...</option>
											<option value="yes_5_10">Yes, 5-10%</option>
											<option value="yes_10_15">Yes, 10-15%</option>
											<option value="no_monthly_fee">No, prefer a flat monthly fee</option>
										</select>
									</fieldset>
									<fieldset>
										<legend class="label-style"
											>Are you open to offering discounts or subscriptions? <span
												class="text-red-500">*</span
											></legend
										>
										<select
											name="offerDiscounts"
											bind:value={formData.offerDiscounts}
											class="input-style w-full"
										>
											<option value="" disabled>Select an option...</option>
											<option value="yes_10_percent">Yes, discounts up to 10%</option>
											<option value="yes_20_percent">Yes, discounts up to 20%</option>
											<option value="yes_subscriptions">Yes, open to subscriptions</option>
											<option value="no">No, not at this time</option>
										</select>
									</fieldset>
									<div>
										<label for="biggestChallenges" class="label-style"
											>What is your biggest challenge in managing bookings?</label
										>
										<textarea
											id="biggestChallenges"
											name="biggestChallenges"
											bind:value={formData.biggestChallenges}
											rows="3"
											class="input-style w-full"
											placeholder="e.g., no-shows, attracting new clients..."
										></textarea>
									</div>
								</div>
							{/if}

							{#if formData.userType === 'owner_makeup'}
								<div class="space-y-6" transition:fade>
									<h3 class="text-xl font-semibold text-gray-800">Business Questions</h3>
									<fieldset>
										<legend class="label-style"
											>Would you use an app that charged commission? <span class="text-red-500"
												>*</span
											></legend
										>
										<select
											name="commissionPreference"
											bind:value={formData.commissionPreference}
											class="input-style w-full"
										>
											<option value="" disabled>Select a preference...</option>
											<option value="yes_5_10">Yes, 5-10%</option>
											<option value="yes_10_15">Yes, 10-15%</option>
											<option value="no_monthly_fee">No, prefer a flat monthly fee</option>
										</select>
									</fieldset>
									<fieldset>
										<legend class="label-style"
											>Would you use features to showcase your portfolio? <span class="text-red-500"
												>*</span
											></legend
										>
										<select
											name="portfolioInterest"
											bind:value={formData.portfolioInterest}
											class="input-style w-full"
										>
											<option value="" disabled>Select an option...</option>
											<option value="yes_high_priority">Yes, it's a top priority</option>
											<option value="yes_valuable">Yes, it would be valuable</option>
											<option value="no">No, not a priority</option>
										</select>
									</fieldset>
									<div>
										<label for="biggestChallenges" class="label-style"
											>What is your biggest challenge in managing your business?</label
										>
										<textarea
											id="biggestChallenges"
											name="biggestChallenges"
											bind:value={formData.biggestChallenges}
											rows="3"
											class="input-style w-full"
											placeholder="e.g., managing travel, client communication..."
										></textarea>
									</div>
								</div>
							{/if}
						</div>
						<div class:hidden={currentStep !== 3} class="space-y-4" transition:fade>
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Review Your Information</h3>
							<p><strong>First Name:</strong> {formData.firstName}</p>
							<p><strong>Last Name:</strong> {formData.lastName}</p>
							<p><strong>Email:</strong> {formData.email}</p>
							<p>
								<strong>User Type:</strong>
								{formData.userType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
							</p>
							{#if formData.userType === 'other'}
								<p><strong>Description:</strong> {formData.otherDescription}</p>
							{/if}

							{#if formData.userType === 'customer_barber'}
								<p><strong>Visit Frequency:</strong> {formData.visitFrequency}</p>
								<p><strong>Barber Services:</strong> {formData.barberServices.join(', ')}</p>
								<p>
									<strong>Important Factors (Barber):</strong>
									{formData.importantFactors.join(', ')}
								</p>
								<p>
									<strong>Booking Frustrations:</strong>
									{formData.bookingFrustrations || 'N/A'}
								</p>
							{:else if formData.userType === 'customer_makeup'}
								<p><strong>Makeup Occasions:</strong> {formData.makeupOccasions.join(', ')}</p>
								<p>
									<strong>Important Factors (Makeup):</strong>
									{formData.importantFactors.join(', ')}
								</p>
							{:else if formData.userType === 'owner_barber'}
								<p><strong>Commission Preference:</strong> {formData.commissionPreference}</p>
								<p><strong>Offer Discounts:</strong> {formData.offerDiscounts}</p>
								<p><strong>Biggest Challenges:</strong> {formData.biggestChallenges || 'N/A'}</p>
							{:else if formData.userType === 'owner_makeup'}
								<p><strong>Commission Preference:</strong> {formData.commissionPreference}</p>
								<p><strong>Portfolio Interest:</strong> {formData.portfolioInterest}</p>
								<p><strong>Biggest Challenges:</strong> {formData.biggestChallenges || 'N/A'}</p>
							{/if}
						</div>

						{#if formError}
							<div class="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700" transition:fade>
								{formError}
							</div>
						{/if}
						<div class="mt-8 flex justify-between border-t border-gray-200 pt-5">
							<button
								type="button"
								on:click={prevStep}
								class="btn-secondary"
								class:invisible={currentStep === 1}>Back</button
							>

							{#if currentStep < totalSteps}
								<button type="button" on:click={nextStep} class="btn-primary">Continue</button>
							{:else}
								<button type="submit" class="btn-submit" disabled={submitting}>
									{#if submitting}Processing...{:else}Submit{/if}
								</button>
							{/if}
						</div>
					</form>
				</div>
			</div>
		{:else if showConfirmation}
			<div
				class="form-container relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white p-8 text-center shadow-2xl"
				in:scale={{ duration: 400, start: 0.8 }}
				out:fade={{ duration: 300 }}
			>
				<h3 class="mb-4 text-2xl font-bold text-gray-800">Thank You!</h3>
				<p class="mb-6 text-gray-600">Your submission has been received.</p>
				<button on:click={closeAllModals} class="btn-primary">Close</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Basic styling for demonstration, adjust as needed */
	
</style>
