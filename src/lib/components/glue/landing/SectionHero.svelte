<script>
	import IconRightArrowLong from '$lib/icons/glue/IconRightArrowLong.svelte';
	import RadialGradient from './RadialGradient.svelte';
</script>

<div class="relative mx-auto w-full">
	<div class="bg-beams absolute inset-0 bottom-10 z-0 bg-bottom bg-no-repeat opacity-70" />
	<RadialGradient placement="left" />
	<div class="relative z-10 px-6 py-16 lg:py-28">
		<h2
			class="tracking-snug  text-center text-4xl font-black leading-snug sm:text-5xl sm:leading-snug md:text-6xl md:leading-snug lg:text-7xl lg:leading-tight"
		>
			<span>The thoughtful way</span>
			<br class="hidden sm:block" />
			<span class="text-gradient">to find a time to meet</span>
		</h2>
		<p
			class="text-md mt-6 text-center leading-normal text-base-content/70 sm:text-lg md:text-xl md:leading-normal lg:text-xl lg:leading-9 lg:tracking-tight"
		>
			<span
				>You’ll love it for the advanced features to keep you in control of your calendar.
			</span>
			<br class="hidden md:block" />
			<span>They’ll love it for the personalized scheduling experience.</span>
		</p>
		<div class="mt-8 flex justify-center">
			<button class="btn-primary btn-lg btn gap-2 rounded-full px-10"
				>Get started<span class="text-2xl"><IconRightArrowLong /></span></button
			>
		</div>
	</div>
</div>

<style>
	.light .bg-beams {
		background-image: url(https://tailwindcss.com/_next/static/media/hero@75.b2469a49.jpg);
		background-size: 150rem;
	}

	.dark .bg-beams {
		background-image: url(https://tailwindcss.com/_next/static/media/hero-dark@90.dba36cdf.jpg);
		background-size: 150rem;
	}
</style>
