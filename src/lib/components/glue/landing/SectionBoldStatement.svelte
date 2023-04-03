<script lang="ts">
	import RadialGradient from './RadialGradient.svelte';

	export let overline: string = 'Our mission';
	export let heading: string = 'Give your schedulers a calendar not a list';
	export let desc: string =
		'I’ve written on why traditional “semantic class names” are the reason CSS is hard to maintain, but the truth is you’re never going to believe me until you actually try it. If you can suppress the urge to retch long enough to give it a chance, I really think you’ll wonder how you ever worked with CSS any other way.';
</script>

<section class="relative overflow-hidden px-8 py-16 text-center md:pt-48">
	<RadialGradient />
	<p class="text-lg font-bold text-primary">{overline}</p>
	<h2 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
		{heading}
	</h2>
	<p class="mx-auto mt-10 max-w-3xl text-lg text-base-content/70">
		{desc}
	</p>
</section>
