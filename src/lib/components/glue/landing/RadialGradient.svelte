<script lang="ts">
	export let placement: 'left' | 'right' = 'right';
</script>

<span
	class="bg-radial-gradient pointer-events-none absolute -top-6 hidden h-[500px] w-[500px] opacity-[.25] lg:inline-flex {placement ===
	'right'
		? 'right-[-20%] xl:right-0'
		: 'left-[-20%] xl:left-0'}"
/>

<style>
	.bg-radial-gradient {
		background-image: radial-gradient(
			50% 50% at 50% 50%,
			hsl(var(--p)) 0%,
			rgba(255, 255, 255, 0) 100%
		);
	}
</style>
