<script lang="ts">
	import { APP_NAME } from '$lib/glue/config';

	export let title = '';
	export let layout: 'mobile-only' | 'aside-main' = 'mobile-only';
	export let noPadding = false;
</script>

<svelte:head>
	<title>{title ? `${title} | ` : ''}{APP_NAME}</title>
</svelte:head>
{#if layout === 'mobile-only'}
	<div class="flex justify-center">
		<div class="w-full {!noPadding && 'px-4'}">
			<slot />
		</div>
	</div>
{:else if layout === 'aside-main'}
	<!-- aside main layout: should only have 2 top level children -->
	<div class="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
		<slot />
	</div>
{/if}
