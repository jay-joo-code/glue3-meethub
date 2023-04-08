<script lang="ts">
	import IconLink from '$lib/icons/glue/IconLink.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	export let href: string = '';

	let linkInput;

	const copyLink = () => {
		linkInput.select();
		document.execCommand('copy');
		toast.push('✅ Link copied to clipboard');
	};
</script>

<div class="form-control mt-4 w-5/6">
	<button on:click={copyLink}>
		<label class="input-group-sm input-group cursor-pointer">
			<span class="bg-base-300 px-2 text-lg"><IconLink /></span>
			<input
				bind:this={linkInput}
				type="text"
				class="input-bordered input input-sm w-full cursor-pointer"
				value={href}
				readonly
			/>
		</label>
	</button>
</div>
