<script lang="ts">
	const faqData = [
		{
			id: '1',
			question: 'How does make booking easier?',
			answer:
				'Users can view real-time schedules, book instantly, and manage appointments in a few clicks. Shop owners get a simple dashboard to control their timetable and attract new clients.'
		},
		{
			id: '2',
			question: 'When will launch?',
			answer:
				'We’re targeting a launch in Q3 2025. Join the waitlist to get exclusive updates and early access!'
		},
		{
			id: '3',
			question: 'Is booking free for users?',
			answer: 'Absolutely! Booking your barber or makeup artist is always free for users.'
		},
		{
			id: '4',
			question: 'What is the commission rate for shop owners?',
			answer:
				'Shop owners enjoy an initial low commission rate designed to help you keep more of your earnings.'
		},
		{
			id: '5',
			question: 'Why should I join the waitlist?',
			answer:
				'By joining, you’ll be the first to experience our platform, provide feedback to shape its future, low commission rate, and enjoy a seamless booking experience with no commitment.'
		},
		{
			id: '6',
			question: 'Can shop owners set their own prices and schedules?',
			answer:
				'Yes! Shop owners have full control to set prices, customize availability, and manage bookings to fit their business needs.'
		}
	];

	let activeFaq = -1;

	const toggleFaq = (index: number) => {
		activeFaq = activeFaq === index ? -1 : index;
	};
</script>

<section class="faq-section content-section py-20 md:py-32">
	<div class="container mx-auto max-w-4xl px-6 text-center">
		<h2 class="section-title mb-4 text-4xl md:text-5xl">Your Questions, Answered</h2>
		<p class="section-subtitle">
			We've compiled answers to the most common questions. If you have others, feel free to reach
			out to our team.
		</p>
		<div class="mt-10 text-left">
			{#each faqData as faq, i}
				<div class="faq-item" on:click={() => toggleFaq(i)}>
					<div class="faq-question">
						<span>{faq.question}</span>
						<svg
							class="faq-icon h-6 w-6"
							class:active={activeFaq === i}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</div>
					<div class="faq-answer" class:active={activeFaq === i}>
						<p>{faq.answer}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.section-title {
		font-family: 'Playfair Display', serif;
		background: linear-gradient(135deg, #ffd700, #f0c24a, #e6ac00);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: 700;
	}

	.section-subtitle {
		color: #d1d5db;
		max-width: 650px;
		margin: 1rem auto 2.5rem;
		font-size: 1.125rem;
		line-height: 1.75;
	}

	.content-section {
		position: relative;
		z-index: 3;
	}

	.faq-answer {
		color: #d1d5db;
	}

	/* FAQ Accordion */
	.faq-item {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		margin-bottom: 1rem;
		overflow: hidden;
		transition: background 0.3s ease;
	}
	.faq-item:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.faq-question {
		padding: 1.5rem;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		color: #fff;
	}
	.faq-answer {
		max-height: 0;
		overflow: hidden;
		transition:
			max-height 0.5s ease-out,
			padding 0.5s ease-out;
		padding: 0 1.5rem;
	}
	.faq-answer.active {
		max-height: 200px;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}
	.faq-icon {
		transition: transform 0.3s ease-in-out;
	}
	.faq-icon.active {
		transform: rotate(180deg);
	}
</style>
